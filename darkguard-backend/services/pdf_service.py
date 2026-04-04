"""
DarkGuard — PDF Generation Service
Generates CCPA complaint PDFs using WeasyPrint + Jinja2.
"""

import os
import logging
from datetime import datetime, timezone
from typing import Optional
from jinja2 import Environment, FileSystemLoader

logger = logging.getLogger("darkguard.pdf")

# Setup Jinja2 template environment
TEMPLATE_DIR = os.path.join(os.path.dirname(__file__), "..", "templates")
jinja_env = Environment(loader=FileSystemLoader(TEMPLATE_DIR))


async def generate_complaint_pdf(
    user_name: str,
    user_email: str,
    website_url: str,
    domain: str,
    detections: list[dict],
    scan_date: Optional[str] = None,
) -> bytes:
    """
    Generate a CCPA complaint PDF.
    Returns PDF as bytes.
    """
    try:
        from weasyprint import HTML
    except ImportError:
        logger.error("WeasyPrint not installed — cannot generate PDFs")
        raise RuntimeError("PDF generation requires WeasyPrint")

    template = jinja_env.get_template("complaint.html")

    now = datetime.now(timezone.utc)
    context = {
        "user_name": user_name or "DarkGuard User",
        "user_email": user_email or "N/A",
        "website_url": website_url,
        "domain": domain,
        "detections": detections,
        "scan_date": scan_date or now.strftime("%B %d, %Y"),
        "generated_date": now.strftime("%B %d, %Y at %H:%M UTC"),
        "complaint_ref": f"DG-{now.strftime('%Y%m%d%H%M%S')}",
        "pattern_count": len(detections),
    }

    html_content = template.render(**context)
    pdf_bytes = HTML(string=html_content).write_pdf()

    return pdf_bytes


async def upload_pdf_to_storage(pdf_bytes: bytes, filename: str) -> str:
    """Upload PDF to Supabase Storage and return public URL."""
    from services.supabase_service import get_supabase

    client = get_supabase()

    # Upload to 'complaints' bucket
    try:
        client.storage.from_("complaints").upload(
            path=filename,
            file=pdf_bytes,
            file_options={"content-type": "application/pdf"},
        )
    except Exception as e:
        # File might already exist, try update
        logger.warning(f"Upload failed, trying update: {e}")
        client.storage.from_("complaints").update(
            path=filename,
            file=pdf_bytes,
            file_options={"content-type": "application/pdf"},
        )

    # Get public URL
    public_url = client.storage.from_("complaints").get_public_url(filename)
    return public_url
