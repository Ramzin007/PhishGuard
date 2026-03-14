# PhishGuard 🛡️✨

**PhishGuard** is a sophisticated, real-time phishing detection browser extension designed to provide comprehensive protection against fraudulent websites and credential harvesting. Built on the modern **Manifest V3** architecture, it employs a multi-layered defense strategy—fusing domain intelligence, content heuristics, and deep DOM inspection into a single, proactive security shield.

---

## 🚀 Core Features

### 🛡️ Unified Risk Engine
The central intelligence of PhishGuard that aggregates security signals into a human-readable **Trust Score (0-100)**.
- **Explainable Security**: Provides clear, specific reasons for every alert, such as "Brand Impersonation Detected" or "Suspicious Login Form."
- **Fused Analysis**: Dynamically combines early-navigation domain checks with post-load content analysis for maximum accuracy.

### 🌐 Intelligent Domain Intelligence
Protects you before the page even finishes loading.
- **Typosquatting Detection**: Uses advanced string-similarity algorithms (Levenshtein Distance) to catch fake sites impersonating trusted brands like Amazon, PayPal, or Google.
- **Intelligent Redirection**: When a typosquat is detected, PhishGuard automatically identifies and suggests the official, safe domain.
- **Suspicious TLD Tracking**: Automatically flags high-risk Top-Level Domains (like `.xyz`, `.top`, `.tk`) often used for malicious activities.
- **Universal URL Heuristics**: Scans for phishing keywords (`secure-login`, `verify-account`) and suspicious URL structures.

### 🔍 Deep Content Inspection
A secondary layer that scans the live page environment for hidden threats.
- **Credential Harvesting Guard**: Identifies sensitive login forms appearing on flagged or unverified domains.
- **Scam Language Heuristics**: Detects urgent or manipulative language commonly used in phishing campaigns.

### 💎 Premium User Experience
- **Interactive Dashboard**: A modern, Inter-font based popup providing instant visibility into site security and detailed threat markers.
- **Protective Overlays**: Aesthetic, blur-filtered warning modals that block interaction with high-risk sites until the user confirms safety.
- **Dynamic Badge System**: Visual status indicators (OK, !, !!) directly on the extension icon for ambient security awareness.

---

## 🛠️ Technology Stack

- **Platform**: Chrome Extension API (Manifest V3) with Service Workers.
- **Logic**: JavaScript (ES6 Modules) - Highly modular and asynchronous architecture.
- **UI/UX**: HTML5 & CSS3 - Featuring glassmorphism, backdrop filters, and high-fidelity typography.
- **Algorithms**: Custom Levenshtein Distance implementation for real-time similarity checking.
- **Architecture**: Separated layers for Background Orchestration, Content Discovery, and UI Warning Systems.

---

## 📦 Installation & Usage

1.  **Download** the repository assets.
2.  Open Chrome and navigate to `chrome://extensions/`.
3.  Enable **"Developer mode"** in the top-right corner.
4.  Click **"Load unpacked"** and select the project folder.
5.  **Pin** the extension to your toolbar to monitor your Trust Score in real-time.

---
*PhishGuard — Secure Browsing, Reimagined.*
