/**
 * DarkGuard — Popup Script
 * Renders scan results in the extension popup.
 */

document.addEventListener("DOMContentLoaded", async () => {
  const contentEl = document.getElementById("content");
  const actionsEl = document.getElementById("actions");

  // Get current tab info
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.url) {
    showEmptyState("No page detected");
    return;
  }

  const domain = new URL(tab.url).hostname;

  // Try to get cached scan result
  const storageKey = `scan_${domain}`;
  const stored = await chrome.storage.local.get([storageKey, "currentScan"]);
  let scanData = stored[storageKey] || stored.currentScan;

  // Check if data is for current domain
  if (scanData && scanData.domain !== domain) {
    scanData = null;
  }

  // Check freshness (5 minutes)
  if (scanData && Date.now() - scanData.timestamp > 5 * 60 * 1000) {
    scanData = null;
  }

  if (scanData) {
    renderResult(scanData, domain);
  } else {
    // Ask content script for current result
    try {
      chrome.tabs.sendMessage(tab.id, { type: "GET_SCAN_RESULT" }, (response) => {
        if (chrome.runtime.lastError || !response) {
          showScanningState();
          // Trigger a rescan
          chrome.tabs.sendMessage(tab.id, { type: "RESCAN" });
          // Poll for result
          setTimeout(() => pollForResult(domain), 3000);
        } else {
          renderResult(response, domain);
        }
      });
    } catch (e) {
      showEmptyState("Cannot scan this page");
    }
  }

  // ─── Button Handlers ───────────────────────────────

  document.getElementById("btn-rescan").addEventListener("click", () => {
    showScanningState();
    chrome.tabs.sendMessage(tab.id, { type: "RESCAN" }, (response) => {
      setTimeout(async () => {
        const data = await chrome.storage.local.get([storageKey]);
        if (data[storageKey]) {
          renderResult(data[storageKey], domain);
        }
      }, 3000);
    });
  });

  document.getElementById("btn-dashboard").addEventListener("click", () => {
    chrome.runtime.sendMessage({ type: "OPEN_DASHBOARD" });
  });

  document.getElementById("btn-report").addEventListener("click", () => {
    chrome.tabs.create({
      url: `http://localhost:5173/community?url=${encodeURIComponent(tab.url)}`,
    });
  });

  document.getElementById("link-dashboard").addEventListener("click", (e) => {
    e.preventDefault();
    chrome.runtime.sendMessage({ type: "OPEN_DASHBOARD" });
  });

  // ─── Render Functions ──────────────────────────────

  function renderResult(data, domain) {
    const detections = data.detections || [];
    const grade = data.grade || "A";
    const patternsFound = detections.length;

    if (patternsFound === 0) {
      showCleanState(domain);
      return;
    }

    const getSeverity = (score) => {
      if (score > 0.8) return "high";
      if (score > 0.5) return "medium";
      return "low";
    };

    const patternsHTML = detections
      .sort((a, b) => b.confidence_score - a.confidence_score)
      .map((d) => {
        const severity = getSeverity(d.confidence_score);
        return `
          <div class="pattern-item ${severity}">
            <div class="pattern-header">
              <span class="pattern-type">${d.pattern_type.replace(/_/g, " ")}</span>
              <span class="pattern-confidence ${severity}">
                ${Math.round(d.confidence_score * 100)}%
              </span>
            </div>
            <div class="pattern-explanation">${d.explanation || "Potential dark pattern detected"}</div>
          </div>
        `;
      })
      .join("");

    const timeStr = data.timestamp
      ? new Date(data.timestamp).toLocaleTimeString()
      : "just now";

    contentEl.innerHTML = `
      <div class="grade-section">
        <div class="grade-circle grade-${grade}">${grade}</div>
        <div class="grade-info">
          <div class="domain">${domain}</div>
          <div class="scan-time">Scanned at ${timeStr}</div>
          <div class="pattern-count">⚠️ ${patternsFound} dark pattern${patternsFound > 1 ? "s" : ""} found</div>
        </div>
      </div>
      <div class="patterns-section">
        <div class="section-title">Detected Patterns</div>
        ${patternsHTML}
      </div>
    `;

    actionsEl.style.display = "flex";
  }

  function showCleanState(domain) {
    contentEl.innerHTML = `
      <div class="grade-section">
        <div class="grade-circle grade-A">A</div>
        <div class="grade-info">
          <div class="domain">${domain}</div>
          <div class="scan-time">Scanned just now</div>
          <div class="pattern-count" style="color: #2a9d8f;">✅ No dark patterns detected</div>
        </div>
      </div>
      <div class="empty-state">
        <div class="icon">🎉</div>
        <h3>All Clear!</h3>
        <p>This page appears to be free of dark patterns. Browse safely!</p>
      </div>
    `;
    actionsEl.style.display = "flex";
  }

  function showEmptyState(message) {
    contentEl.innerHTML = `
      <div class="empty-state">
        <div class="icon">🔒</div>
        <h3>${message}</h3>
        <p>Navigate to a website and DarkGuard will automatically scan for dark patterns.</p>
      </div>
    `;
    actionsEl.style.display = "none";
  }

  function showScanningState() {
    contentEl.innerHTML = `
      <div class="scanning">
        <div class="spinner"></div>
        <p>Analyzing page for dark patterns...</p>
      </div>
    `;
    actionsEl.style.display = "none";
  }

  async function pollForResult(domain) {
    const storageKey = `scan_${domain}`;
    const data = await chrome.storage.local.get([storageKey]);
    if (data[storageKey]) {
      renderResult(data[storageKey], domain);
    } else {
      setTimeout(() => pollForResult(domain), 2000);
    }
  }
});
