"""
DarkGuard — Playwright Crawler Service
Crawls websites for B2B audit feature.
"""

import logging
from typing import Optional
from urllib.parse import urljoin, urlparse

logger = logging.getLogger("darkguard.crawler")


async def crawl_website(base_url: str, max_pages: int = 50) -> list[dict]:
    """
    Crawl a website starting from base_url, collecting page data.
    Returns list of { url, dom_text } for each page.
    """
    try:
        from playwright.async_api import async_playwright
    except ImportError:
        logger.error("Playwright not installed")
        raise RuntimeError("Playwright is required for crawling")

    pages_data = []
    visited = set()
    to_visit = [base_url]
    base_domain = urlparse(base_url).netloc

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            user_agent="DarkGuard-Audit/1.0",
            viewport={"width": 1280, "height": 720},
        )

        while to_visit and len(visited) < max_pages:
            url = to_visit.pop(0)
            if url in visited:
                continue

            visited.add(url)

            try:
                page = await context.new_page()
                await page.goto(url, timeout=15000, wait_until="domcontentloaded")

                # Extract text content
                dom_text = await page.evaluate("document.body.innerText || ''")

                # Get language hint
                lang = await page.evaluate(
                    "document.documentElement.lang || 'en'"
                )

                pages_data.append({
                    "url": url,
                    "dom_text": dom_text[:10000],  # Limit text size
                    "language_hint": lang,
                })

                # Find internal links
                links = await page.evaluate("""
                    () => {
                        const anchors = document.querySelectorAll('a[href]');
                        return Array.from(anchors).map(a => a.href).filter(h =>
                            h.startsWith('http')
                        );
                    }
                """)

                for link in links:
                    parsed = urlparse(link)
                    if parsed.netloc == base_domain and link not in visited:
                        # Strip fragments and query params for dedup
                        clean_url = f"{parsed.scheme}://{parsed.netloc}{parsed.path}"
                        if clean_url not in visited:
                            to_visit.append(clean_url)

                await page.close()

            except Exception as e:
                logger.warning(f"Failed to crawl {url}: {e}")
                continue

        await browser.close()

    logger.info(f"Crawled {len(pages_data)} pages from {base_url}")
    return pages_data
