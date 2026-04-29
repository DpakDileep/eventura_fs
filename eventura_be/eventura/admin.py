from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Event, Ticket, Notification


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ("email", "firstName", "lastName", "role", "is_active", "is_staff")
    list_filter = ("role", "is_active", "is_staff")
    search_fields = ("email", "firstName", "lastName")
    ordering = ("email",)
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Personal Info", {"fields": ("firstName", "lastName", "role")}),
        ("Permissions", {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
    )
    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("email", "firstName", "lastName", "role", "password1", "password2"),
        }),
    )


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ("title", "organizer", "category", "date", "capacity", "available_capacity", "created_by")
    list_filter = ("category",)
    search_fields = ("title", "organizer", "location")


@admin.register(Ticket)
class TicketAdmin(admin.ModelAdmin):
    list_display = ("event", "user", "quantity", "total_price", "created_at")
    list_filter = ("event",)
    search_fields = ("user__email", "event__title")


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ("user", "message", "is_read", "created_at")
    list_filter = ("is_read",)
    search_fields = ("user__email", "message")
