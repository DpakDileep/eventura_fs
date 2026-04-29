from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Email is required")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = [("organizer", "Organizer"), ("attendee", "Attendee")]

    email = models.EmailField(unique=True)
    firstName = models.CharField(max_length=100)
    lastName = models.CharField(max_length=100)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="attendee")
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["firstName", "lastName"]

    objects = UserManager()

    def __str__(self):
        return self.email


class Event(models.Model):
    CATEGORY_CHOICES = [
        ("tech", "Tech"),
        ("music", "Music"),
        ("comedy", "Comedy"),
        ("gaming", "Gaming"),
        ("dance", "Dance"),
        ("party", "Party"),
        ("other", "Other"),
    ]

    title = models.CharField(max_length=255)
    organizer = models.CharField(max_length=255)
    imageUrl = models.URLField(max_length=1000)
    date = models.CharField(max_length=100)
    time = models.CharField(max_length=100)
    location = models.CharField(max_length=255)
    email = models.EmailField()
    price = models.CharField(max_length=50)
    capacity = models.PositiveIntegerField()
    available_capacity = models.PositiveIntegerField()
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    description = models.TextField()
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name="events")
    created_at = models.DateTimeField(auto_now_add=True)

    # Seating layout config — stored as JSON, e.g.:
    # {
    #   "num_rows": 8,
    #   "seats_per_row": 12,
    #   "row_labels": ["A","B","C","D","E","F","G","H"],
    #   "aisles_after_seats": [4, 8],   # aisle gaps after seat number 4 and 8 in every row
    #   "general_admission": false
    # }
    seat_layout = models.JSONField(default=dict, blank=True)

    def save(self, *args, **kwargs):
        if not self.pk:
            self.available_capacity = self.capacity
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


class Ticket(models.Model):
    STATUS_CHOICES = [
        ("confirmed", "Confirmed"),
        ("cancelled", "Cancelled"),
    ]
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name="tickets")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="tickets")
    quantity = models.PositiveIntegerField()
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    seat_numbers = models.CharField(max_length=500, blank=True, default="")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="confirmed")
    cancelled_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.email} - {self.event.title} x{self.quantity} [{self.status}]"


class SeatMap(models.Model):
    event = models.OneToOneField(Event, on_delete=models.CASCADE, related_name="seat_map")
    seats = models.JSONField(default=dict)

    def __str__(self):
        return f"SeatMap for {self.event.title}"


class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="notifications")
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Notification for {self.user.email}: {self.message[:50]}"
