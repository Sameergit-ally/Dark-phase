/**
 * DarkGuard — Background Service Worker
 * Handles API communication, badge updates, and storage.
 */

const API_BASE = "http://localhost:8000";

// ─── Badge Management ───────────────────────────────────

function updateBadge(tabId, patternsFound, grade) {
  const text = patternsFound > 0 ? String(patternsFound) : "";
  const colors = {
    A: "#2a9d8f",
    B: "#4ecdc4",
    C: "#f4a261",
    D: "#e76f51",
    F: "#e63946",
  };

  chrome.action.setBadgeText({ text, tabId });
  chrome.action.setBadgeBackgroundColor({
    color: colors[grade] || "#6c63ff",
    tabId,
  });
}

// ─── API Communication ──────────────────────────────────

async function analyzeViaAPI(payload) {
  try {
    // Get stored auth token
    const stored = await chrome.storage.local.get(["authToken"]);
    const headers = { "Content-Type": "application/json" };

    if (stored.authToken) {
      headers["Authorization"] = `Bearer ${stored.authToken}`;
    }

    const response = await fetch(`${API_BASE}/api/v1/analyze`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("[DarkGuard BG] API error:", error);
    return { detections: [], scan_id: null, grade: "A", patterns_found: 0 };
  }
}

async function getTrustScore(domain) {
  try {
    const response = await fetch(`${API_BASE}/api/v1/trust-score/${domain}`);
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.warn("[DarkGuard BG] Trust score fetch failed:", error);
    return null;
  }
}

// ─── Message Handler ────────────────────────────────────

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const tabId = sender.tab?.id;

  switch (message.type) {
    case "ANALYZE_PAGE":
      analyzeViaAPI(message.payload).then((result) => {
        sendResponse(result);
      });
      return true; // async

    case "SCAN_COMPLETE":
      if (tabId) {
        const { patternsFound, grade, domain } = message.data;
        updateBadge(tabId, patternsFound, grade);

        // Store latest result
        chrome.storage.local.set({
          currentScan: {
            ...message.data,
            timestamp: Date.now(),
          },
        });
      }
      break;

    case "GET_TRUST_SCORE":
      getTrustScore(message.domain).then((result) => {
        sendResponse(result);
      });
      return true;

    case "SET_AUTH_TOKEN":
      chrome.storage.local.set({ authToken: message.token });
      sendResponse({ success: true });
      break;

    case "OPEN_DASHBOARD":
      chrome.tabs.create({ url: "http://localhost:5173/dashboard" });
      break;
  }
});

// ─── Tab Update Listener ────────────────────────────────

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) {
    // Reset badge for new page
    updateBadge(tabId, 0, "A");
  }
});

// ─── Installation ───────────────────────────────────────

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    console.log("[DarkGuard] 🛡️ Extension installed!");
    // Open onboarding page
    chrome.tabs.create({
      url: "http://localhost:5173/?source=extension",
    });
  }
});

console.log("[DarkGuard] 🛡️ Background service worker ready");
