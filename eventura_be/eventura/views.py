import logging
from django.db import transaction
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Event, Ticket, Notification, SeatMap
from .permissions import IsOrganizer, IsEventOwner, IsAttendee
from .email_utils import send_booking_confirmation
from .serializers import (
    SignupSerializer, UserSerializer, EventSerializer,
    TicketBookSerializer, MyTicketSerializer,
    DashboardEventSerializer, AttendeeSerializer,
    NotificationSerializer, SeatMapSerializer,
)

logger = logging.getLogger(__name__)

DEFAULT_ROWS = ["A", "B", "C", "D", "E", "F", "G", "H"]
DEFAULT_COLS = 10


def _get_layout(event):
    layout = event.seat_layout or {}
    num_rows = int(layout.get("num_rows", 8))
    seats_per_row = int(layout.get("seats_per_row", 10))
    default_labels = [chr(65 + i) for i in range(num_rows)]
    row_labels = layout.get("row_labels", default_labels)[:num_rows]
    aisles_after = [int(x) for x in layout.get("aisles_after_seats", [])]
    general_admission = bool(layout.get("general_admission", False))
    return {
        "num_rows": num_rows,
        "seats_per_row": seats_per_row,
        "row_labels": row_labels,
        "aisles_after_seats": aisles_after,
        "general_admission": general_admission,
    }


def _generate_seats(event):
    layout = _get_layout(event)
    if layout["general_admission"]:
        return {}
    seats = {}
    for row in layout["row_labels"]:
        for col in range(1, layout["seats_per_row"] + 1):
            seats[f"{row}{col}"] = "available"
    return seats


def _get_or_create_seat_map(event):
    seat_map, created = SeatMap.objects.get_or_create(event=event)
    if created or not seat_map.seats:
        seat_map.seats = _generate_seats(event)
        seat_map.save()
    return seat_map


def _parse_unit_price(price_str):
    if price_str.strip().lower() == "free":
        return 0.0
    cleaned = price_str.replace("₹", "").replace(",", "").strip()
    try:
        return float(cleaned)
    except ValueError:
        return 0.0


# ─────────────────────────────────────────────
# AUTH
# ─────────────────────────────────────────────

class SignupView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = SignupSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                "user": UserSerializer(user).data,
                "access": str(refresh.access_token),
                "refresh": str(refresh),
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        from django.contrib.auth import authenticate
        email = request.data.get("email", "").strip()
        password = request.data.get("password", "")
        user = authenticate(request, username=email, password=password)
        if user is None:
            return Response({"detail": "Invalid email or password."}, status=status.HTTP_401_UNAUTHORIZED)
        refresh = RefreshToken.for_user(user)
        return Response({
            "user": UserSerializer(user).data,
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        })


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            token = RefreshToken(request.data.get("refresh"))
            token.blacklist()
            return Response({"detail": "Logged out successfully."})
        except Exception:
            return Response({"detail": "Invalid token."}, status=status.HTTP_400_BAD_REQUEST)


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)


# ─────────────────────────────────────────────
# EVENTS
# ─────────────────────────────────────────────

