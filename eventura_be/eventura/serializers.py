from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Event, Ticket, Notification, SeatMap

User = get_user_model()


# ─────────────────────────────────────────────
# AUTH SERIALIZERS
# ─────────────────────────────────────────────

class SignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ["id", "firstName", "lastName", "email", "password", "role"]

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "firstName", "lastName", "email", "role"]


# ─────────────────────────────────────────────
# EVENT SERIALIZERS
# ─────────────────────────────────────────────

class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = [
            "id", "title", "organizer", "imageUrl", "date", "time",
            "location", "email", "price", "capacity", "available_capacity",
            "category", "description", "seat_layout", "created_by",
        ]
        read_only_fields = ["id", "available_capacity", "created_by"]

    def create(self, validated_data):
        validated_data["created_by"] = self.context["request"].user
        validated_data["available_capacity"] = validated_data["capacity"]
        return super().create(validated_data)

    def update(self, instance, validated_data):
        # Recalculate available capacity if capacity changes
        if "capacity" in validated_data:
            booked = instance.capacity - instance.available_capacity
            instance.available_capacity = max(0, validated_data["capacity"] - booked)
        return super().update(instance, validated_data)


# ─────────────────────────────────────────────
# TICKET SERIALIZERS
# ─────────────────────────────────────────────

class TicketBookSerializer(serializers.Serializer):
    eventId = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1)

    def validate(self, data):
        try:
            event = Event.objects.get(id=data["eventId"])
        except Event.DoesNotExist:
            raise serializers.ValidationError("Event not found.")

        if data["quantity"] > event.available_capacity:
            raise serializers.ValidationError(
                f"Only {event.available_capacity} seats available."
            )
        data["event"] = event
        return data


class MyTicketSerializer(serializers.ModelSerializer):
    """Returns ticket data in the exact shape the frontend expects."""
    ticketId = serializers.IntegerField(source="id")
    eventId = serializers.IntegerField(source="event.id")
    eventTitle = serializers.CharField(source="event.title")
    eventDate = serializers.CharField(source="event.date")
    eventTime = serializers.CharField(source="event.time")
    eventLocation = serializers.CharField(source="event.location")
    eventImage = serializers.CharField(source="event.imageUrl")
    eventPrice = serializers.CharField(source="event.price")
    eventOrganizer = serializers.CharField(source="event.organizer")
    userEmail = serializers.EmailField(source="user.email")
    userFirstName = serializers.CharField(source="user.firstName")
    userLastName = serializers.CharField(source="user.lastName")
    totalPrice = serializers.DecimalField(source="total_price", max_digits=10, decimal_places=2)
    seatNumbers = serializers.CharField(source="seat_numbers")

    class Meta:
        model = Ticket
        fields = [
            "ticketId", "eventId", "eventTitle", "eventDate", "eventTime",
            "eventLocation", "eventImage", "eventPrice", "eventOrganizer",
            "userEmail", "userFirstName", "userLastName", "quantity",
            "totalPrice", "seatNumbers", "status",
        ]


# ─────────────────────────────────────────────
# SEAT MAP SERIALIZER
# ─────────────────────────────────────────────

class SeatMapSerializer(serializers.ModelSerializer):
    class Meta:
        model = SeatMap
        fields = ["seats"]


# ─────────────────────────────────────────────
# DASHBOARD SERIALIZERS
# ─────────────────────────────────────────────

class DashboardEventSerializer(serializers.ModelSerializer):
    attendee_count = serializers.SerializerMethodField()
    total_revenue = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = [
            "id", "title", "organizer", "imageUrl", "date", "time",
            "location", "email", "price", "capacity", "available_capacity",
            "category", "description", "attendee_count", "total_revenue",
        ]

    def get_attendee_count(self, obj):
        return sum(t.quantity for t in obj.tickets.all())

    def get_total_revenue(self, obj):
        total = sum(float(t.total_price) for t in obj.tickets.all())
        return total


# ─────────────────────────────────────────────
# ATTENDEE LIST SERIALIZER (for organizer view)
# ─────────────────────────────────────────────

class AttendeeSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    email = serializers.EmailField(source="user.email")
    ticketId = serializers.IntegerField(source="id")
    seat_numbers = serializers.CharField()

    class Meta:
        model = Ticket
        fields = ["ticketId", "name", "email", "quantity", "seat_numbers", "status"]

    def get_name(self, obj):
        return f"{obj.user.firstName} {obj.user.lastName}"


# ─────────────────────────────────────────────
# NOTIFICATION SERIALIZER
# ─────────────────────────────────────────────

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ["id", "message", "is_read", "created_at"]
