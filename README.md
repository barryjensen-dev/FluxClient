# Flux Client

A lightweight, customizable script designed to enhance the user experience in browser-based applications. It provides modular functionality with user-controlled toggles. Each feature is integrated through keyboard shortcuts for fast activation, and the script maintains a clean interface while offering power-user utilities.

---

## Features

- **Access / Key Screen**  
  - Requires the key `UPDATE` before showing the main panel.  
  - Prevents accidental or unauthorized activation.  
- **Draggable, Resizable Interface**  
  - Fixed‐position panel (≈520 × min-height 45 px) in the top-left corner, offset by 50 px.  
  - Minimize/restore and close controls.  
  - Optional “rainbow” border animation or custom accent color via hue slider.  
- **Proxy Section**  
  - Enter a URL, click “Go,” and it will prepend `https://` if needed, wrap it with a proxy endpoint (`https://proxyium.com/process?url=`), and redirect the browser.  
- **Mods Section**  
  - **Page Tools**  
    - Dark Website: toggles a CSS filter to invert page colors.  
    - Light Website: reverts any dark filter.  
    - Inspect Page: makes the `<body>` contentEditable so you can click and edit text in place.  
  - **Page Actions**  
    - Hard Reset Page: reloads the current page.  
    - Destroy Page: attempts to close the window (logs a warning if it fails).  
- **Fun Section**  
  - **Matrix Effect**: full-page canvas showing falling characters (The Matrix style).  
  - **Autoclicker** (stop with backtick `` ` ``): clicks whatever is under your cursor every 100 ms until you press backtick.  
  - **Page Spammer**: opens 100 blank tabs at once, then turns itself off.  
- **Script Section**  
  - Built-in JavaScript executor (textarea → `eval()` → console or alert on errors).  
  - Backup execute mode to catch edge-case errors.  
  - Save current code as `flux_script.js`.  
  - Load `.js` or `.txt` from your file system into the textarea.  
- **Settings Section**  
  - **About**: shows version (V15.1) and author (barryjensen-dev), plus “Updated 2025/06/04.”  
  - **Menu Appearance**:  
    - Rainbow border toggle.  
    - Hue slider (0–360) for a custom accent color.  
  - **Client Options**:  
    - Reset Menu: closes and removes Flux Client (same as the ✕ button).  
    - Client Fix: placeholder toggle that logs “Client Fix toggled ON/OFF.”

---

## Installation

1. Install a userscript manager (Tampermonkey, Greasemonkey, etc.) in your browser.
2. Create a new userscript and paste in the Flux Client code.
3. Save and enable the script.  

---

## Usage

1. Navigate to any supported website (you’ll see a small “Flux” icon in Tampermonkey’s toolbar).  
2. Click the icon or press your userscript manager’s “run” shortcut.  
3. When prompted, enter the key `UPDATE` and click **Verify & Enter**.  
4. The Flux Client panel will slide in. Use the sidebar or keyboard shortcuts to navigate:  
   - **Proxy**: enter a URL, click **Go**.  
   - **Mods**: toggle Dark/Light, Inspect Page, Hard Reset, or Destroy Page.  
   - **Fun**: enable Matrix effect, autoclicker (stop with `` ` ``), or 100-tab spam.  
   - **Script**: write or load JS and click **Execute**.  
   - **Settings**: change appearance, reset, or view version info.  
5. To close Flux Client at any time, click the ✕ icon (or toggle **Reset Menu** in Settings).

---

## Changelog

See [CHANGELOG](CHANGELOG) for a full history of updates and version details.

---

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.  