class EventListCreateView(APIView):
    def get_permissions(self):
        if self.request.method == "GET":
            return [AllowAny()]
        return [IsAuthenticated(), IsOrganizer()]

    def get(self, request):
        events = Event.objects.all()
        if t := request.query_params.get("title"):
            events = events.filter(title__icontains=t)
        if loc := request.query_params.get("location"):
            events = events.filter(location__icontains=loc)
        if cat := request.query_params.get("category"):
            events = events.filter(category__iexact=cat)
        return Response(EventSerializer(events, many=True).data)

    def post(self, request):
        serializer = EventSerializer(data=request.data, context={"request": request})
        if serializer.is_valid():
            event = serializer.save()
            _get_or_create_seat_map(event)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class EventDetailView(APIView):
    def get_permissions(self):
        if self.request.method == "GET":
            return [AllowAny()]
        return [IsAuthenticated(), IsOrganizer(), IsEventOwner()]

    def get_object(self, pk):
        try:
            return Event.objects.get(pk=pk)
        except Event.DoesNotExist:
            return None

    def get(self, request, pk):
        event = self.get_object(pk)
        if not event:
            return Response({"detail": "Event not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response(EventSerializer(event).data)

    def put(self, request, pk):
        event = self.get_object(pk)
        if not event:
            return Response({"detail": "Event not found."}, status=status.HTTP_404_NOT_FOUND)
        self.check_object_permissions(request, event)
        s = EventSerializer(event, data=request.data, context={"request": request})
        if s.is_valid():
            s.save()
            return Response(s.data)
        return Response(s.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, pk):
        event = self.get_object(pk)
        if not event:
            return Response({"detail": "Event not found."}, status=status.HTTP_404_NOT_FOUND)
        self.check_object_permissions(request, event)
        old_layout = event.seat_layout
        s = EventSerializer(event, data=request.data, partial=True, context={"request": request})
        if s.is_valid():
            updated_event = s.save()
            # Regenerate seat map if layout config changed (only free seats affected)
            if "seat_layout" in request.data and request.data["seat_layout"] != old_layout:
                try:
                    seat_map = SeatMap.objects.get(event=updated_event)
                    new_seats = _generate_seats(updated_event)
                    # Preserve taken seats that still exist in new layout
                    for seat_id, state in seat_map.seats.items():
                        if state == "taken" and seat_id in new_seats:
                            new_seats[seat_id] = "taken"
                    seat_map.seats = new_seats
                    seat_map.save()
                except SeatMap.DoesNotExist:
                    _get_or_create_seat_map(updated_event)
            return Response(s.data)
        return Response(s.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        event = self.get_object(pk)
        if not event:
            return Response({"detail": "Event not found."}, status=status.HTTP_404_NOT_FOUND)
        self.check_object_permissions(request, event)
        event.delete()
        return Response({"detail": "Event deleted successfully."}, status=status.HTTP_204_NO_CONTENT)


# ─────────────────────────────────────────────
# SEAT MAP
# ─────────────────────────────────────────────

class SeatMapView(APIView):
    """GET /events/<pk>/seats/ — returns seat availability for an event."""

    def get_permissions(self):
        return [AllowAny()]

    def get(self, request, pk):
        try:
            event = Event.objects.get(pk=pk)
        except Event.DoesNotExist:
            return Response({"detail": "Event not found."}, status=status.HTTP_404_NOT_FOUND)
        layout = _get_layout(event)
        seat_map = _get_or_create_seat_map(event)
        return Response({
            "eventId": event.id,
            "layout": layout,
            "seats": seat_map.seats,
        })


# ─────────────────────────────────────────────
# TICKETS
# ─────────────────────────────────────────────

class BookTicketView(APIView):
    permission_classes = [IsAuthenticated, IsAttendee]

    @transaction.atomic
    def post(self, request):
        serializer = TicketBookSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        event = serializer.validated_data["event"]
        quantity = serializer.validated_data["quantity"]
        selected_seats = request.data.get("selectedSeats", [])

        event.refresh_from_db()
        if quantity > event.available_capacity:
            return Response(
                {"detail": f"Only {event.available_capacity} seats available."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Validate and lock seats
        if selected_seats:
            if len(selected_seats) != quantity:
                return Response(
                    {"detail": f"Please select exactly {quantity} seat(s)."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            seat_map = _get_or_create_seat_map(event)
            for seat in selected_seats:
                if seat_map.seats.get(seat) != "available":
                    return Response(
                        {"detail": f"Seat {seat} is no longer available. Please choose another."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
            for seat in selected_seats:
                seat_map.seats[seat] = "taken"
            seat_map.save()

        unit_price = _parse_unit_price(event.price)
        total_price = unit_price * quantity

        event.available_capacity -= quantity
        event.save()

        ticket = Ticket.objects.create(
            event=event,
            user=request.user,
            quantity=quantity,
            total_price=total_price,
            seat_numbers=",".join(selected_seats) if selected_seats else "",
            status="confirmed",
        )

        seat_info = f" (Seats: {', '.join(selected_seats)})" if selected_seats else ""
        Notification.objects.create(
            user=request.user,
            message=f"Your ticket for '{event.title}' has been booked!{seat_info} ({quantity} ticket(s))",
        )

        try:
            t = Ticket.objects.select_related("user", "event").get(pk=ticket.pk)
            send_booking_confirmation(t)
        except Exception as e:
            logger.error(f"Email send failed: {e}")

        return Response(
            MyTicketSerializer(Ticket.objects.select_related("user", "event").get(pk=ticket.pk)).data,
            status=status.HTTP_201_CREATED,
        )


class MyTicketsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        tickets = Ticket.objects.filter(
            user=request.user
        ).select_related("event", "user").order_by("-created_at")
        return Response(MyTicketSerializer(tickets, many=True).data)


class CancelTicketView(APIView):
    """PATCH /tickets/<pk>/cancel/ — cancel a confirmed ticket."""
    permission_classes = [IsAuthenticated, IsAttendee]

    @transaction.atomic
    def patch(self, request, pk):
        try:
            ticket = Ticket.objects.select_related("event", "user").get(pk=pk, user=request.user)
        except Ticket.DoesNotExist:
            return Response({"detail": "Ticket not found."}, status=status.HTTP_404_NOT_FOUND)

        if ticket.status == "cancelled":
            return Response({"detail": "This ticket is already cancelled."}, status=status.HTTP_400_BAD_REQUEST)

        ticket.status = "cancelled"
        ticket.cancelled_at = timezone.now()
        ticket.save()

        event = ticket.event
        event.available_capacity += ticket.quantity
        event.save()

        # Free seat map slots
        if ticket.seat_numbers:
            seats = [s.strip() for s in ticket.seat_numbers.split(",") if s.strip()]
            try:
                seat_map = SeatMap.objects.get(event=event)
                for seat in seats:
                    if seat in seat_map.seats:
                        seat_map.seats[seat] = "available"
                seat_map.save()
            except SeatMap.DoesNotExist:
                pass

        Notification.objects.create(
            user=request.user,
            message=f"Your ticket for '{event.title}' has been cancelled successfully.",
        )

        return Response({
            "detail": "Ticket cancelled successfully.",
            "ticket": MyTicketSerializer(ticket).data,
        })


# ─────────────────────────────────────────────
# DASHBOARD
# ─────────────────────────────────────────────

class DashboardView(APIView):
    permission_classes = [IsAuthenticated, IsOrganizer]

    def get(self, request):
        events = Event.objects.filter(created_by=request.user).prefetch_related("tickets")
        return Response({"events": DashboardEventSerializer(events, many=True).data})


class EventAttendeesView(APIView):
    permission_classes = [IsAuthenticated, IsOrganizer]

    def get(self, request, pk):
        try:
            event = Event.objects.get(pk=pk, created_by=request.user)
        except Event.DoesNotExist:
            return Response({"detail": "Event not found."}, status=status.HTTP_404_NOT_FOUND)
        tickets = Ticket.objects.filter(event=event, status="confirmed").select_related("user")
        return Response(AttendeeSerializer(tickets, many=True).data)


# ─────────────────────────────────────────────
# NOTIFICATIONS
# ─────────────────────────────────────────────

class NotificationListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        notifications = Notification.objects.filter(user=request.user)
        unread_count = notifications.filter(is_read=False).count()
        return Response({
            "notifications": NotificationSerializer(notifications, many=True).data,
            "unread_count": unread_count,
        })


class NotificationMarkReadView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        try:
            n = Notification.objects.get(pk=pk, user=request.user)
        except Notification.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        n.is_read = True
        n.save()
        return Response(NotificationSerializer(n).data)

    def delete(self, request, pk):
        try:
            n = Notification.objects.get(pk=pk, user=request.user)
        except Notification.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        n.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
