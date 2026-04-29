"""
email_utils.py — Booking confirmation email with seat info.
"""

from django.core.mail import EmailMultiAlternatives
from django.conf import settings
import logging

logger = logging.getLogger(__name__)


def send_booking_confirmation(ticket):
    user = ticket.user
    event = ticket.event

    price_display = (
        "Free"
        if str(ticket.total_price) in ("0", "0.00")
        else f"&#8377;{float(ticket.total_price):,.0f}"
    )

    seats_list = (
        [s.strip() for s in ticket.seat_numbers.split(",") if s.strip()]
        if ticket.seat_numbers
        else []
    )
    seats_display = ", ".join(seats_list) if seats_list else "General Admission"
    seat_line_text = f"Seats   : {seats_display}"

    # ── Plain text ─────────────────────────────────────────────────────────────
    text_body = f"""
Hi {user.firstName},

Your ticket has been confirmed! Here are your booking details:

Event   : {event.title}
Date    : {event.date}
Time    : {event.time}
Venue   : {event.location}
Tickets : {ticket.quantity}
Seats   : {seats_display}
Total   : {price_display}
Ticket ID: #{ticket.id}

See you there!
— The Eventura Team
"""

    # ── Seats HTML row (only shown when seats are assigned) ────────────────────
    seats_html_row = ""
    if seats_list:
        seat_badges = "".join(
            f'<span style="display:inline-block;background:#212529;color:#fff;'
            f'font-size:12px;font-weight:700;padding:3px 9px;border-radius:5px;margin:2px;">'
            f'{s}</span>'
            for s in seats_list
        )
        seats_html_row = f"""
                <tr>
                  <td colspan="2" style="padding:14px 20px;border-top:1px solid #f0f0f0;">
                    <span style="font-size:13px;color:#666;display:block;margin-bottom:6px;">
                      Your Seats
                    </span>
                    <div>{seat_badges}</div>
                  </td>
                </tr>"""

    # ── HTML email ─────────────────────────────────────────────────────────────
    html_body = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Booking Confirmed</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:40px 0;">
    <tr><td align="center">

      <table width="600" cellpadding="0" cellspacing="0"
        style="background:#fff;border-radius:12px;overflow:hidden;
               box-shadow:0 4px 24px rgba(0,0,0,.10);max-width:600px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:#212529;padding:32px 40px;text-align:center;">
            <h1 style="color:#fff;margin:0;font-size:26px;font-weight:800;letter-spacing:-.5px;">
              Eventura
            </h1>
            <p style="color:#adb5bd;margin:6px 0 0;font-size:13px;letter-spacing:1px;
                      text-transform:uppercase;">
              Event Ticket Confirmation
            </p>
          </td>
        </tr>

        <!-- Hero image -->
        {"" if not event.imageUrl else f'''
        <tr>
          <td style="padding:0;">
            <img src="{event.imageUrl}" alt="{event.title}"
                 style="width:100%;height:200px;object-fit:cover;display:block;"/>
          </td>
        </tr>
        '''}

        <!-- Greeting -->
        <tr>
          <td style="padding:36px 40px 0;">
            <h2 style="margin:0 0 8px;font-size:22px;color:#212529;font-weight:700;">
              You're going, {user.firstName}! &#127881;
            </h2>
            <p style="margin:0;color:#6c757d;font-size:15px;line-height:1.6;">
              Your booking is confirmed. Here's everything you need to know.
            </p>
          </td>
        </tr>

        <!-- Event info -->
        <tr>
          <td style="padding:28px 40px;">
            <table width="100%" cellpadding="0" cellspacing="0"
              style="background:#f8f9fa;border-radius:10px;border:1px solid #e9ecef;">
              <tr><td style="padding:20px 24px;">
                <h3 style="margin:0 0 16px;font-size:17px;font-weight:700;color:#212529;">
                  {event.title}
                </h3>
                <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:10px;">
                  <tr>
                    <td width="28"><span style="font-size:16px;">&#128197;</span></td>
                    <td>
                      <span style="font-size:14px;color:#495057;font-weight:600;">Date</span><br/>
                      <span style="font-size:14px;color:#212529;">{event.date}</span>
                    </td>
                  </tr>
                </table>
                <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:10px;">
                  <tr>
                    <td width="28"><span style="font-size:16px;">&#128336;</span></td>
                    <td>
                      <span style="font-size:14px;color:#495057;font-weight:600;">Time</span><br/>
                      <span style="font-size:14px;color:#212529;">{event.time}</span>
                    </td>
                  </tr>
                </table>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td width="28"><span style="font-size:16px;">&#128205;</span></td>
                    <td>
                      <span style="font-size:14px;color:#495057;font-weight:600;">Venue</span><br/>
                      <span style="font-size:14px;color:#212529;">{event.location}</span>
                    </td>
                  </tr>
                </table>
              </td></tr>
            </table>
          </td>
        </tr>

        <!-- Ticket summary -->
        <tr>
          <td style="padding:0 40px 28px;">
            <table width="100%" cellpadding="0" cellspacing="0"
              style="border-radius:10px;overflow:hidden;border:2px dashed #dee2e6;">
              <tr style="background:#212529;">
                <td colspan="2" style="padding:12px 20px;">
                  <span style="color:#adb5bd;font-size:11px;text-transform:uppercase;
                               letter-spacing:1px;font-weight:600;">
                    Ticket Details
                  </span>
                </td>
              </tr>
              <tr>
                <td style="padding:14px 20px;border-bottom:1px solid #f0f0f0;">
                  <span style="font-size:13px;color:#666;">Ticket ID</span><br/>
                  <strong style="font-size:15px;color:#212529;font-family:monospace;">
                    #{ticket.id}
                  </strong>
                </td>
                <td style="padding:14px 20px;border-bottom:1px solid #f0f0f0;text-align:right;">
                  <span style="font-size:13px;color:#666;">Quantity</span><br/>
                  <strong style="font-size:15px;color:#212529;">
                    {ticket.quantity} ticket{"s" if ticket.quantity > 1 else ""}
                  </strong>
                </td>
              </tr>
              <tr>
                <td style="padding:14px 20px;">
                  <span style="font-size:13px;color:#666;">Name</span><br/>
                  <strong style="font-size:15px;color:#212529;">
                    {user.firstName} {user.lastName}
                  </strong>
                </td>
                <td style="padding:14px 20px;text-align:right;">
                  <span style="font-size:13px;color:#666;">Total Paid</span><br/>
                  <strong style="font-size:18px;color:#0d6efd;">{price_display}</strong>
                </td>
              </tr>
              {seats_html_row}
            </table>
          </td>
        </tr>

        <!-- Contact -->
        <tr>
          <td style="padding:0 40px 28px;">
            <p style="margin:0;font-size:13px;color:#6c757d;">
              Questions? Contact the organizer at
              <a href="mailto:{event.email}" style="color:#0d6efd;font-weight:600;">
                {event.email}
              </a>
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f8f9fa;padding:20px 40px;text-align:center;
                     border-top:1px solid #e9ecef;">
            <p style="margin:0;font-size:12px;color:#adb5bd;">
              &copy; 2026 Eventura. All rights reserved.<br/>
              This email was sent to <strong>{user.email}</strong>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>"""

    subject = f"\U0001f39f\ufe0f Booking Confirmed \u2014 {event.title}"
    msg = EmailMultiAlternatives(subject, text_body, settings.DEFAULT_FROM_EMAIL, [user.email])
    msg.attach_alternative(html_body, "text/html")

    try:
        msg.send(fail_silently=False)
    except Exception as exc:
        logger.error(f"Failed to send booking confirmation to {user.email}: {exc}")
