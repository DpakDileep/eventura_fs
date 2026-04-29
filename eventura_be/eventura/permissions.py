from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsOrganizer(BasePermission):
    """Only users with role='organizer' can access."""
    message = "Only organizers are allowed to perform this action."

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == "organizer"
        )


class IsEventOwner(BasePermission):
    """Only the organizer who created the event can edit/delete it."""
    message = "You do not have permission to modify this event."

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        return obj.created_by == request.user


class IsAttendee(BasePermission):
    """Only users with role='attendee' can book tickets."""
    message = "Only attendees can book tickets."

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == "attendee"
        )
