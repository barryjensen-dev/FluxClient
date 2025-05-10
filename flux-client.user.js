// ==UserScript==
// @name         Flux Client
// @namespace    none
// @version      1
// @description  A lightweight, customizable Tampermonkey script designed to enhance the user experience in browser-based applications or games. It provides modular functionality with user-controlled toggles for key features such as aimbot, ESP, custom crosshair, and anti-AFK. Each feature is integrated through keyboard shortcuts for fast activation, and the script maintains a clean interface while offering power-user utilities.
// @author       barryjensen-dev
// @match        *://*/*
// @exclude      *://ogs.google.com/*
// @exclude      *://accounts.google.com/*
// @exclude      *://www.google.com/*
// @exclude      *://google.com/*
// @exclude      *://youtube.com/*
// @exclude      *://youtube.com/*
// @exclude      *://facebook.com/*
// @exclude      *://www.facebook.com/*
// @exclude      *://twitter.com/*
// @exclude      *://www.twitter.com/*
// @exclude      *://x.com/*
// @exclude      *://www.x.com/*
// @exclude      *://example.com/*
// @exclude      *://openai.com/*
// @exclude      *://chatgpt.com/*
// @exclude      *://github.com/*
// @exclude      *://www.github.com/*
// @exclude      *://*.github.dev/*
// @exclude      *://roblox.com/*
// @exclude      *://www.roblox.com*
// @exclude      *://github-api.arkoselabs.com/*
// @exclude      *://*.google.com/recaptcha/*
// @exclude      *://www.google.com/recaptcha/*
// @exclude      *://www.recaptcha.net/recaptcha/*
// @exclude      *://hcaptcha.com/*
// @exclude      *://*.hcaptcha.com/*
// @exclude      *://*.arkoselabs.com/*
// @exclude      *://*.funcaptcha.com/*
// @exclude      *://*.captcha-delivery.com/*
// @exclude      *://*.captcha.com/*
// @exclude      *://*.cloudflare.com/cdn-cgi/challenge-platform/*
// @exclude      *://*.cloudflarechallenge.com/*
// @exclude      *://*.hcaptcha.com/*
// @exclude      *://hcaptcha.com/*
// @icon         https://i.ibb.co/YBGBXPFj/icon.png
// @grant        none
// @downloadURL  https://github.com/barryjensen-dev/fluxclient/raw/refs/heads/main/flux-client.user.js
// @updateURL    https://github.com/barryjensen-dev/fluxclient/raw/refs/heads/main/flux-client.user.js
// ==/UserScript==

