"""
DarkGuard — Digest Celery Tasks
Weekly email/WhatsApp digest for users.
"""

import logging
import asyncio
import os
from tasks.celery_app import celery_app

logger = logging.getLogger("darkguard.tasks.digest")


@celery_app.task(name="tasks.digest_tasks.send_weekly_digest")
def send_weekly_digest():
    """Send weekly digest to all users. Runs every Sunday at 9AM IST."""
    logger.info("Starting weekly digest generation...")

    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    result = loop.run_until_complete(_process_digests())
    loop.close()

    return result


async def _process_digests() -> dict:
    """Process and send digests for all users."""
    from services.supabase_service import get_supabase
    from datetime import datetime, timedelta, timezone

    client = get_supabase()
    sent_count = 0
    error_count = 0

    # Get all users
    try:
        users = client.table("profiles").select("*").execute()
    except Exception as e:
        logger.error(f"Failed to fetch users: {e}")
        return {"sent": 0, "errors": 1}

    week_ago = (datetime.now(timezone.utc) - timedelta(days=7)).isoformat()

    for user in (users.data or []):
        try:
            # Get user's scans from the past week
            scans = (
                client.table("scans")
                .select("*")
                .eq("user_id", user["id"])
                .gte("created_at", week_ago)
                .execute()
            )

            scan_list = scans.data or []
            if not scan_list:
                continue  # Skip users with no activity

            total_patterns = sum(s.get("patterns_found", 0) for s in scan_list)

            # Find top offending domain
            domain_counts = {}
            for s in scan_list:
                domain = s.get("domain", "unknown")
                domain_counts[domain] = domain_counts.get(domain, 0) + s.get("patterns_found", 0)

            top_domain = max(domain_counts, key=domain_counts.get) if domain_counts else "N/A"

            digest_data = {
                "total_scans": len(scan_list),
                "total_patterns": total_patterns,
                "top_domain": top_domain,
                "estimated_savings": total_patterns * 50,  # ₹50 per pattern detected
            }

            # Send based on user preference
            channel = user.get("digest_channel", "email")
            if channel == "email":
                await _send_email_digest(user, digest_data)
            elif channel == "whatsapp":
                await _send_whatsapp_digest(user, digest_data)

            # Log digest
            client.table("digest_logs").insert({
                "user_id": user["id"],
                "channel": channel,
                "scans_count": len(scan_list),
                "patterns_count": total_patterns,
                "status": "SENT",
            }).execute()

            sent_count += 1

        except Exception as e:
            logger.error(f"Failed to send digest to user {user['id']}: {e}")
            error_count += 1

    logger.info(f"Digest complete: {sent_count} sent, {error_count} errors")
    return {"sent": sent_count, "errors": error_count}


async def _send_email_digest(user: dict, data: dict):
    """Send email digest via Resend API."""
    import httpx

    api_key = os.getenv("RESEND_API_KEY", "")
    if not api_key:
        logger.warning("RESEND_API_KEY not set — skipping email digest")
        return

    subject = f"🛡️ DarkGuard Weekly Report — {data['total_patterns']} patterns detected"
    body = f"""
    <h2>🛡️ Your DarkGuard Weekly Digest</h2>
    <p>Hi {user.get('full_name', 'there')}!</p>
    <ul>
        <li><strong>Pages scanned:</strong> {data['total_scans']}</li>
        <li><strong>Dark patterns detected:</strong> {data['total_patterns']}</li>
        <li><strong>Top offending site:</strong> {data['top_domain']}</li>
        <li><strong>Estimated money saved:</strong> ₹{data['estimated_savings']}</li>
    </ul>
    <p>Keep browsing safely! 🛡️</p>
    """

    async with httpx.AsyncClient() as client:
        await client.post(
            "https://api.resend.com/emails",
            headers={"Authorization": f"Bearer {api_key}"},
            json={
                "from": "DarkGuard <digest@darkguard.app>",
                "to": [user.get("email", "")],
                "subject": subject,
                "html": body,
            },
        )


async def _send_whatsapp_digest(user: dict, data: dict):
    """Send WhatsApp digest via Twilio."""
    import httpx

    sid = os.getenv("TWILIO_ACCOUNT_SID", "")
    token = os.getenv("TWILIO_AUTH_TOKEN", "")
    from_number = os.getenv("TWILIO_WHATSAPP_NUMBER", "")

    if not all([sid, token, from_number]):
        logger.warning("Twilio credentials not set — skipping WhatsApp digest")
        return

    msg = (
        f"🛡️ *DarkGuard Weekly Report*\n\n"
        f"📊 Pages scanned: {data['total_scans']}\n"
        f"⚠️ Dark patterns: {data['total_patterns']}\n"
        f"🏢 Top offender: {data['top_domain']}\n"
        f"💰 Estimated saved: ₹{data['estimated_savings']}\n\n"
        f"Keep browsing safely!"
    )

    async with httpx.AsyncClient() as client:
        await client.post(
            f"https://api.twilio.com/2010-04-01/Accounts/{sid}/Messages.json",
            auth=(sid, token),
            data={
                "From": from_number,
                "To": f"whatsapp:{user.get('phone', '')}",
                "Body": msg,
            },
        )
