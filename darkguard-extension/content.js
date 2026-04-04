/**
 * DarkGuard — Content Script
 * Injected into every web page to scan for dark patterns,
 * add visual highlights, and show pre-purchase alerts.
 */

(() => {
  "use strict";

  // ─── Configuration ─────────────────────────────────────
  const API_BASE = "http://localhost:8000";
  const SCAN_DELAY_MS = 2000; // Wait for page to settle
  const MAX_DOM_TEXT_LENGTH = 8000;

  // ─── State ─────────────────────────────────────────────
  let scanResult = null;
  let isScanning = false;
  let highlightsVisible = true;

  // ─── Utility Functions ─────────────────────────────────

  function getDomain() {
    return window.location.hostname;
  }

  function getPageText() {
    const body = document.body;
    if (!body) return "";
    return body.innerText.substring(0, MAX_DOM_TEXT_LENGTH);
  }

  function getLanguageHint() {
    return document.documentElement.lang || "en";
  }

  // ─── API Communication ─────────────────────────────────

  async function analyzePageViaAPI(domText) {
    const payload = {
      url: window.location.href,
      domain: getDomain(),
      dom_text: domText,
      language_hint: getLanguageHint(),
    };

    try {
      const response = await fetch(`${API_BASE}/api/v1/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.warn("[DarkGuard] API call failed, using background fallback:", error.message);
      // Try via background service worker
      return new Promise((resolve) => {
        chrome.runtime.sendMessage(
          { type: "ANALYZE_PAGE", payload },
          (response) => {
            resolve(response || { detections: [], scan_id: null, grade: "A" });
          }
        );
      });
    }
  }

  // ─── DOM Scanner ───────────────────────────────────────

  async function scanPage() {
    if (isScanning) return;
    isScanning = true;

    console.log("[DarkGuard] 🔍 Scanning page:", window.location.href);

    const domText = getPageText();
    if (!domText || domText.length < 50) {
      console.log("[DarkGuard] Page too short to scan");
      isScanning = false;
      return;
    }

    try {
      scanResult = await analyzePageViaAPI(domText);
      console.log("[DarkGuard] ✅ Scan complete:", scanResult);

      // Store result for popup
      chrome.storage.local.set({
        [`scan_${getDomain()}`]: {
          ...scanResult,
          timestamp: Date.now(),
          url: window.location.href,
        },
      });

      // Notify background script
      chrome.runtime.sendMessage({
        type: "SCAN_COMPLETE",
        data: {
          domain: getDomain(),
          url: window.location.href,
          patternsFound: scanResult.patterns_found || 0,
          grade: scanResult.grade || "A",
          detections: scanResult.detections || [],
        },
      });

      // Apply visual highlights
      if (scanResult.detections && scanResult.detections.length > 0) {
        applyHighlights(scanResult.detections);
        setupPrePurchaseAlert(scanResult);
      }
    } catch (error) {
      console.error("[DarkGuard] Scan failed:", error);
    } finally {
      isScanning = false;
    }
  }

  // ─── Visual Highlighter (Feature 3) ───────────────────

  function applyHighlights(detections) {
    // Remove existing highlights
    removeHighlights();

    detections.forEach((detection, index) => {
      const elements = findMatchingElements(detection);

      elements.forEach((el) => {
        // Determine severity class
        let severityClass = "darkguard-highlight-low";
        if (detection.confidence_score > 0.8) {
          severityClass = "darkguard-highlight-high";
        } else if (detection.confidence_score > 0.5) {
          severityClass = "darkguard-highlight-medium";
        }

        // Add highlight border
        el.classList.add("darkguard-highlighted", severityClass);
        el.setAttribute("data-darkguard-index", index);

        // Add shield badge
        const badge = document.createElement("div");
        badge.className = "darkguard-badge";
        badge.innerHTML = "🛡️";
        badge.setAttribute("data-darkguard-badge", "true");

        // Position badge
        const rect = el.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          el.style.position = el.style.position || "relative";
          el.appendChild(badge);
        }

        // Add tooltip
        const tooltip = document.createElement("div");
        tooltip.className = "darkguard-tooltip";
        tooltip.innerHTML = `
          <div class="darkguard-tooltip-header">
            <span class="darkguard-tooltip-icon">🛡️</span>
            <strong>${detection.pattern_type.replace(/_/g, " ")}</strong>
          </div>
          <div class="darkguard-tooltip-confidence">
            Confidence: ${Math.round(detection.confidence_score * 100)}%
          </div>
          <div class="darkguard-tooltip-explanation">
            ${detection.explanation || "Potential dark pattern detected"}
          </div>
        `;
        tooltip.setAttribute("data-darkguard-tooltip", "true");
        el.appendChild(tooltip);

        // Show tooltip on hover
        el.addEventListener("mouseenter", () => {
          tooltip.style.display = "block";
        });
        el.addEventListener("mouseleave", () => {
          tooltip.style.display = "none";
        });
      });
    });
  }

  function findMatchingElements(detection) {
    const matches = [];

    // Try element_selector first
    if (detection.element_selector) {
      try {
        const els = document.querySelectorAll(detection.element_selector);
        els.forEach((el) => matches.push(el));
      } catch (e) {
        // Invalid selector, fall through
      }
    }

    // Try text_snippet match
    if (matches.length === 0 && detection.text_snippet) {
      const snippet = detection.text_snippet.toLowerCase().trim();
      if (snippet.length > 3) {
        const walker = document.createTreeWalker(
          document.body,
          NodeFilter.SHOW_TEXT,
          null,
          false
        );

        while (walker.nextNode()) {
          const node = walker.currentNode;
          if (
            node.textContent &&
            node.textContent.toLowerCase().includes(snippet) &&
            node.parentElement
          ) {
            const parent = node.parentElement;
            if (
              !parent.classList.contains("darkguard-highlighted") &&
              parent.tagName !== "SCRIPT" &&
              parent.tagName !== "STYLE"
            ) {
              matches.push(parent);
              break; // Only first match
            }
          }
        }
      }
    }

    return matches;
  }

  function removeHighlights() {
    document.querySelectorAll(".darkguard-highlighted").forEach((el) => {
      el.classList.remove(
        "darkguard-highlighted",
        "darkguard-highlight-high",
        "darkguard-highlight-medium",
        "darkguard-highlight-low"
      );
    });
    document
      .querySelectorAll("[data-darkguard-badge], [data-darkguard-tooltip]")
      .forEach((el) => el.remove());
  }

  // ─── Pre-Purchase Alert (Feature 5) ───────────────────

  function setupPrePurchaseAlert(result) {
    if (!result.detections || result.detections.length === 0) return;

    const purchaseKeywords = [
      "add to cart", "buy now", "proceed", "checkout",
      "place order", "purchase", "subscribe", "sign up",
      "confirm order", "pay now", "complete purchase",
      // Hindi
      "अभी खरीदें", "कार्ट में डालें", "ऑर्डर करें",
    ];

    document.addEventListener("click", (e) => {
      const target = e.target.closest("button, a, [role='button'], input[type='submit']");
      if (!target) return;

      const text = (target.textContent || target.value || "").toLowerCase().trim();
      const matchesPurchase = purchaseKeywords.some((kw) =>
        text.includes(kw)
      );

      if (matchesPurchase && result.detections.length > 0) {
        e.preventDefault();
        e.stopPropagation();
        showPrePurchaseModal(result, target, e);
      }
    }, true);
  }

  function showPrePurchaseModal(result, originalTarget, originalEvent) {
    // Remove existing modal
    const existing = document.getElementById("darkguard-modal-overlay");
    if (existing) existing.remove();

    const patternCount = result.detections.length;
    const patternList = result.detections
      .map(
        (d) =>
          `<li>
            <strong>${d.pattern_type.replace(/_/g, " ")}</strong>
            (${Math.round(d.confidence_score * 100)}%)
            <br><small>${d.explanation || ""}</small>
          </li>`
      )
      .join("");

    const overlay = document.createElement("div");
    overlay.id = "darkguard-modal-overlay";
    overlay.className = "darkguard-modal-overlay";
    overlay.innerHTML = `
      <div class="darkguard-modal">
        <div class="darkguard-modal-header">
          <span class="darkguard-modal-icon">🛡️</span>
          <h2>DarkGuard Alert</h2>
        </div>
        <p class="darkguard-modal-message">
          <strong>${patternCount} dark pattern${patternCount > 1 ? "s" : ""}</strong> 
          detected on this page before your purchase.
        </p>
        <ul class="darkguard-modal-patterns">${patternList}</ul>
        <div class="darkguard-modal-actions">
          <button id="darkguard-proceed" class="darkguard-btn darkguard-btn-danger">
            Proceed Anyway
          </button>
          <button id="darkguard-cancel" class="darkguard-btn darkguard-btn-safe">
            Cancel
          </button>
          <button id="darkguard-details" class="darkguard-btn darkguard-btn-info">
            View Details
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    // Button handlers
    document.getElementById("darkguard-proceed").addEventListener("click", () => {
      overlay.remove();
      // Re-trigger original click
      originalTarget.click();
    });

    document.getElementById("darkguard-cancel").addEventListener("click", () => {
      overlay.remove();
    });

    document.getElementById("darkguard-details").addEventListener("click", () => {
      overlay.remove();
      // Toggle highlights visibility
      highlightsVisible = true;
      if (scanResult) applyHighlights(scanResult.detections);
    });

    // Close on overlay click
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) overlay.remove();
    });
  }

  // ─── Message Listener ─────────────────────────────────

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.type) {
      case "RESCAN":
        scanPage().then(() => sendResponse({ success: true }));
        return true; // async response

      case "TOGGLE_HIGHLIGHTS":
        highlightsVisible = !highlightsVisible;
        if (highlightsVisible && scanResult) {
          applyHighlights(scanResult.detections);
        } else {
          removeHighlights();
        }
        sendResponse({ visible: highlightsVisible });
        break;

      case "GET_SCAN_RESULT":
        sendResponse(scanResult || { detections: [], grade: "A" });
        break;
    }
  });

  // ─── Initialize ────────────────────────────────────────

  // Wait for page to settle, then scan
  setTimeout(() => {
    scanPage();
  }, SCAN_DELAY_MS);

  // Watch for dynamic content changes (SPAs)
  const observer = new MutationObserver((mutations) => {
    // Debounce: only rescan if significant DOM changes
    const significantChange = mutations.some(
      (m) => m.addedNodes.length > 5 || m.removedNodes.length > 5
    );
    if (significantChange && !isScanning) {
      setTimeout(scanPage, 3000);
    }
  });

  observer.observe(document.body || document.documentElement, {
    childList: true,
    subtree: true,
  });

  console.log("[DarkGuard] 🛡️ Content script loaded");
})();