(function() {
    // --- Global state and constants ---
    // This initial check MUST be outside the string passed to new Function()
    if (document.getElementById('flux-client-container')) {
        alert('Flux Client is already active or was not properly dismissed.');
        return;
    }

    const FLUX_CLIENT_ID = 'flux-client-container';
    const REQUIRED_KEY = 'release';

    // These variables will be in the scope of the new Function
    let autoclickIntervalId = null;
    let isAutoclicking = false;
    let lastMouseX = 0;
    let lastMouseY = 0;
    let autoclickerKeydownListener = null;
    let mouseMoveListenerGlobal = null;

    let matrixIntervalId = null;
    let matrixCanvas = null;
    let matrixCtx = null;
    const matrixFontSize = 12;
    let matrixColumns = 0;
    let matrixDrops = [];
    const matrixChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890@#$%^&*()+=_[]{}\\|;:?/.,<>-ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽltal';

    // Define large strings first
    const stylesString = `
        :root {
           --flux-bg-dark: #282c34; --flux-bg-light: #3a3f4b; --flux-accent: #61afef;
           --flux-text: #abb2bf; --flux-text-bright: #ffffff; --flux-border: #4f5666;
           --flux-shadow: rgba(0, 0, 0, 0.5); --flux-shadow-light: rgba(97, 175, 239, 0.3);
           --flux-success: #98c379; --flux-danger: #e06c75; --flux-rainbow-speed: 4s;
           --flux-animation-duration: 0.3s; --flux-animation-timing: cubic-bezier(0.25, 0.8, 0.25, 1);
           --flux-control-bar-height: 45px;
        }
        #${FLUX_CLIENT_ID} {
            position: fixed; top: 50px; left: 50px;
            min-height: var(--flux-control-bar-height); width: 520px;
            background-color: var(--flux-bg-dark); border: 1px solid var(--flux-border);
            border-radius: 16px; box-shadow: 0 15px 35px var(--flux-shadow);
            color: var(--flux-text); font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            z-index: 9999999 !important; overflow: hidden; display: flex; flex-direction: column;
            opacity: 0; transform: scale(0.9) translateY(20px);
            transition: opacity var(--flux-animation-duration) var(--flux-animation-timing),
                        transform var(--flux-animation-duration) var(--flux-animation-timing),
                        width var(--flux-animation-duration) var(--flux-animation-timing),
                        min-height var(--flux-animation-duration) var(--flux-animation-timing),
                        background-color var(--flux-animation-duration) var(--flux-animation-timing),
                        box-shadow var(--flux-animation-duration) var(--flux-animation-timing);
            user-select: none;
        }
        #${FLUX_CLIENT_ID}.flux-minimized { width: 220px; min-height: var(--flux-control-bar-height); border-radius: 10px; }
        #${FLUX_CLIENT_ID}.flux-minimized #flux-main-interface { display: none; }
        #${FLUX_CLIENT_ID}.flux-minimized #flux-control-bar { border-bottom: none; }
        #${FLUX_CLIENT_ID}.flux-visible { opacity: 1; transform: scale(1) translateY(0); }
        #${FLUX_CLIENT_ID}.flux-rainbow-active { animation: flux-rainbow-border var(--flux-rainbow-speed) linear infinite; }
        @keyframes flux-rainbow-border {
            0%, 100% { border-color: hsl(0, 80%, 65%); box-shadow: 0 0 15px hsla(0, 80%, 65%, 0.5); }
            17% { border-color: hsl(60, 80%, 65%); box-shadow: 0 0 15px hsla(60, 80%, 65%, 0.5); }
            33% { border-color: hsl(120, 80%, 65%); box-shadow: 0 0 15px hsla(120, 80%, 65%, 0.5); }
            50% { border-color: hsl(180, 80%, 65%); box-shadow: 0 0 15px hsla(180, 80%, 65%, 0.5); }
            67% { border-color: hsl(240, 80%, 65%); box-shadow: 0 0 15px hsla(240, 80%, 65%, 0.5); }
            83% { border-color: hsl(300, 80%, 65%); box-shadow: 0 0 15px hsla(300, 80%, 65%, 0.5); }
        }
        #flux-key-screen { padding: 40px 30px; display: flex; flex-direction: column; align-items: center; text-align: center; transition: opacity 0.2s ease-out, transform 0.2s ease-out; width: 100%; box-sizing: border-box; }
        #flux-key-screen.flux-hidden { opacity: 0; transform: scale(0.9); pointer-events: none; position: absolute; }
        #flux-key-title { font-size: 1.5em; font-weight: 600; color: var(--flux-text-bright); margin-bottom: 10px; }
        #flux-key-subtitle { font-size: 0.95em; margin-bottom: 25px; color: var(--flux-text); }
        #flux-key-input { width: calc(100% - 24px); padding: 12px; margin-bottom: 20px; background-color: var(--flux-bg-light); border: 1px solid var(--flux-border); border-radius: 8px; color: var(--flux-text-bright); font-size: 1em; text-align: center; outline: none; transition: border-color 0.2s ease, box-shadow 0.2s ease; }
        #flux-key-input:focus { border-color: var(--flux-accent); box-shadow: 0 0 0 3px var(--flux-shadow-light); }
        #flux-key-input.flux-shake { animation: flux-shake 0.5s var(--flux-animation-timing); border-color: var(--flux-danger) !important; }
        #flux-key-button { width: calc(100% - 24px); padding: 12px 20px; background-color: var(--flux-accent); border: none; border-radius: 8px; color: var(--flux-bg-dark); font-weight: 600; font-size: 1em; cursor: pointer; transition: background-color 0.2s ease, transform 0.1s ease; }
        #flux-key-button:hover { background-color: hsl(207, 80%, 70%); transform: translateY(-2px); }
        #flux-key-button:active { transform: translateY(0px) scale(0.98); }
        #flux-key-error { color: var(--flux-danger); font-size: 0.85em; margin-top: 10px; min-height: 1.2em; visibility: hidden; opacity: 0; transition: opacity 0.2s ease, visibility 0.2s ease; }
        #flux-key-error.flux-visible { visibility: visible; opacity: 1; }
        @keyframes flux-shake { 0%, 100% { transform: translateX(0); } 10%, 30%, 50%, 70%, 90% { transform: translateX(-8px); } 20%, 40%, 60%, 80% { transform: translateX(8px); } }
        #flux-control-bar { display: flex; align-items: center; justify-content: space-between; padding: 0 15px; height: var(--flux-control-bar-height); background-color: var(--flux-bg-light); border-bottom: 1px solid var(--flux-border); cursor: move; transition: background-color var(--flux-animation-duration) var(--flux-animation-timing); }
        #flux-control-bar-title { font-size: 1.1em; font-weight: 600; color: var(--flux-text-bright); }
        .flux-window-controls button { background: none; border: none; color: var(--flux-text); font-size: 1.5em; cursor: pointer; padding: 0 6px; transition: color 0.2s ease, transform 0.2s ease; line-height: 1; }
        .flux-window-controls button:hover { color: var(--flux-text-bright); transform: scale(1.1); }
        #flux-close-btn:hover { color: var(--flux-danger) !important; }
        #flux-main-interface { display: none; flex-direction: row; flex-grow: 1; opacity: 0; animation: flux-fadeInAndScaleMain var(--flux-animation-duration) var(--flux-animation-timing) forwards; animation-delay: 0.1s; min-height: 400px; }
        #flux-main-interface.flux-visible { display: flex; }
        @keyframes flux-fadeInAndScaleMain { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }
        #flux-sidebar { width: 160px; background-color: var(--flux-bg-light); padding: 15px 0; display: flex; flex-direction: column; border-right: 1px solid var(--flux-border); flex-shrink: 0; transition: background-color var(--flux-animation-duration) var(--flux-animation-timing); }
        .flux-nav-header { padding: 0 20px 15px 20px; font-size: 1.1em; font-weight: 600; color: var(--flux-text-bright); border-bottom: 1px solid var(--flux-border); margin-bottom: 10px; }
        .flux-nav-item { display: flex; align-items: center; padding: 12px 20px; cursor: pointer; color: var(--flux-text); font-size: 0.95em; transition: background-color 0.2s ease, color 0.2s ease; position: relative; }
        .flux-nav-item svg { margin-right: 10px; fill: currentColor; min-width:18px; }
        .flux-nav-item:hover { background-color: rgba(0,0,0,0.1); color: var(--flux-text-bright); }
        .flux-nav-item.active { color: var(--flux-accent); font-weight: 600; background-color: rgba(0,0,0,0.05); }
        .flux-nav-item.active::before { content: ''; position: absolute; left: 0; top: 50%; transform: translateY(-50%); width: 4px; height: 70%; background-color: var(--flux-accent); border-top-right-radius: 4px; border-bottom-right-radius: 4px; }
        #flux-content-area { flex-grow: 1; padding: 20px; display: flex; flex-direction: column; overflow-y: auto; max-height: 350px; scrollbar-width: thin; scrollbar-color: var(--flux-accent) var(--flux-bg-dark); }
        #flux-content-area::-webkit-scrollbar { width: 8px; }
        #flux-content-area::-webkit-scrollbar-track { background: var(--flux-bg-dark); border-radius: 4px; }
        #flux-content-area::-webkit-scrollbar-thumb { background-color: var(--flux-bg-light); border-radius: 4px; border: 1px solid var(--flux-bg-dark); }
        #flux-content-area::-webkit-scrollbar-thumb:hover { background-color: var(--flux-accent); }
        .flux-content-section { display: none; animation: flux-contentFadeIn 0.4s var(--flux-animation-timing) forwards; }
        .flux-content-section.active { display: block; }
        @keyframes flux-contentFadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
        .flux-card { background-color: var(--flux-bg-light); padding: 20px; border-radius: 12px; margin-bottom: 20px; box-shadow: 0 5px 15px rgba(0,0,0,0.2); transition: background-color var(--flux-animation-duration) var(--flux-animation-timing); }
        .flux-card-title { font-size: 1.1em; color: var(--flux-text-bright); margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px solid var(--flux-border); font-weight: 500; }
        #flux-proxy-section { display: flex; align-items: center; gap: 10px; }
        #flux-proxy-input { flex-grow: 1; padding: 10px; background-color: var(--flux-bg-dark); border: 1px solid var(--flux-border); border-radius: 8px; color: var(--flux-text-bright); font-size: 0.9em; outline: none; transition: border-color 0.2s ease, box-shadow 0.2s ease; }
        #flux-proxy-input:focus { border-color: var(--flux-accent); box-shadow: 0 0 0 3px var(--flux-shadow-light); }
        #flux-proxy-button, .flux-action-button { padding: 10px 18px; background-color: var(--flux-accent); border: none; border-radius: 8px; color: var(--flux-bg-dark); font-weight: 600; cursor: pointer; transition: background-color 0.2s ease, transform 0.15s ease; text-align:center; }
        #flux-proxy-button:hover, .flux-action-button:hover { background-color: hsl(207, 80%, 70%); transform: translateY(-2px) scale(1.02); }
        #flux-proxy-button:active, .flux-action-button:active { transform: translateY(0px) scale(0.98); }
        .flux-toggle-container { display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid var(--flux-border); }
        .flux-card .flux-toggle-container:last-of-type { border-bottom: none; padding-bottom: 0; }
        .flux-card .flux-toggle-container:first-of-type { padding-top: 0; }
        .flux-toggle-label { font-size: 0.95em; display: flex; align-items: center; }
        .flux-toggle-label .flux-beta-tag, .flux-toggle-label .flux-new-tag { font-size: 0.7em; color: white; padding: 3px 6px; border-radius: 5px; margin-left: 8px; font-weight: bold; }
        .flux-toggle-label .flux-beta-tag { background-color: var(--flux-danger); }
        .flux-toggle-label .flux-new-tag { background-color: var(--flux-success); }
        .flux-switch { position: relative; display: inline-block; width: 44px; height: 24px; }
        .flux-switch input { opacity: 0; width: 0; height: 0; }
        .flux-slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: var(--flux-bg-dark); transition: .3s var(--flux-animation-timing); border-radius: 24px; }
        .flux-slider:before { position: absolute; content: ''; height: 18px; width: 18px; left: 3px; bottom: 3px; background-color: var(--flux-text); transition: .3s var(--flux-animation-timing); border-radius: 50%; box-shadow: 0 1px 3px rgba(0,0,0,0.3); }
        input:checked + .flux-slider { background-color: var(--flux-accent); }
        input:checked + .flux-slider:before { transform: translateX(20px); background-color: white; }
        .flux-slider-container label { display: block; margin-bottom: 10px; font-size: 0.95em; }
        input[type='range'].flux-color-slider { -webkit-appearance: none; appearance: none; width: 100%; height: 8px; background: linear-gradient(to right, red, yellow, lime, cyan, blue, magenta, red); border-radius: 5px; outline: none; cursor: pointer; border: 1px solid var(--flux-border); }
        input[type='range'].flux-color-slider::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 20px; height: 20px; background: var(--flux-accent); border-radius: 50%; border: 3px solid var(--flux-bg-dark); cursor: pointer; transition: background-color 0.2s ease, transform 0.2s ease; }
        input[type='range'].flux-color-slider::-moz-range-thumb { width: 18px; height: 18px; background: var(--flux-accent); border-radius: 50%; border: 3px solid var(--flux-bg-dark); cursor: pointer; transition: background-color 0.2s ease; }
        input[type='range'].flux-color-slider:hover::-webkit-slider-thumb { background-color: hsl(207, 80%, 70%); transform: scale(1.1); }
        input[type='range'].flux-color-slider:hover::-moz-range-thumb { background-color: hsl(207, 80%, 70%); }
        #flux-matrix-canvas { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 9999998; pointer-events: none; display: none; }
        #flux-script-input { width: 100%; height: 200px; background-color: var(--flux-bg-dark); color: var(--flux-text-bright); border: 1px solid var(--flux-border); border-radius: 8px; padding: 10px; margin-bottom: 10px; font-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace; font-size: 0.9em; resize: vertical; box-sizing: border-box; }
        #flux-script-input:focus { border-color: var(--flux-accent); box-shadow: 0 0 0 3px var(--flux-shadow-light); }
        .flux-script-buttons-row { display: flex; gap: 10px; margin-bottom: 10px; }
        .flux-script-buttons-row:last-child { margin-bottom: 0; }
        .flux-script-buttons-row button { flex-grow: 1; padding: 10px 15px; border: none; border-radius: 8px; color: var(--flux-bg-dark); font-weight: 600; cursor: pointer; transition: background-color 0.2s ease, transform 0.15s ease; }
        .flux-script-buttons-row button:hover { transform: translateY(-2px) scale(1.02); }
        .flux-script-buttons-row button:active { transform: translateY(0px) scale(0.98); }
        #flux-script-execute-button { background-color: var(--flux-accent); }
        #flux-script-execute-button:hover { background-color: hsl(207, 80%, 70%); }
        #flux-script-execute-backup-button { background-color: var(--flux-bg-light); color: var(--flux-text-bright); border: 1px solid var(--flux-border); }
        #flux-script-execute-backup-button:hover { background-color: var(--flux-border); }
        #flux-script-save-button, #flux-script-load-button-styled { background-color: var(--flux-bg-light); color: var(--flux-text-bright); border: 1px solid var(--flux-border); }
        #flux-script-save-button:hover, #flux-script-load-button-styled:hover { background-color: var(--flux-border); }
        #flux-script-file-input { display: none; }
        .flux-about-info { text-align: center; padding: 10px 0; }
        .flux-about-info p { margin: 5px 0; font-size: 0.95em; }
        .flux-about-info .version { font-size: 0.9em; color: var(--flux-text); }
        .flux-about-info .credits { font-weight: 500; color: var(--flux-text-bright); }
        .flux-dark-mode-filter { filter: invert(1) hue-rotate(180deg); background-color: #1a1a1a; }
        .flux-dark-mode-filter img, .flux-dark-mode-filter video, .flux-dark-mode-filter iframe { filter: invert(1) hue-rotate(180deg); }

        @keyframes fluxSpinPageAnim { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        html.flux-spin-documentElement-active body { animation: fluxSpinPageAnim 10s linear infinite; transform-origin: center center; }
        html.flux-spin-documentElement-active { overflow-x: hidden !important; }

        @keyframes fluxShakePageAnim {
            10%, 90% { transform: translate3d(-3px, 0, 0) rotate(-0.1deg); }
            20%, 80% { transform: translate3d(5px, 0, 0) rotate(0.1deg); }
            30%, 50%, 70% { transform: translate3d(-7px, 0, 0) rotate(-0.2deg); }
            40%, 60% { transform: translate3d(7px, 0, 0) rotate(0.2deg); }
        }
        html.flux-shake-documentElement-active body { animation: fluxShakePageAnim 0.25s cubic-bezier(.36,.07,.19,.97) infinite; }

        html.flux-page-full-invert { filter: invert(100%) !important; background: white !important; }
        html.flux-page-full-invert img,
        html.flux-page-full-invert video,
        html.flux-page-full-invert iframe,
        html.flux-page-full-invert canvas { filter: invert(100%) !important; }
        html.flux-page-full-invert #${FLUX_CLIENT_ID} { filter: invert(100%) !important; }

        #${FLUX_CLIENT_ID}.flux-menu-transparent {
            background-color: rgba(40, 44, 52, 0.7) !important;
            backdrop-filter: blur(5px);
            -webkit-backdrop-filter: blur(5px);
        }
        #${FLUX_CLIENT_ID}.flux-menu-transparent #flux-control-bar,
        #${FLUX_CLIENT_ID}.flux-menu-transparent #flux-sidebar {
            background-color: rgba(58, 63, 75, 0.6) !important;
        }
        #${FLUX_CLIENT_ID}.flux-menu-transparent .flux-card {
            background-color: rgba(58, 63, 75, 0.5) !important;
        }

        #${FLUX_CLIENT_ID}.flux-pulsing-shadow-active { animation: fluxPulseShadowKeyframe 2s infinite alternate; }
        @keyframes fluxPulseShadowKeyframe {
            from { box-shadow: 0 15px 35px var(--flux-shadow); }
            to { box-shadow: 0 15px 45px var(--flux-shadow), 0 0 20px var(--flux-accent); }
        }

        /* Notification Popup CSS */
        .flux-notification-popup {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background-color: var(--flux-accent);
            color: var(--flux-bg-dark);
            padding: 10px 20px;
            border-radius: 8px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
            z-index: 10000000 !important; /* Ensure it's above the client */
            opacity: 0;
            transform: translateY(20px) scale(0.95);
            transition: opacity 0.3s ease, transform 0.3s ease;
            font-size: 0.9em;
            font-weight: 500;
            pointer-events: none; /* Allow clicks through */
        }
        .flux-notification-popup.flux-show {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
    `;

    const keyScreenHTMLString = `
        <div id="flux-key-screen">
            <div id="flux-key-title">Flux Client</div>
            <div id="flux-key-subtitle">Enter your access key to continue</div>
            <input type="password" id="flux-key-input" placeholder="••••••••••">
            <button id="flux-key-button">Unlock</button>
            <div id="flux-key-error"></div>
        </div>
    `;

    const mainMenuHTMLString = `
        <div id="flux-control-bar">
            <span id="flux-control-bar-title">Flux Client</span>
            <div class="flux-window-controls">
                <button id="flux-minimize-btn" title="Minimize">—</button>
                <button id="flux-close-btn" title="Close">X</button>
            </div>
        </div>
        <div id="flux-main-interface">
            <div id="flux-sidebar">
                <div class="flux-nav-header">Navigation</div>
                <div class="flux-nav-item active" data-section="proxy">
                    <svg viewBox="0 0 24 24" width="18" height="18"><path d="M17 7h-4v2h4c1.65 0 3 1.35 3 3s-1.35 3-3 3h-4v2h4c2.76 0 5-2.24 5-5s-2.24-5-5-5zm-6 8H7c-1.65 0-3-1.35-3-3s1.35-3 3-3h4V7H7c-2.76 0-5 2.24 5 5s2.24 5 5 5h4v-2zm-3-4h8v2H8v-2z"/></svg>
                    Proxy
                </div>
                <div class="flux-nav-item" data-section="mods">
                     <svg viewBox="0 0 24 24" width="18" height="18"><path d="M3.783 14.394A3.001 3.001 0 016 12.001c0-1.102.602-2.055 1.481-2.555L6 6.001H3v2h1.51C3.568 8.878 3 10.366 3 12.001c0 1.02.312 1.948.844 2.723L3 16.001v2h3.007l-.224-.607zM21 6.001h-3l-1.488 3.445A2.99 2.99 0 0118 12.001a2.99 2.99 0 01-1.488 2.555L18 18.001h3v-2h-1.51a3.007 3.007 0 00.942-1.278c.14-.38.22-.791.22-1.223a3.001 3.001 0 00-1.068-2.127.436.436 0 00.068-.272c0-.414-.166-.798-.437-1.082A2.985 2.985 0 0019.51 8.001H21v-2zm-9 2a4 4 0 100 8 4 4 0 000-8zm0 6a2 2 0 110-4 2 2 0 010 4z"/></svg>
                    Mods
                </div>
                <div class="flux-nav-item" data-section="fun">
                    <svg viewBox="0 0 24 24" width="18" height="18"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5s.67 1.5 1.5 1.5zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/></svg>
                    Fun
                </div>
                <div class="flux-nav-item" data-section="script">
                    <svg viewBox="0 0 24 24" width="18" height="18"><path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"></path></svg>
                    Script
                </div>
                 <div class="flux-nav-item" data-section="settings">
                    <svg viewBox="0 0 24 24" width="18" height="18"><path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12-.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/></svg>
                    Settings
                </div>
            </div>
            <div id="flux-content-area">
                <div id="flux-content-section-proxy" class="flux-content-section active">
                    <div class="flux-card"><div class="flux-card-title">Proxy Connection</div><div id="flux-proxy-section"><input type="text" id="flux-proxy-input" placeholder="Multiple URLs will be opened."><button id="flux-proxy-button">Go</button></div></div>
                    <div class="flux-card"><div class="flux-card-title">Utilities</div>
                        <div class="flux-toggle-container"><span class="flux-toggle-label">VPN V1.6</span><label class="flux-switch"><input type="checkbox" id="flux-toggle-vpn"><span class="flux-slider"></span></label></div>
                        <div class="flux-toggle-container"><span class="flux-toggle-label">Anti Light Speed V2 <span class="flux-new-tag">NEW</span></span><label class="flux-switch"><input type="checkbox" id="flux-toggle-als"><span class="flux-slider"></span></label></div>
                        <div class="flux-toggle-container"><span class="flux-toggle-label">Anti Admin V1.4</span><label class="flux-switch"><input type="checkbox" id="flux-toggle-aa"><span class="flux-slider"></span></label></div>
                        <div class="flux-toggle-container"><span class="flux-toggle-label">Virtual Clone <span class="flux-beta-tag">BETA</span></span><label class="flux-switch"><input type="checkbox" id="flux-toggle-vc"><span class="flux-slider"></span></label></div>
                    </div>
                </div>
                <div id="flux-content-section-mods" class="flux-content-section">
                    <div class="flux-card"><div class="flux-card-title">Page Tools</div>
                        <div class="flux-toggle-container"><span class="flux-toggle-label">Dark Website</span><label class="flux-switch"><input type="checkbox" id="flux-toggle-dark"><span class="flux-slider"></span></label></div>
                        <div class="flux-toggle-container"><span class="flux-toggle-label">Light Website</span><label class="flux-switch"><input type="checkbox" id="flux-toggle-light"><span class="flux-slider"></span></label></div>
                        <div class="flux-toggle-container"><span class="flux-toggle-label">Inspect Page</span><label class="flux-switch"><input type="checkbox" id="flux-toggle-inspect"><span class="flux-slider"></span></label></div>
                    </div>
                     <div class="flux-card"><div class="flux-card-title">Page Actions</div>
                        <div class="flux-toggle-container"><span class="flux-toggle-label">Hard Reset Page</span><label class="flux-switch"><input type="checkbox" id="flux-toggle-hardreset"><span class="flux-slider"></span></label></div>
                        <div class="flux-toggle-container"><span class="flux-toggle-label">Destroy Page</span><label class="flux-switch"><input type="checkbox" id="flux-toggle-destroypage"><span class="flux-slider"></span></label></div>
                    </div>
                </div>
                <div id="flux-content-section-fun" class="flux-content-section">
                     <div class="flux-card"><div class="flux-card-title">Fun</div>
                        <div class="flux-toggle-container"><span class="flux-toggle-label">Matrix Effect</span><label class="flux-switch"><input type="checkbox" id="flux-toggle-matrix"><span class="flux-slider"></span></label></div>
                        <div class="flux-toggle-container"><span class="flux-toggle-label">Autoclicker (Stop: \`)</span><label class="flux-switch"><input type="checkbox" id="flux-toggle-autoclick"><span class="flux-slider"></span></label></div>
                        <div class="flux-toggle-container"><span class="flux-toggle-label">Page Spammer (100 Tabs, Once)</span><label class="flux-switch"><input type="checkbox" id="flux-toggle-pagespam"><span class="flux-slider"></span></label></div>
                        <div class="flux-toggle-container"><span class="flux-toggle-label">Spin Page</span><label class="flux-switch"><input type="checkbox" id="flux-toggle-spinpage"><span class="flux-slider"></span></label></div>
                        <div class="flux-toggle-container"><span class="flux-toggle-label">Shake Page</span><label class="flux-switch"><input type="checkbox" id="flux-toggle-shakepage"><span class="flux-slider"></span></label></div>
                        <div class="flux-toggle-container"><span class="flux-toggle-label">Invert Page Colors</span><label class="flux-switch"><input type="checkbox" id="flux-toggle-invertpage"><span class="flux-slider"></span></label></div>
                    </div>
                </div>
                <div id="flux-content-section-script" class="flux-content-section">
                     <div class="flux-card">
                        <div class="flux-card-title">Script Executor</div>
                        <textarea id="flux-script-input" placeholder="Enter JavaScript code here..."></textarea>
                        <div class="flux-script-buttons-row">
                            <button id="flux-script-execute-button">Execute</button>
                            <button id="flux-script-execute-backup-button">Backup Execute</button>
                        </div>
                        <div class="flux-script-buttons-row">
                             <button id="flux-script-save-button">Save Script</button>
                             <button id="flux-script-load-button-styled">Load Script</button>
                             <input type="file" id="flux-script-file-input" accept=".js,.txt">
                        </div>
                    </div>
                </div>
                <div id="flux-content-section-settings" class="flux-content-section">
                    <div class="flux-card">
                        <div class="flux-card-title">About</div>
                        <div class="flux-about-info">
                            <p class="credits" style="font-size: 1.2em; color: var(--flux-accent);">Flux Client</p>
                            <p class="version">Version: V12</p>
                            <p>Developed by <span style="color: var(--flux-text-bright); font-weight:bold;">Kona</span> and <span style="color: var(--flux-text-bright); font-weight:bold;">Bozzz</span></p>
                        </div>
                    </div>
                    <div class="flux-card">
                        <div class="flux-card-title">Menu Appearance</div>
                        <div class="flux-toggle-container"><span class="flux-toggle-label">Rainbow Menu Border</span><label class="flux-switch"><input type="checkbox" id="flux-toggle-rainbow"><span class="flux-slider"></span></label></div>
                        <div class="flux-slider-container"><label for="flux-color-slider">Custom Menu Accent</label><input type="range" id="flux-color-slider" class="flux-color-slider" min="0" max="360" value="207"></div>
                        <div class="flux-toggle-container"><span class="flux-toggle-label">Transparent Menu</span><label class="flux-switch"><input type="checkbox" id="flux-toggle-transparentmenu"><span class="flux-slider"></span></label></div>
                        <div class="flux-toggle-container"><span class="flux-toggle-label">Pulsing Menu Shadow</span><label class="flux-switch"><input type="checkbox" id="flux-toggle-pulsingshadow"><span class="flux-slider"></span></label></div>
                    </div>
                     <div class="flux-card">
                        <div class="flux-card-title">Client Options</div>
                        <div class="flux-toggle-container"><span class="flux-toggle-label">Reset Menu</span><label class="flux-switch"><input type="checkbox" id="flux-toggle-resetmenu"><span class="flux-slider"></span></label></div>
                        <div class="flux-toggle-container"><span class="flux-toggle-label">Client Fix</span><label class="flux-switch"><input type="checkbox" id="flux-toggle-clientfix"><span class="flux-slider"></span></label></div>
                    </div>
                </div>
            </div>
        </div>
    `;

    const scriptParts = [
        `const FLUX_CLIENT_ID = '${FLUX_CLIENT_ID}';`,
        `const REQUIRED_KEY = '${REQUIRED_KEY}';`,
        "let autoclickIntervalId = null; let isAutoclicking = false; let lastMouseX = 0; let lastMouseY = 0;",
        "let autoclickerKeydownListener = null; let mouseMoveListenerGlobal = null;",
        "let matrixIntervalId = null; let matrixCanvas = null; let matrixCtx = null;",
        `const matrixFontSize = ${matrixFontSize}; let matrixColumns = 0; let matrixDrops = [];`,
        `const matrixChars = '${matrixChars.replace(/'/g, "\\'")}';`,
        `const stylesString = ${JSON.stringify(stylesString)};`,
        `const keyScreenHTMLString = ${JSON.stringify(keyScreenHTMLString)};`,
        `const mainMenuHTMLString = ${JSON.stringify(mainMenuHTMLString)};`,
        "const styleSheetElement = document.createElement('style'); styleSheetElement.textContent = stylesString; document.head.appendChild(styleSheetElement);",
        "const clientContainer = document.createElement('div'); clientContainer.id = FLUX_CLIENT_ID;",
        "function parseHTML(htmlString) { const parser = new DOMParser(); const doc = parser.parseFromString(htmlString, 'text/html'); const fragment = document.createDocumentFragment(); while (doc.body.firstChild) { fragment.appendChild(doc.body.firstChild); } return fragment; }",
        "clientContainer.appendChild(parseHTML(keyScreenHTMLString)); document.body.appendChild(clientContainer);",
        "setTimeout(() => { clientContainer.classList.add('flux-visible'); }, 10);",

        // Notification Function
        "function showFluxNotification(message) { " +
        "  const existingNotif = document.getElementById('flux-active-notification');" +
        "  if (existingNotif) { existingNotif.remove(); }" +
        "  const notif = document.createElement('div');" +
        "  notif.id = 'flux-active-notification';" +
        "  notif.className = 'flux-notification-popup';" +
        "  notif.textContent = message;" +
        "  document.body.appendChild(notif);" +
        "  setTimeout(() => { notif.classList.add('flux-show'); }, 10);" +
        "  setTimeout(() => { notif.classList.remove('flux-show'); setTimeout(() => { if (notif.parentNode) notif.remove(); }, 300); }, 2700);" +
        "}",

        "const keyInputElement = document.getElementById('flux-key-input');",
        "const keyButtonElement = document.getElementById('flux-key-button');",
        "const keyErrorElement = document.getElementById('flux-key-error');",
        "const keyScreenElement = document.getElementById('flux-key-screen');",
        "const handleUnlockAttempt = () => { if (keyInputElement.value === REQUIRED_KEY) { keyErrorElement.classList.remove('flux-visible'); keyScreenElement.classList.add('flux-hidden'); setTimeout(() => { keyScreenElement.remove(); clientContainer.appendChild(parseHTML(mainMenuHTMLString)); initializeMainMenu(); const mainInterface = document.getElementById('flux-main-interface'); if (mainInterface) mainInterface.classList.add('flux-visible'); showFluxNotification('Welcome to Flux Client!'); }, 250); } else { keyInputElement.classList.add('flux-shake'); keyErrorElement.textContent = 'Incorrect Key. Access Denied.'; keyErrorElement.classList.add('flux-visible'); keyInputElement.value = ''; setTimeout(() => { keyInputElement.classList.remove('flux-shake'); }, 500); showFluxNotification('Incorrect Key!'); } };",
        "keyButtonElement.onclick = handleUnlockAttempt;",
        "keyInputElement.onkeypress = function(e) { if (e.key === 'Enter') { handleUnlockAttempt(); } else { keyErrorElement.classList.remove('flux-visible'); } };",
        "function drawMatrix() { if (!matrixCtx || !matrixCanvas) return; matrixCtx.fillStyle = 'rgba(0,0,0,0.05)'; matrixCtx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height); matrixCtx.fillStyle = '#0F0'; matrixCtx.font = matrixFontSize + 'px monospace'; for (let i = 0; i < matrixDrops.length; i++) { const text = matrixChars[Math.floor(Math.random() * matrixChars.length)]; matrixCtx.fillText(text, i * matrixFontSize, matrixDrops[i] * matrixFontSize); if (matrixDrops[i] * matrixFontSize > matrixCanvas.height && Math.random() > 0.975) matrixDrops[i] = 0; matrixDrops[i]++; } }",
        "function initializeMainMenu() {",
        "const closeButton = document.getElementById('flux-close-btn');",
        "const minimizeButton = document.getElementById('flux-minimize-btn');",
        "const controlBar = document.getElementById('flux-control-bar');",
        "const navItems = clientContainer.querySelectorAll('.flux-nav-item');",
        "const contentSections = clientContainer.querySelectorAll('.flux-content-section');",
        "const proxyInputElement = document.getElementById('flux-proxy-input');",
        "const proxyButtonElement = document.getElementById('flux-proxy-button');",
        "const colorSlider = document.getElementById('flux-color-slider');",
        "const toggleDark = document.getElementById('flux-toggle-dark');",
        "const toggleLight = document.getElementById('flux-toggle-light');",
        "const toggleRainbow = document.getElementById('flux-toggle-rainbow');",
        "const toggleInspect = document.getElementById('flux-toggle-inspect');",
        "const toggleVpn = document.getElementById('flux-toggle-vpn');",
        "const toggleAls = document.getElementById('flux-toggle-als');",
        "const toggleAa = document.getElementById('flux-toggle-aa');",
        "const toggleVc = document.getElementById('flux-toggle-vc');",
        "const toggleMatrix = document.getElementById('flux-toggle-matrix');",
        "const toggleAutoclick = document.getElementById('flux-toggle-autoclick');",
        "const togglePageSpam = document.getElementById('flux-toggle-pagespam');",
        "const toggleHardReset = document.getElementById('flux-toggle-hardreset');",
        "const toggleDestroyPage = document.getElementById('flux-toggle-destroypage');",
        "const toggleResetMenu = document.getElementById('flux-toggle-resetmenu');",
        "const toggleClientFix = document.getElementById('flux-toggle-clientfix');",
        "const scriptInput = document.getElementById('flux-script-input');",
        "const scriptExecuteButton = document.getElementById('flux-script-execute-button');",
        "const scriptExecuteBackupButton = document.getElementById('flux-script-execute-backup-button');",
        "const scriptSaveButton = document.getElementById('flux-script-save-button');",
        "const scriptLoadButtonStyled = document.getElementById('flux-script-load-button-styled');",
        "const scriptFileInput = document.getElementById('flux-script-file-input');",
        "const toggleSpinPage = document.getElementById('flux-toggle-spinpage');",
        "const toggleShakePage = document.getElementById('flux-toggle-shakepage');",
        "const toggleInvertPage = document.getElementById('flux-toggle-invertpage');",
        "const toggleTransparentMenu = document.getElementById('flux-toggle-transparentmenu');",
        "const togglePulsingShadow = document.getElementById('flux-toggle-pulsingshadow');",

        "let originalContentEditable = document.body.isContentEditable; let isMinimized = false;",
        "mouseMoveListenerGlobal = (e) => { lastMouseX = e.clientX; lastMouseY = e.clientY; };",
        "document.addEventListener('mousemove', mouseMoveListenerGlobal);",
        "const performClose = () => { if (isAutoclicking) { isAutoclicking = false; clearInterval(autoclickIntervalId); if (autoclickerKeydownListener) document.removeEventListener('keydown', autoclickerKeydownListener); autoclickerKeydownListener = null; if(toggleAutoclick) toggleAutoclick.checked = false;} if(mouseMoveListenerGlobal) document.removeEventListener('mousemove', mouseMoveListenerGlobal); mouseMoveListenerGlobal = null; if (matrixCanvas) matrixCanvas.remove(); if (matrixIntervalId) clearInterval(matrixIntervalId); matrixIntervalId = null; clientContainer.style.opacity = '0'; clientContainer.style.transform = 'scale(0.9) translateY(20px)'; setTimeout(() => { if (clientContainer.parentNode) clientContainer.remove(); if (styleSheetElement.parentNode) styleSheetElement.remove(); document.documentElement.classList.remove('flux-dark-mode-filter'); if (document.body.hasAttribute('data-flux-contenteditable-original')) { document.body.contentEditable = document.body.getAttribute('data-flux-contenteditable-original'); document.body.removeAttribute('data-flux-contenteditable-original'); } else { document.body.contentEditable = originalContentEditable; } document.body.style.cursor = ''; document.documentElement.classList.remove('flux-spin-documentElement-active', 'flux-shake-documentElement-active', 'flux-page-full-invert'); document.body.style.animation = ''; document.body.style.transformOrigin = ''; document.body.style.transform = ''; showFluxNotification('Client Closed'); }, 300); };",
        "if (closeButton) closeButton.onclick = performClose;",
        "if (toggleResetMenu) toggleResetMenu.onchange = function() { let state = this.checked ? 'ON' : 'OFF'; showFluxNotification('Reset Menu toggled ' + state); if (this.checked) { performClose(); } };",
        "if (minimizeButton) minimizeButton.onclick = function() { isMinimized = !isMinimized; clientContainer.classList.toggle('flux-minimized', isMinimized); this.innerHTML = isMinimized ? '+' : '—'; this.title = isMinimized ? 'Restore' : 'Minimize'; showFluxNotification(isMinimized ? 'Menu Minimized' : 'Menu Restored');};",
        "navItems.forEach(item => { item.onclick = function() { if (this.classList.contains('active')) return; navItems.forEach(nav => nav.classList.remove('active')); this.classList.add('active'); const targetSectionId = 'flux-content-section-' + this.dataset.section; contentSections.forEach(section => { if (section.id === targetSectionId) { section.style.animation = 'none'; requestAnimationFrame(() => { section.style.animation = ''; section.classList.add('active'); }); } else { section.classList.remove('active'); } }); }; });",

        // Updated Proxy Button Logic
        "if (proxyButtonElement) { " +
        "  const FLUX_PROXY_TARGET_URLS = [" +
        "    'https://english-help.tvjumbleanswers.com/'," +
        "    'http://intergalactic.twilightparadox.com/'," +
        "    'https://edu.anjumanallana.in/'," +
        "    'https://1-q-a-z-z-a-q-1-2-w-s-x-x-s-w-2.suaf.com.ve/'," +
        "    'https://mathedu.loskks.org/'," +
        "    'http://weluvtb.au-32.ch/'," +
        "    'https://submainweb.copytek.cl/'," +
        "    'http://clever.portal2.bashundharafoundation.org.np/'" +
        "  ];" +
        "  proxyButtonElement.onclick = function() { " +
        "    showFluxNotification('Opening proxy list (' + FLUX_PROXY_TARGET_URLS.length + ' sites)...');" +
        "    FLUX_PROXY_TARGET_URLS.forEach(url => { try { window.open(url, '_blank'); } catch(e) { console.error('FluxClient: Failed to open proxy URL:', url, e); showFluxNotification('Error opening URL: ' + url.substring(0,20) + '...'); } });" +
        "    if (proxyInputElement) proxyInputElement.value = ''; " +
        "  };" +
        "}",

        "const setupPlaceholderToggle = (checkbox, name, autoUncheck = true) => { if (!checkbox) { console.warn(`FluxClient: Toggle '\${name}' not found.`); return; } checkbox.onchange = function() { let state = this.checked ? 'ON' : 'OFF'; console.log(`FluxClient: \${name} toggled: \${this.checked} (Placeholder)`); showFluxNotification(name + ' toggled ' + state); }; };",
        "setupPlaceholderToggle(toggleVpn, 'VPN'); setupPlaceholderToggle(toggleAls, 'ALS'); setupPlaceholderToggle(toggleAa, 'AA'); setupPlaceholderToggle(toggleVc, 'VC');",
        "if (toggleClientFix) toggleClientFix.onchange = function() { let state = this.checked ? 'ON' : 'OFF'; showFluxNotification('Client Fix toggled ' + state); console.log('FluxClient: Client Fix toggled: ' + this.checked);};", // Specific for Client Fix

        "if (toggleDark) toggleDark.onchange = function() { let state = this.checked ? 'ON' : 'OFF'; if (this.checked) { document.documentElement.classList.add('flux-dark-mode-filter'); if (toggleLight && toggleLight.checked) toggleLight.checked = false; if(toggleInvertPage && toggleInvertPage.checked) { toggleInvertPage.checked = false; document.documentElement.classList.remove('flux-page-full-invert'); showFluxNotification('Invert Page Colors toggled OFF');} } else { if (!toggleLight || !toggleLight.checked) document.documentElement.classList.remove('flux-dark-mode-filter'); } showFluxNotification('Dark Website toggled ' + state);};",
        "if (toggleLight) toggleLight.onchange = function() { let state = this.checked ? 'ON' : 'OFF'; if (this.checked) { document.documentElement.classList.remove('flux-dark-mode-filter'); if (toggleDark && toggleDark.checked) toggleDark.checked = false; document.documentElement.classList.remove('flux-page-full-invert'); if(toggleInvertPage) toggleInvertPage.checked = false; showFluxNotification('Invert Page Colors toggled OFF'); } showFluxNotification('Light Website toggled ' + state);};",
        "if (toggleRainbow) toggleRainbow.onchange = function() { let state = this.checked ? 'ON' : 'OFF'; clientContainer.classList.toggle('flux-rainbow-active', this.checked); if (!this.checked) { clientContainer.style.borderColor = ''; clientContainer.style.boxShadow = ''; } showFluxNotification('Rainbow Menu Border toggled ' + state);};",
        "if (toggleInspect) toggleInspect.onchange = function() { let state = this.checked ? 'ON' : 'OFF'; if (this.checked) { if (!document.body.hasAttribute('data-flux-contenteditable-original')) { document.body.setAttribute('data-flux-contenteditable-original', document.body.isContentEditable.toString()); } document.body.contentEditable = 'true'; document.body.style.cursor = 'text'; } else { if (document.body.hasAttribute('data-flux-contenteditable-original')) { document.body.contentEditable = document.body.getAttribute('data-flux-contenteditable-original'); } else { document.body.contentEditable = originalContentEditable; } document.body.style.cursor = 'default'; } showFluxNotification('Inspect Page toggled ' + state);};",
        "if (colorSlider) { const updateAccentColor = (hue) => { const newAccentColor = `hsl(\${hue}, 80%, 65%)`; clientContainer.style.setProperty('--flux-accent', newAccentColor); colorSlider.style.setProperty('--flux-accent', newAccentColor); }; colorSlider.oninput = function() { updateAccentColor(this.value); showFluxNotification('Menu Accent Color changed'); }; updateAccentColor(colorSlider.value); }",
        "if (toggleMatrix) toggleMatrix.onchange = function() { let state = this.checked ? 'ON' : 'OFF'; if (this.checked) { if (!matrixCanvas) { matrixCanvas = document.createElement('canvas'); matrixCanvas.id = 'flux-matrix-canvas'; document.body.appendChild(matrixCanvas); matrixCtx = matrixCanvas.getContext('2d'); matrixCanvas.height = window.innerHeight; matrixCanvas.width = window.innerWidth; matrixColumns = Math.floor(matrixCanvas.width / matrixFontSize); matrixDrops = []; for (let x = 0; x < matrixColumns; x++) matrixDrops[x] = 1; } matrixCanvas.style.display = 'block'; if (matrixIntervalId) clearInterval(matrixIntervalId); matrixIntervalId = setInterval(drawMatrix, 50); } else { if (matrixIntervalId) clearInterval(matrixIntervalId); matrixIntervalId = null; if (matrixCanvas) matrixCanvas.style.display = 'none'; } showFluxNotification('Matrix Effect toggled ' + state);};",
        "if (toggleAutoclick) toggleAutoclick.onchange = function() { let state = this.checked ? 'ON' : 'OFF'; if (this.checked) { isAutoclicking = true; autoclickerKeydownListener = (e) => { if (e.key === '`' && isAutoclicking) { toggleAutoclick.checked = false; toggleAutoclick.dispatchEvent(new Event('change')); } }; document.addEventListener('keydown', autoclickerKeydownListener); if (autoclickIntervalId) clearInterval(autoclickIntervalId); autoclickIntervalId = setInterval(() => { if (!isAutoclicking) return; const el = document.elementFromPoint(lastMouseX, lastMouseY); if (el && typeof el.click === 'function' && el !== clientContainer && !clientContainer.contains(el)) { el.click(); } }, 100); } else { isAutoclicking = false; clearInterval(autoclickIntervalId); if (autoclickerKeydownListener) { document.removeEventListener('keydown', autoclickerKeydownListener); autoclickerKeydownListener = null; } } showFluxNotification('Autoclicker toggled ' + state);};",
        "if (togglePageSpam) togglePageSpam.onchange = function() { if (this.checked) { showFluxNotification('Page Spammer ON (Opening 100 tabs)'); for (let i = 0; i < 100; i++) { window.open('about:blank', '_blank'); } this.checked = false; showFluxNotification('Page Spammer FINISHED & OFF'); } };",
        "if (toggleHardReset) toggleHardReset.onchange = function() { if (this.checked) { showFluxNotification('Hard Reset Page toggled ON - Reloading...'); location.reload(); } };",
        "if (toggleDestroyPage) toggleDestroyPage.onchange = function() { if (this.checked) { showFluxNotification('Destroy Page toggled ON - Closing...'); window.close(); this.checked = false; } };",
        "if (toggleSpinPage) { toggleSpinPage.onchange = function() { let state = this.checked ? 'ON' : 'OFF'; document.documentElement.classList.toggle('flux-spin-documentElement-active', this.checked); showFluxNotification('Spin Page toggled ' + state);}; }",
        "if (toggleShakePage) { toggleShakePage.onchange = function() { let state = this.checked ? 'ON' : 'OFF'; document.documentElement.classList.toggle('flux-shake-documentElement-active', this.checked); showFluxNotification('Shake Page toggled ' + state);}; }",
        "if (toggleInvertPage) { toggleInvertPage.onchange = function() { let state = this.checked ? 'ON' : 'OFF'; document.documentElement.classList.toggle('flux-page-full-invert', this.checked); if(this.checked) { if(toggleDark && toggleDark.checked) { toggleDark.checked = false; document.documentElement.classList.remove('flux-dark-mode-filter'); showFluxNotification('Dark Website toggled OFF');} if(toggleLight && toggleLight.checked) { toggleLight.checked = false; showFluxNotification('Light Website toggled OFF');} } showFluxNotification('Invert Page Colors toggled ' + state);}; }",
        "if (toggleTransparentMenu) { toggleTransparentMenu.onchange = function() { let state = this.checked ? 'ON' : 'OFF'; clientContainer.classList.toggle('flux-menu-transparent', this.checked); showFluxNotification('Transparent Menu toggled ' + state);}; }",
        "if (togglePulsingShadow) { togglePulsingShadow.onchange = function() { let state = this.checked ? 'ON' : 'OFF'; clientContainer.classList.toggle('flux-pulsing-shadow-active', this.checked); showFluxNotification('Pulsing Menu Shadow toggled ' + state);}; }",

        "const executeUserScript = () => { const scriptToRun = scriptInput.value; if (scriptToRun) { try { (0, eval)(scriptToRun); console.log('FluxClient: Executed script from input.'); showFluxNotification('Script executed!'); } catch (err) { console.error('FluxClient: Error executing script from input:', err); alert('Error in your script:\\nName: ' + err.name + '\\nMessage: ' + err.message); showFluxNotification('Script execution FAILED!'); } } else { alert('Script input is empty.'); showFluxNotification('Script input empty.'); }};",
        "if (scriptExecuteButton) scriptExecuteButton.onclick = executeUserScript;",
        "if (scriptExecuteBackupButton) scriptExecuteBackupButton.onclick = executeUserScript;",
        "if (scriptSaveButton && scriptInput) { scriptSaveButton.onclick = function() { const scriptContent = scriptInput.value; const blob = new Blob([scriptContent], { type: 'text/javascript;charset=utf-8' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'flux_script.js'; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url); showFluxNotification('Script saved to flux_script.js'); }; }",
        "if (scriptLoadButtonStyled && scriptFileInput && scriptInput) { scriptLoadButtonStyled.onclick = function() { scriptFileInput.click(); }; scriptFileInput.onchange = function(event) { const file = event.target.files[0]; if (file) { const reader = new FileReader(); reader.onload = function(e) { scriptInput.value = e.target.result; showFluxNotification('Script loaded: ' + file.name); }; reader.onerror = function() { alert('Error reading file.'); showFluxNotification('Error loading script!');}; reader.readAsText(file); event.target.value = null; } }; }",
        "let isDragging = false; let offsetX, offsetY;",
        "if (controlBar) controlBar.onmousedown = function(e) { if (e.target.closest('.flux-window-controls button')) return; isDragging = true; offsetX = e.clientX - clientContainer.offsetLeft; offsetY = e.clientY - clientContainer.offsetTop; clientContainer.style.transition = 'opacity var(--flux-animation-duration) var(--flux-animation-timing), transform var(--flux-animation-duration) var(--flux-animation-timing)'; controlBar.style.cursor = 'grabbing'; e.preventDefault(); };",
        "document.onmousemove = function(e) { if (!isDragging) return; let newX = e.clientX - offsetX; let newY = e.clientY - offsetY; const currentClientHeight = isMinimized ? parseFloat(getComputedStyle(clientContainer).getPropertyValue('--flux-control-bar-height')) : clientContainer.offsetHeight; const currentClientWidth = isMinimized ? 220 : clientContainer.offsetWidth; const maxX = window.innerWidth - currentClientWidth; const maxY = window.innerHeight - currentClientHeight; newX = Math.max(0, Math.min(newX, maxX)); newY = Math.max(0, Math.min(newY, maxY)); clientContainer.style.left = newX + 'px'; clientContainer.style.top = newY + 'px'; };",
        "document.onmouseup = function() { if (isDragging) { isDragging = false; clientContainer.style.transition = `opacity var(--flux-animation-duration) var(--flux-animation-timing), transform var(--flux-animation-duration) var(--flux-animation-timing), width var(--flux-animation-duration) var(--flux-animation-timing), min-height var(--flux-animation-duration) var(--flux-animation-timing), background-color var(--flux-animation-duration) var(--flux-animation-timing), box-shadow var(--flux-animation-duration) var(--flux-animation-timing)`; if (controlBar) controlBar.style.cursor = 'move'; } };",
        "}", // End of initializeMainMenu
    ];
    try {
        new Function(scriptParts.join('\n'))();
    } catch (e) {
        console.error('FluxClient Outer Exec Error:', e);
        let stackTrace = e.stack ? e.stack.split('\n').slice(0,5).join('\n') : 'No stack available.';
        alert('FluxClient Outer Exec Error:\\nName: ' + e.name + '\\nMessage: ' + e.message + '\\nStack: ' + stackTrace);
    }
})();
