from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    SignupView, LoginView, LogoutView, MeView,
    EventListCreateView, EventDetailView, SeatMapView,
    BookTicketView, MyTicketsView, CancelTicketView,
    DashboardView, EventAttendeesView,
    NotificationListView, NotificationMarkReadView,
)

urlpatterns = [
    # ── Auth ──────────────────────────────────────────
    path("auth/signup/",        SignupView.as_view(),       name="signup"),
    path("auth/login/",         LoginView.as_view(),        name="login"),
    path("auth/logout/",        LogoutView.as_view(),       name="logout"),
    path("auth/refresh/",       TokenRefreshView.as_view(), name="token_refresh"),
    path("auth/me/",            MeView.as_view(),           name="me"),

    # ── Events ────────────────────────────────────────
    path("events/",             EventListCreateView.as_view(), name="event-list-create"),
    path("events/<int:pk>/",    EventDetailView.as_view(),     name="event-detail"),
    path("events/<int:pk>/seats/",    SeatMapView.as_view(),       name="event-seats"),
    path("events/<int:pk>/attendees/", EventAttendeesView.as_view(), name="event-attendees"),

    # ── Tickets ───────────────────────────────────────
    path("tickets/book/",              BookTicketView.as_view(),   name="ticket-book"),
    path("tickets/my/",                MyTicketsView.as_view(),    name="my-tickets"),
    path("tickets/<int:pk>/cancel/",   CancelTicketView.as_view(), name="ticket-cancel"),

    # ── Dashboard ─────────────────────────────────────
    path("dashboard/",          DashboardView.as_view(),    name="dashboard"),

    # ── Notifications ─────────────────────────────────
    path("notifications/",              NotificationListView.as_view(),    name="notifications"),
    path("notifications/<int:pk>/read/", NotificationMarkReadView.as_view(), name="notification-read"),
]
