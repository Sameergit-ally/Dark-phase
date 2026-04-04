"""
DarkGuard — Audit Celery Task
Async website crawl + analysis for B2B audit.
"""

import logging
import asyncio
from tasks.celery_app import celery_app

logger = logging.getLogger("darkguard.tasks.audit")


@celery_app.task(
    name="tasks.audit_tasks.run_audit_task",
    bind=True,
    max_retries=2,
    default_retry_delay=60,
)
def run_audit_task(self, job_id: str):
    """Run a full B2B website audit."""
    logger.info(f"Starting audit task for job {job_id}")

    try:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        result = loop.run_until_complete(_run_audit(job_id))
        loop.close()
        return result
    except Exception as exc:
        logger.error(f"Audit task failed: {exc}")
        # Update job status to FAILED
        try:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            from services import supabase_service as db
            loop.run_until_complete(db.update_audit_job(job_id, {"status": "FAILED"}))
            loop.close()
        except Exception:
            pass
        raise self.retry(exc=exc)


async def _run_audit(job_id: str) -> dict:
    """Internal audit logic."""
    from services import supabase_service as db
    from services.crawler_service import crawl_website
    from services.groq_service import analyze_with_fallback

    # Get job details
    job = await db.get_audit_job(job_id)
    if not job:
        raise ValueError(f"Audit job {job_id} not found")

    # Update status to RUNNING
    await db.update_audit_job(job_id, {"status": "RUNNING"})

    # Crawl the website
    pages = await crawl_website(job["url"], max_pages=50)

    # Analyze each page
    all_detections = []
    for i, page in enumerate(pages):
        try:
            result = await analyze_with_fallback(
                dom_text=page["dom_text"],
                url=page["url"],
                language_hint=page.get("language_hint", "en"),
            )
            detections = result.get("detections", [])
            all_detections.append({
                "url": page["url"],
                "patterns_found": len(detections),
                "detections": detections,
            })

            # Update progress
            await db.update_audit_job(job_id, {"pages_crawled": i + 1})

        except Exception as e:
            logger.warning(f"Failed to analyze page {page['url']}: {e}")
            all_detections.append({
                "url": page["url"],
                "patterns_found": 0,
                "detections": [],
                "error": str(e),
            })

    # Generate audit report PDF
    try:
        from services.pdf_service import upload_pdf_to_storage
        from jinja2 import Environment, FileSystemLoader
        import os

        template_dir = os.path.join(os.path.dirname(__file__), "..", "templates")
        env = Environment(loader=FileSystemLoader(template_dir))

        # Simple HTML report
        total_patterns = sum(p["patterns_found"] for p in all_detections)
        report_html = f"""
        <html><head><style>
        body {{ font-family: Arial, sans-serif; padding: 40px; }}
        h1 {{ color: #1a1a2e; }}
        .summary {{ background: #f0f0f0; padding: 20px; border-radius: 8px; margin: 20px 0; }}
        table {{ width: 100%; border-collapse: collapse; margin-top: 20px; }}
        th, td {{ padding: 10px; border: 1px solid #ddd; text-align: left; }}
        th {{ background: #1a1a2e; color: white; }}
        .high {{ color: #e63946; }}
        .medium {{ color: #f4a261; }}
        .low {{ color: #2a9d8f; }}
        </style></head><body>
        <h1>🛡️ DarkGuard Audit Report</h1>
        <div class='summary'>
            <h2>Summary</h2>
            <p><strong>Website:</strong> {job['url']}</p>
            <p><strong>Pages Crawled:</strong> {len(pages)}</p>
            <p><strong>Total Dark Patterns:</strong> {total_patterns}</p>
            <p><strong>Risk Rating:</strong> {'HIGH' if total_patterns > 10 else 'MEDIUM' if total_patterns > 3 else 'LOW'}</p>
        </div>
        <h2>Per-Page Results</h2>
        <table>
            <tr><th>Page URL</th><th>Patterns Found</th><th>Details</th></tr>
        """
        for page in all_detections:
            details = ", ".join(d["pattern_type"] for d in page["detections"]) or "None"
            report_html += f"<tr><td>{page['url']}</td><td>{page['patterns_found']}</td><td>{details}</td></tr>"

        report_html += "</table></body></html>"

        try:
            from weasyprint import HTML
            pdf_bytes = HTML(string=report_html).write_pdf()
            filename = f"audit_{job_id}.pdf"
            report_url = await upload_pdf_to_storage(pdf_bytes, filename)
        except ImportError:
            report_url = None
            logger.warning("WeasyPrint not available — skipping PDF generation")

    except Exception as e:
        logger.error(f"Report generation failed: {e}")
        report_url = None

    # Update job as completed
    await db.update_audit_job(job_id, {
        "status": "COMPLETED",
        "pages_crawled": len(pages),
        "report_url": report_url,
    })

    logger.info(f"Audit complete for job {job_id}: {len(pages)} pages, {total_patterns} patterns")
    return {"job_id": job_id, "pages": len(pages), "total_patterns": total_patterns}
