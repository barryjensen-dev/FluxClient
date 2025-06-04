// ==UserScript==
// @name         Flux Client
// @namespace    none
// @version      15.1
// @description  A lightweight, customizable script designed to enhance the user experience in browser-based applications. It provides modular functionality with user-controlled toggles. Each feature is integrated through keyboard shortcuts for fast activation, and the script maintains a clean interface while offering power-user utilities.
// @author       barryjensen-dev
// @match        *://*/*
// @exclude      *://*.google.com/*
// @exclude      *://*.github.dev/*
// @exclude      *://*.google.com/recaptcha/*
// @exclude      *://*.hcaptcha.com/*
// @exclude      *://*.arkoselabs.com/*
// @exclude      *://*.funcaptcha.com/*
// @exclude      *://*.captcha-delivery.com/*
// @exclude      *://*.captcha.com/*
// @exclude      *://*.cloudflare.com/cdn-cgi/challenge-platform/*
// @exclude      *://*.cloudflarechallenge.com/*
// @exclude      *://*.netlify.app/*
// @exclude      *://*.vercel.app/*
// @exclude      *://*.apple/*
// @exclude      *://ogs.google.com/*
// @exclude      *://www.ogs.google.com/*
// @exclude      *://accounts.google.com/*
// @exclude      *://www.accounts.google.com/*
// @exclude      *://google.com/*
// @exclude      *://www.google.com/*
// @exclude      *://youtube.com/*
// @exclude      *://www.youtube.com/*
// @exclude      *://facebook.com/*
// @exclude      *://www.facebook.com/*
// @exclude      *://twitter.com/*
// @exclude      *://www.twitter.com/*
// @exclude      *://x.com/*
// @exclude      *://www.x.com/*
// @exclude      *://openai.com/*
// @exclude      *://www.openai.com/*
// @exclude      *://chatgpt.com/*
// @exclude      *://www.chatgpt.com/*
// @exclude      *://gemini.google.com/*
// @exclude      *://www.gemini.google.com/*
// @exclude      *://github.com/*
// @exclude      *://www.github.com/*
// @exclude      *://roblox.com/*
// @exclude      *://www.roblox.com*
// @exclude      *://greasyfork.org/*
// @exclude      *://www.greasyfork.org/*
// @exclude      *://github-api.arkoselabs.com/*
// @exclude      *://www.google.com/recaptcha/*
// @exclude      *://www.recaptcha.net/recaptcha/*
// @exclude      *://hcaptcha.com/*
// @exclude      *://hcaptcha.com/*
// @exclude      *://apple.com/*
// @exclude      *://www.apple.com/*
// @exclude      *://icloud.com/*
// @exclude      *://www.icloud.com/*
// @exclude      *://iwork.com/*
// @exclude      *://www.iwork.com/*
// @exclude      *://mac.com/*
// @exclude      *://www.mac.com/*
// @exclude      *://me.com/*
// @exclude      *://www.me.com/*
// @exclude      *://apple-mapkit.com/*
// @exclude      *://www.apple-mapkit.com/*
// @exclude      *://itunes.com/*
// @exclude      *://www.itunes.com/*
// @exclude      *://apple-dns.net/*
// @exclude      *://www.apple-dns.net/*
// @exclude      *://apple-livephotoskit.com/*
// @exclude      *://www.apple-livephotoskit.com/*
// @exclude      *://appstore.com/*
// @exclude      *://www.appstore.com/*
// @exclude      *://apzones.com/*
// @exclude      *://www.apzones.com/*
// @exclude      *://foundationdb.org/*
// @exclude      *://www.foundationdb.org/*
// @exclude      *://icloud.com.cn/*
// @exclude      *://www.icloud.com.cn/*
// @exclude      *://pkl-lang.org/*
// @exclude      *://www.pkl-lang.org/*
// @exclude      *://posplano.com/*
// @exclude      *://www.posplano.com/*
// @exclude      *://researchandcare.org/*
// @exclude      *://www.researchandcare.org/*
// @exclude      *://shazam.com/*
// @exclude      *://www.shazam.com/*
// @exclude      *://swift.org/*
// @exclude      *://www.swift.org/*
// @exclude      *://webkit.org/*
// @exclude      *://www.webkit.org/*
// @icon         https://raw.githubusercontent.com/barryjensen-dev/fluxclient/refs/heads/main/icons/icon.png
// @grant        none
// @downloadURL  https://github.com/barryjensen-dev/fluxclient/raw/refs/heads/main/flux.user.js
// @updateURL    https://github.com/barryjensen-dev/fluxclient/raw/refs/heads/main/flux.user.js
// ==/UserScript==

(function() {
    // --- Global state and constants ---
    if (document.getElementById('flux-client-container')) {
        // console.warn('Flux Client is already active or was not properly dismissed.');
        return;
    }

    const FLUX_CLIENT_ID = 'flux-client-container';
    const REQUIRED_KEY = ['RELEASE', 'UPDATE', 'FLUX'];

    // Variables for new Function scope
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

    const stylesString = `
        :root {
           --flux-bg-dark: #282c34; --flux-bg-light: #3a3f4b; --flux-accent: #61afef;
           --flux-text: #abb2bf; --flux-text-bright: #ffffff; --flux-border: #4f5666;
           --flux-border-rgb: 79, 86, 102; /* For rgba usage */
           --flux-bg-dark-rgb: 40, 44, 52; /* For rgba usage */
           --flux-bg-light-rgb: 58, 63, 75;
           --flux-accent-rgb: 97, 175, 239; /* For #61afef */
           --flux-danger-rgb: 224, 108, 117; /* For #e06c75 */
           --flux-shadow: rgba(0, 0, 0, 0.5); --flux-shadow-light: rgba(var(--flux-accent-rgb), 0.3);
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
                        min-height var(--flux-animation-duration) var(--flux-animation-timing);
            user-select: none;
        }
        #${FLUX_CLIENT_ID}.flux-minimized { width: 220px; min-height: var(--flux-control-bar-height); border-radius: 10px; }
        #${FLUX_CLIENT_ID}.flux-minimized #flux-main-interface { display: none; }
        #${FLUX_CLIENT_ID}.flux-minimized #flux-control-bar { border-bottom: none; }
        #${FLUX_CLIENT_ID}.flux-visible { opacity: 1; transform: scale(1) translateY(0); }
        #${FLUX_CLIENT_ID}.flux-rainbow-active { animation: flux-rainbow-border var(--flux-rainbow-speed) linear infinite; }
        @keyframes flux-rainbow-border {
            0%, 100% { border-color: hsl(0, 80%, 65%); box-shadow: 0 0 15px hsla(0, 80%, 65%, 0.5); } 17% { border-color: hsl(60, 80%, 65%); box-shadow: 0 0 15px hsla(60, 80%, 65%, 0.5); }
            33% { border-color: hsl(120, 80%, 65%); box-shadow: 0 0 15px hsla(120, 80%, 65%, 0.5); } 50% { border-color: hsl(180, 80%, 65%); box-shadow: 0 0 15px hsla(180, 80%, 65%, 0.5); }
            67% { border-color: hsl(240, 80%, 65%); box-shadow: 0 0 15px hsla(240, 80%, 65%, 0.5); } 83% { border-color: hsl(300, 80%, 65%); box-shadow: 0 0 15px hsla(300, 80%, 65%, 0.5); }
        }

        /* --- Key Screen Enhanced Styles --- */
        #flux-key-screen {
            padding: 40px; display: flex; flex-direction: column; align-items: center;
            text-align: center; transition: opacity 0.2s ease-out, transform 0.2s ease-out;
            width: 100%; box-sizing: border-box; background-color: var(--flux-bg-dark);
            gap: 25px; /* For spacing between elements */
        }
        #flux-key-screen.flux-hidden { opacity: 0; transform: scale(0.9); pointer-events: none; position: absolute; }
        #flux-key-title {
            font-size: 2em; font-weight: 600; color: var(--flux-text-bright);
            letter-spacing: 0.5px; margin-bottom: 0; /* Gap handles spacing */
        }
        #flux-key-instruction {
            font-size: 1em; margin-bottom: 0; color: var(--flux-text);
            max-width: 400px; line-height: 1.6;
        }
        #flux-key-display-container {
            display: flex; align-items: center; justify-content: space-between;
            background-color: rgba(var(--flux-bg-light-rgb), 0.7);
            border: 1px solid rgba(var(--flux-border-rgb), 0.5);
            border-radius: 10px; padding: 12px 18px;
            width: 100%; box-sizing: border-box;
            box-shadow: inset 0 1px 3px rgba(0,0,0,0.2);
        }
        #flux-displayed-key {
            font-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace;
            font-size: 1em; color: var(--flux-accent); word-break: break-all;
            flex-grow: 1; text-align: left; padding-right: 15px; user-select: text;
        }
        #flux-copy-key-button {
            background: transparent; border: none; color: var(--flux-text-bright);
            cursor: pointer; padding: 5px; font-size: 1.5em; line-height: 1;
            transition: color 0.2s, transform 0.2s;
        }
        #flux-copy-key-button:hover { color: var(--flux-accent); transform: scale(1.1); }
        #flux-key-input {
            width: 100%; padding: 15px;
            background-color: var(--flux-bg-light);
            border: 1px solid var(--flux-border); border-radius: 10px;
            color: var(--flux-text-bright); font-size: 1.1em; text-align: center;
            outline: none; transition: border-color 0.2s ease, box-shadow 0.2s ease;
            box-sizing: border-box; box-shadow: inset 0 1px 3px rgba(0,0,0,0.1);
        }
        #flux-key-input:focus {
            border-color: var(--flux-accent);
            box-shadow: 0 0 0 3px var(--flux-shadow-light), inset 0 1px 3px rgba(0,0,0,0.1);
        }
        #flux-key-input.flux-shake {
            animation: flux-shake 0.5s var(--flux-animation-timing);
            border-color: var(--flux-danger) !important;
        }
        #flux-key-button { /* Verify Access Button */
            width: 100%; padding: 15px 25px;
            background-color: var(--flux-accent); border: none; border-radius: 10px;
            color: var(--flux-bg-dark); font-weight: 700; font-size: 1.1em;
            cursor: pointer; transition: background-color 0.2s ease, transform 0.15s ease, box-shadow 0.2s ease;
            letter-spacing: 0.5px; box-sizing: border-box;
            box-shadow: 0 4px 10px rgba(var(--flux-accent-rgb), 0.25);
        }
        #flux-key-button:hover {
            background-color: hsl(207, 90%, 70%); /* Lighter accent */
            transform: translateY(-2px);
            box-shadow: 0 6px 12px rgba(var(--flux-accent-rgb), 0.35);
        }
        #flux-key-button:active {
            transform: translateY(0px) scale(0.98);
            box-shadow: 0 2px 5px rgba(var(--flux-accent-rgb), 0.2);
        }
        #flux-key-error {
            color: var(--flux-danger); font-size: 0.9em; margin-top: 0;
            min-height: 1.2em; visibility: hidden; opacity: 0;
            transition: opacity 0.2s ease, visibility 0.2s ease, background-color 0.2s ease, border-color 0.2s ease;
            padding: 10px 15px; border-radius: 8px; width: 100%; box-sizing: border-box;
            text-align: center;
        }
        #flux-key-error.flux-visible {
            visibility: visible; opacity: 1;
            background-color: rgba(var(--flux-danger-rgb), 0.1);
            border: 1px solid rgba(var(--flux-danger-rgb), 0.3);
        }
        @keyframes flux-shake { 0%, 100% { transform: translateX(0); } 10%, 30%, 50%, 70%, 90% { transform: translateX(-8px); } 20%, 40%, 60%, 80% { transform: translateX(8px); } }
        /* --- End Key Screen Styles --- */
        
        #flux-control-bar { display: flex; align-items: center; justify-content: space-between; padding: 0 5px 0 15px; height: var(--flux-control-bar-height); background-color: var(--flux-bg-light); border-bottom: 1px solid var(--flux-border); cursor: move; }
        #flux-control-bar-title { font-size: 1.1em; font-weight: 600; color: var(--flux-text-bright); margin-right: auto; /* Pushes controls to the right */ }
        .flux-window-controls { display: flex; align-items: center; }
        .flux-window-controls button {
            background: none; border: none; color: var(--flux-text);
            font-family: 'Segoe UI Symbol', 'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji', sans-serif; /* Better font stack for symbols */
            cursor: pointer;
            padding: 0; width: 40px; /* Uniform width */ height: var(--flux-control-bar-height); /* Match bar height */
            display: flex; align-items: center; justify-content: center;
            transition: color 0.2s ease, background-color 0.2s ease;
            line-height: 1;
        }
        .flux-window-controls button:hover { color: var(--flux-text-bright); background-color: rgba(var(--flux-border-rgb), 0.2); }
        .flux-window-controls button:active { background-color: rgba(var(--flux-border-rgb), 0.1); }
        #flux-settings-btn { font-size: 1.2em; }
        #flux-minimize-btn { font-size: 1.4em; font-weight: bold; } /* Adjusted for visual weight */
        #flux-close-btn { font-size: 1.1em; font-weight: bold; }  /* Adjusted for visual weight */
        #flux-close-btn:hover { color: var(--flux-text-bright); background-color: var(--flux-danger) !important; }

        #flux-main-interface { display: none; flex-direction: row; flex-grow: 1; opacity: 0; animation: flux-fadeInAndScaleMain var(--flux-animation-duration) var(--flux-animation-timing) forwards; animation-delay: 0.1s; min-height: 400px; position: relative;
            background-size: 300% 300%; /* Larger size for slower, more subtle movement */
            background-image: linear-gradient(135deg, 
                var(--flux-bg-dark) 0%, 
                var(--flux-accent) 25%, 
                var(--flux-bg-light) 50%, 
                var(--flux-accent) 75%, 
                var(--flux-bg-dark) 100%);
            animation: flux-liquid-background 20s ease-in-out infinite alternate, flux-fadeInAndScaleMain var(--flux-animation-duration) var(--flux-animation-timing) forwards 0.1s; /* Combined animations */
        }
        #flux-main-interface.flux-visible { display: flex; }
        @keyframes flux-liquid-background {
            0% { background-position: 0% 50%; }
            100% { background-position: 100% 50%; }
        }
        @keyframes flux-fadeInAndScaleMain { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }
        #flux-sidebar { width: 160px; background-color: rgba(var(--flux-bg-dark-rgb), 0.6); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); padding: 15px 0; display: flex; flex-direction: column; border-right: 1px solid rgba(var(--flux-border-rgb), 0.4); flex-shrink: 0; z-index: 1; }
        .flux-nav-header { padding: 0 20px 15px 20px; font-size: 1.1em; font-weight: 600; color: var(--flux-text-bright); border-bottom: 1px solid rgba(var(--flux-border-rgb), 0.4); margin-bottom: 10px; }
        .flux-nav-item { display: flex; align-items: center; padding: 12px 20px; cursor: pointer; color: var(--flux-text); font-size: 0.95em; transition: background-color 0.2s ease, color 0.2s ease; position: relative; border-radius: 0 4px 4px 0; margin-right: -1px; }
        .flux-nav-item svg { margin-right: 10px; fill: currentColor; min-width:18px; }
        .flux-nav-item:hover { background-color: rgba(var(--flux-border-rgb),0.3); color: var(--flux-text-bright); }
        .flux-nav-item.active { color: var(--flux-accent); font-weight: 600; background-color: rgba(var(--flux-accent-rgb),0.15); }
        .flux-nav-item.active::before { content: ''; position: absolute; left: 0; top: 50%; transform: translateY(-50%); width: 4px; height: 70%; background-color: var(--flux-accent); border-top-right-radius: 4px; border-bottom-right-radius: 4px; }
        #flux-content-area { flex-grow: 1; padding: 20px; display: flex; flex-direction: column; overflow-y: auto; max-height: 350px; scrollbar-width: thin; scrollbar-color: var(--flux-accent) var(--flux-bg-dark); background-color: rgba(var(--flux-bg-light-rgb), 0.5); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); z-index: 1;}
        #flux-content-area::-webkit-scrollbar { width: 8px; }
        #flux-content-area::-webkit-scrollbar-track { background: var(--flux-bg-dark); border-radius: 4px; }
        #flux-content-area::-webkit-scrollbar-thumb { background-color: var(--flux-bg-light); border-radius: 4px; border: 1px solid var(--flux-bg-dark); }
        #flux-content-area::-webkit-scrollbar-thumb:hover { background-color: var(--flux-accent); }
        .flux-content-section { display: none; animation: flux-contentFadeIn 0.4s var(--flux-animation-timing) forwards; }
        .flux-content-section.active { display: block; }
        @keyframes flux-contentFadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
        .flux-card { background-color: rgba(var(--flux-bg-dark-rgb), 0.7); backdrop-filter: blur(5px); -webkit-backdrop-filter: blur(5px); padding: 20px; border-radius: 12px; margin-bottom: 20px; box-shadow: 0 5px 15px rgba(0,0,0,0.2); border: 1px solid rgba(var(--flux-border-rgb), 0.3); }
        .flux-card-title { font-size: 1.1em; color: var(--flux-text-bright); margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px solid rgba(var(--flux-border-rgb),0.3); font-weight: 500; }
        #flux-proxy-section { display: flex; align-items: center; gap: 10px; }
        #flux-proxy-input { flex-grow: 1; padding: 10px; background-color: var(--flux-bg-dark); border: 1px solid var(--flux-border); border-radius: 8px; color: var(--flux-text-bright); font-size: 0.9em; outline: none; transition: border-color 0.2s ease, box-shadow 0.2s ease; }
        #flux-proxy-input:focus { border-color: var(--flux-accent); box-shadow: 0 0 0 3px var(--flux-shadow-light); }
        #flux-proxy-button, .flux-action-button { padding: 10px 18px; background-color: var(--flux-accent); border: none; border-radius: 8px; color: var(--flux-bg-dark); font-weight: 600; cursor: pointer; transition: background-color 0.2s ease, transform 0.15s ease; text-align:center; }
        #flux-proxy-button:hover, .flux-action-button:hover { background-color: hsl(207, 80%, 70%); transform: translateY(-2px) scale(1.02); }
        #flux-proxy-button:active, .flux-action-button:active { transform: translateY(0px) scale(0.98); }
        .flux-toggle-container { display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid rgba(var(--flux-border-rgb),0.2); }
        .flux-card .flux-toggle-container:last-of-type { border-bottom: none; padding-bottom: 0; }
        .flux-card .flux-toggle-container:first-of-type { padding-top: 0; }
        .flux-toggle-label { font-size: 0.95em; display: flex; align-items: center; }
        .flux-toggle-label .flux-beta-tag, .flux-toggle-label .flux-new-tag { font-size: 0.7em; color: white; padding: 3px 6px; border-radius: 5px; margin-left: 8px; font-weight: bold; }
        .flux-toggle-label .flux-beta-tag { background-color: var(--flux-danger); }
        .flux-toggle-label .flux-new-tag { background-color: var(--flux-success); }
        .flux-switch { position: relative; display: inline-block; width: 44px; height: 24px; }
        .flux-switch input { opacity: 0; width: 0; height: 0; }
        .flux-slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: var(--flux-bg-dark); transition: .3s var(--flux-animation-timing); border-radius: 24px; border: 1px solid rgba(var(--flux-border-rgb), 0.5); }
        .flux-slider:before { position: absolute; content: ''; height: 18px; width: 18px; left: 3px; bottom: 3px; background-color: var(--flux-text); transition: .3s var(--flux-animation-timing); border-radius: 50%; box-shadow: 0 1px 3px rgba(0,0,0,0.3); }
        input:checked + .flux-slider { background-color: var(--flux-accent); border-color: transparent;}
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
    `;

    const keyScreenHTMLString = `
        <div id="flux-key-screen">
            <div id="flux-key-title">Flux Client Access</div>
            <div id="flux-key-instruction">Please verify your access by pasting the provided key below.</div>
            <div id="flux-key-display-container">
                <code id="flux-displayed-key">Accepted Keys: RELESE, UPDATE, FLUX</code>
                <button id="flux-copy-key-button" title="Copy Key"></button> <!-- Using a clipboard icon -->
            </div>
            <input type="password" id="flux-key-input" placeholder="Enter Key Here">
            <button id="flux-key-button">Verify & Enter</button>
            <div id="flux-key-error"></div>
        </div>
    `;

    const mainMenuHTMLString = `
        <div id="flux-control-bar">
            <span id="flux-control-bar-title">Flux Client</span>
            <div class="flux-window-controls">
                <button id="flux-settings-btn" title="Settings">⚙</button>
                <button id="flux-minimize-btn" title="Minimize">−</button>
                <button id="flux-close-btn" title="Close">✕</button>
            </div>
        </div>
        <div id="flux-main-interface">
            <div id="flux-sidebar">
                <div class="flux-nav-header">Navigation</div>
                <div class="flux-nav-item" data-section="proxy"> 
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
            </div>
            <div id="flux-content-area">
                <div id="flux-content-section-proxy" class="flux-content-section">
                    <div class="flux-card"><div class="flux-card-title">Proxy Connection</div><div id="flux-proxy-section"><input type="text" id="flux-proxy-input" placeholder="Enter URL (e.g., google.com)"><button id="flux-proxy-button">Go</button></div></div>
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
                            <p class="version">Version: <span style="color: var(--flux-text-bright); font-weight:bold;">15.1</span></p>
                            <p>Developed by: <span style="color: var(--flux-text-bright); font-weight:bold;">barryjensen-dev</span></p>
                            <p>Updated: <span style="color: var(--flux-text-bright); font-weight:bold;">June 4, 2025</span></p>
                        </div>
                    </div>
                    <div class="flux-card">
                        <div class="flux-card-title">Menu Appearance</div>
                        <div class="flux-toggle-container"><span class="flux-toggle-label">Rainbow Menu Border</span><label class="flux-switch"><input type="checkbox" id="flux-toggle-rainbow"><span class="flux-slider"></span></label></div>
                        <div class="flux-slider-container"><label for="flux-color-slider">Custom Menu Accent</label><input type="range" id="flux-color-slider" class="flux-color-slider" min="0" max="360" value="207"></div>
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
        `const REQUIRED_KEYS = ['RELEASE', 'UPDATE', 'FLUX'];`, 
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
        "function parseHTML(htmlString) { const template = document.createElement('template'); template.innerHTML = htmlString.trim(); return template.content.cloneNode(true); }",
        "clientContainer.appendChild(parseHTML(keyScreenHTMLString)); document.body.appendChild(clientContainer);",
        "setTimeout(() => { if (clientContainer) clientContainer.classList.add('flux-visible'); }, 10);",

        "const keyInputElement = document.getElementById('flux-key-input');",
        "const keyButtonElement = document.getElementById('flux-key-button');",
        "const keyErrorElement = document.getElementById('flux-key-error');",
        "const keyScreenElement = document.getElementById('flux-key-screen');",
        "const displayedKeyElement = document.getElementById('flux-displayed-key');",
        "const copyKeyButtonElement = document.getElementById('flux-copy-key-button');",
        "if (copyKeyButtonElement && displayedKeyElement) { copyKeyButtonElement.onclick = () => { try { navigator.clipboard.writeText(displayedKeyElement.textContent).then(() => { copyKeyButtonElement.textContent = '✓'; setTimeout(() => { copyKeyButtonElement.innerHTML = ''; }, 1500); }).catch(err => console.error('FluxClient: Failed to copy key: ', err)); } catch (e) { console.error('FluxClient: Clipboard API not available or failed.', e); } }; }",
        "const handleUnlockAttempt = () => { if (REQUIRED_KEYS.includes(keyInputElement.value)) { keyErrorElement.classList.remove('flux-visible'); keyScreenElement.classList.add('flux-hidden'); setTimeout(() => { if (keyScreenElement && keyScreenElement.parentNode) keyScreenElement.remove(); clientContainer.appendChild(parseHTML(mainMenuHTMLString)); const mainInterface = document.getElementById('flux-main-interface'); if (!mainInterface) { console.error('FluxClient CRITICAL: #flux-main-interface NOT FOUND in DOM after append. HTML structure likely broken or parseHTML failed.'); if(typeof alert === 'function') alert('FluxClient Error: Failed to load main interface. Check console for details.'); return; } mainInterface.classList.add('flux-visible'); try { initializeMainMenu(); } catch (e) { console.error('FluxClient Error during initializeMainMenu:', e); if(typeof alert === 'function') alert('FluxClient Warning: Main interface loaded but initialization failed. Some features might not work. Error: ' + e.message); } }, 250); } else { keyInputElement.classList.add('flux-shake'); keyErrorElement.textContent = 'Incorrect Key. Access Denied.'; keyErrorElement.classList.add('flux-visible'); keyInputElement.value = ''; setTimeout(() => { keyInputElement.classList.remove('flux-shake'); }, 500); } };",
        "keyButtonElement.onclick = handleUnlockAttempt;",
        "keyInputElement.onkeypress = function(e) { if (e.key === 'Enter') { handleUnlockAttempt(); } else { keyErrorElement.classList.remove('flux-visible'); } };",

        "function drawMatrix() { if (!matrixCtx || !matrixCanvas) return; matrixCtx.fillStyle = 'rgba(0,0,0,0.05)'; matrixCtx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height); matrixCtx.fillStyle = '#0F0'; matrixCtx.font = matrixFontSize + 'px monospace'; for (let i = 0; i < matrixDrops.length; i++) { const text = matrixChars[Math.floor(Math.random() * matrixChars.length)]; matrixCtx.fillText(text, i * matrixFontSize, matrixDrops[i] * matrixFontSize); if (matrixDrops[i] * matrixFontSize > matrixCanvas.height && Math.random() > 0.975) matrixDrops[i] = 0; matrixDrops[i]++; } }",
        "function initializeMainMenu() {",
        "const closeButton = document.getElementById('flux-close-btn');",
        "const minimizeButton = document.getElementById('flux-minimize-btn');",
        "const settingsButtonIcon = document.getElementById('flux-settings-btn');",
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

        "let originalContentEditable = document.body.isContentEditable; let isMinimized = false;",
        "mouseMoveListenerGlobal = (e) => { lastMouseX = e.clientX; lastMouseY = e.clientY; };",
        "document.addEventListener('mousemove', mouseMoveListenerGlobal);",
        "const performClose = () => { if (isAutoclicking) { isAutoclicking = false; clearInterval(autoclickIntervalId); if (autoclickerKeydownListener) document.removeEventListener('keydown', autoclickerKeydownListener); autoclickerKeydownListener = null; if(toggleAutoclick) toggleAutoclick.checked = false;} if(mouseMoveListenerGlobal) document.removeEventListener('mousemove', mouseMoveListenerGlobal); mouseMoveListenerGlobal = null; if (matrixCanvas) matrixCanvas.remove(); if (matrixIntervalId) clearInterval(matrixIntervalId); matrixIntervalId = null; clientContainer.style.opacity = '0'; clientContainer.style.transform = 'scale(0.9) translateY(20px)'; setTimeout(() => { if (clientContainer && clientContainer.parentNode) clientContainer.remove(); if (styleSheetElement && styleSheetElement.parentNode) styleSheetElement.remove(); document.documentElement.classList.remove('flux-dark-mode-filter'); if (document.body.hasAttribute('data-flux-contenteditable-original')) { document.body.contentEditable = document.body.getAttribute('data-flux-contenteditable-original'); document.body.removeAttribute('data-flux-contenteditable-original'); } else { document.body.contentEditable = originalContentEditable; } document.body.style.cursor = ''; }, 300); };",
        "if (closeButton) closeButton.onclick = performClose;",
        "if (toggleResetMenu) { toggleResetMenu.onchange = function() { if (this.checked) { performClose(); /* It will uncheck itself on close logic if needed or stay checked */ } }; }",
        "if (minimizeButton) minimizeButton.onclick = function() { isMinimized = !isMinimized; clientContainer.classList.toggle('flux-minimized', isMinimized); this.innerHTML = isMinimized ? '➕' : '−'; this.title = isMinimized ? 'Restore' : 'Minimize'; };",
        "const activateTab = (sectionName) => { if (!contentSections || contentSections.length === 0) { console.warn('FluxClient: No content sections found to activate.'); return; } contentSections.forEach(section => section.classList.remove('active')); const targetContentSection = document.getElementById(`flux-content-section-${sectionName}`); if (targetContentSection) { targetContentSection.style.animation = 'none'; requestAnimationFrame(() => { targetContentSection.style.animation = ''; targetContentSection.classList.add('active'); }); } else { console.warn(`FluxClient: Target content section '${sectionName}' not found.`); } if (!navItems || navItems.length === 0) { console.warn('FluxClient: No nav items found to update.'); } else { navItems.forEach(nav => nav.classList.remove('active')); if (sectionName !== 'settings') { const targetNavItem = clientContainer.querySelector(`.flux-nav-item[data-section='${sectionName}']`); if (targetNavItem) targetNavItem.classList.add('active'); else console.warn(\`FluxClient: Target nav item for section '${sectionName}' not found.\`); } } if (isMinimized && sectionName !== '') { if (minimizeButton && minimizeButton.textContent === '➕') minimizeButton.click(); } };",
        "if (settingsButtonIcon) { settingsButtonIcon.onclick = function() { activateTab('settings'); }; }",
        "if (navItems && navItems.length > 0) { navItems.forEach(item => { item.onclick = function() { if (this.classList.contains('active')) return; activateTab(this.dataset.section); }; }); } else { console.warn('FluxClient: No navigation items found to attach click handlers.'); }",
        "if (proxyButtonElement && proxyInputElement) proxyButtonElement.onclick = function() { let url = proxyInputElement.value.trim(); if (!url) { if(typeof alert === 'function') alert('Please enter a URL.'); return; } if (!url.startsWith('http://') && !url.startsWith('https://')) { url = 'https://' + url; } const proxyServiceBase = 'https://proxyium.com/process?url='; try { window.location.href = proxyServiceBase + encodeURIComponent(url); } catch (e) { if(typeof alert === 'function') alert('Could not create proxy URL.'); console.error('Proxy URL error:', e); } };",
        // MODIFIED setupPlaceholderToggle calls:
        "const setupPlaceholderToggle = (checkbox, name, autoUncheck = true) => { if (!checkbox) { console.warn(`FluxClient: Toggle '${name}' DOM element not found.`); return; } checkbox.onchange = function() { if (this.checked) { console.log(`FluxClient: ${name} toggled ON.`); if (autoUncheck && name !== 'Client Fix') { setTimeout(() => { if (this) this.checked = false; console.log(\`FluxClient: ${name} auto-unchecked.\`); }, 100); } } else { console.log(`FluxClient: ${name} toggled OFF.`); } }; };",
        "setupPlaceholderToggle(toggleVpn, 'VPN V1.6', false);", // autoUncheck set to false
        "setupPlaceholderToggle(toggleAls, 'Anti Light Speed V2', false);", // autoUncheck set to false
        "setupPlaceholderToggle(toggleAa, 'Anti Admin V1.4', false);", // autoUncheck set to false
        "setupPlaceholderToggle(toggleVc, 'Virtual Clone', false);", // autoUncheck set to false
        "setupPlaceholderToggle(toggleClientFix, 'Client Fix', false);", // Already false, kept for consistency

        "if (toggleDark) toggleDark.onchange = function() { if (this.checked) { document.documentElement.classList.add('flux-dark-mode-filter'); if (toggleLight && toggleLight.checked) toggleLight.checked = false; } else { if (!toggleLight || !toggleLight.checked) document.documentElement.classList.remove('flux-dark-mode-filter'); } };",
        "if (toggleLight) toggleLight.onchange = function() { if (this.checked) { document.documentElement.classList.remove('flux-dark-mode-filter'); if (toggleDark && toggleDark.checked) toggleDark.checked = false; } };",
        "if (toggleRainbow) toggleRainbow.onchange = function() { clientContainer.classList.toggle('flux-rainbow-active', this.checked); if (!this.checked) { clientContainer.style.borderColor = ''; clientContainer.style.boxShadow = ''; } };",
        "if (toggleInspect) toggleInspect.onchange = function() { if (this.checked) { if (!document.body.hasAttribute('data-flux-contenteditable-original')) { document.body.setAttribute('data-flux-contenteditable-original', document.body.isContentEditable.toString()); } document.body.contentEditable = 'true'; document.body.style.cursor = 'text'; } else { if (document.body.hasAttribute('data-flux-contenteditable-original')) { document.body.contentEditable = document.body.getAttribute('data-flux-contenteditable-original'); } else { document.body.contentEditable = originalContentEditable; } document.body.style.cursor = 'default'; } };",
        "if (colorSlider) { const updateAccentColor = (hue) => { const newAccentColor = `hsl(${hue}, 80%, 65%)`; clientContainer.style.setProperty('--flux-accent', newAccentColor); colorSlider.style.setProperty('--flux-accent', newAccentColor); /* Update RGB var too */ const tempColor = newAccentColor.startsWith('#') ? newAccentColor : getComputedStyle(document.documentElement).getPropertyValue('--flux-accent').trim(); const match = tempColor.match(/^#?([a-f\\d]{2})([a-f\\d]{2})([a-f\\d]{2})$/i) || tempColor.match(/^hsl\\(\\s*(\\d+)\\s*,\\s*(\\d+)%\\s*,\\s*(\\d+)%\\s*\\)$/i); if(match && match.length >= 4 && !tempColor.startsWith('#')) { const r = parseInt( (255 * (parseFloat(match[3])/100) * (1 - (parseFloat(match[2])/100) * Math.abs(2 * 0.5 -1 )) + (parseFloat(match[2])/100) * (parseFloat(match[3])/100) * Math.abs(2 * 0.5 -1 )) ); /* This is complex, better to just get computed style */ const finalComputedColor = getComputedStyle(clientContainer).getPropertyValue('--flux-accent').trim(); const rgbMatch = finalComputedColor.match(/rgb\\((\\d+),\\s*(\\d+),\\s*(\\d+)\\)/); if(rgbMatch) clientContainer.style.setProperty('--flux-accent-rgb', `${rgbMatch[1]}, ${rgbMatch[2]}, ${rgbMatch[3]}`); } else if (match && match.length >=4 && tempColor.startsWith('#')) { clientContainer.style.setProperty('--flux-accent-rgb', `${parseInt(match[1], 16)}, ${parseInt(match[2], 16)}, ${parseInt(match[3], 16)}`); } }; colorSlider.oninput = function() { updateAccentColor(this.value); }; updateAccentColor(colorSlider.value); }",
        "if (toggleMatrix) toggleMatrix.onchange = function() { if (this.checked) { if (!matrixCanvas) { matrixCanvas = document.createElement('canvas'); matrixCanvas.id = 'flux-matrix-canvas'; document.body.appendChild(matrixCanvas); matrixCtx = matrixCanvas.getContext('2d'); matrixCanvas.height = window.innerHeight; matrixCanvas.width = window.innerWidth; matrixColumns = Math.floor(matrixCanvas.width / matrixFontSize); matrixDrops = []; for (let x = 0; x < matrixColumns; x++) matrixDrops[x] = 1; } matrixCanvas.style.display = 'block'; if (matrixIntervalId) clearInterval(matrixIntervalId); matrixIntervalId = setInterval(drawMatrix, 50); } else { if (matrixIntervalId) clearInterval(matrixIntervalId); matrixIntervalId = null; if (matrixCanvas) matrixCanvas.style.display = 'none'; } };",
        "if (toggleAutoclick) toggleAutoclick.onchange = function() { if (this.checked) { isAutoclicking = true; autoclickerKeydownListener = (e) => { if (e.key === '`' && isAutoclicking) { toggleAutoclick.checked = false; toggleAutoclick.dispatchEvent(new Event('change')); } }; document.addEventListener('keydown', autoclickerKeydownListener); if (autoclickIntervalId) clearInterval(autoclickIntervalId); autoclickIntervalId = setInterval(() => { if (!isAutoclicking) return; const el = document.elementFromPoint(lastMouseX, lastMouseY); if (el && typeof el.click === 'function' && clientContainer && el !== clientContainer && !clientContainer.contains(el)) { el.click(); } }, 100); } else { isAutoclicking = false; if(autoclickIntervalId) clearInterval(autoclickIntervalId); autoclickIntervalId = null; if (autoclickerKeydownListener) { document.removeEventListener('keydown', autoclickerKeydownListener); autoclickerKeydownListener = null; } } };",
        "if (togglePageSpam) togglePageSpam.onchange = function() { if (this.checked) { for (let i = 0; i < 100; i++) { window.open('about:blank', '_blank'); } this.checked = false; } };",
        "if (toggleHardReset) toggleHardReset.onchange = function() { if (this.checked) { location.reload(); /* Page will reload, state of checkbox doesn't matter after this */ } };",
        "if (toggleDestroyPage) toggleDestroyPage.onchange = function() { if (this.checked) { try { window.close(); } catch(e) { console.warn('FluxClient: window.close() failed. This usually happens if the window was not opened by a script.'); } this.checked = false; } };", // Auto uncheck destroy page as it might fail
        "const executeUserScript = (isBackup = false) => { const scriptToRun = scriptInput.value; if (scriptToRun) { try { (0, eval)(scriptToRun); console.log(`FluxClient: Executed script from input${isBackup ? ' (using backup method)' : ''}.`); } catch (err) { console.error(`FluxClient: Error executing script from input${isBackup ? ' (using backup method)' : ''}:`, err); if(typeof alert === 'function') alert('Error in your script:\\nName: ' + err.name + '\\nMessage: ' + err.message); } } else { if(typeof alert === 'function') alert('Script input is empty.'); }};",
        "if (scriptExecuteButton) scriptExecuteButton.onclick = () => executeUserScript(false);",
        "if (scriptExecuteBackupButton) scriptExecuteBackupButton.onclick = () => executeUserScript(true);",
        "if (scriptSaveButton && scriptInput) { scriptSaveButton.onclick = function() { const scriptContent = scriptInput.value; const blob = new Blob([scriptContent], { type: 'text/javascript;charset=utf-8' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'flux_script.js'; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url); }; }",
        "if (scriptLoadButtonStyled && scriptFileInput && scriptInput) { scriptLoadButtonStyled.onclick = function() { scriptFileInput.click(); }; scriptFileInput.onchange = function(event) { const file = event.target.files[0]; if (file) { const reader = new FileReader(); reader.onload = function(e) { scriptInput.value = e.target.result; }; reader.onerror = function() { if(typeof alert === 'function') alert('Error reading file.');}; reader.readAsText(file); event.target.value = null; } }; }",
        "let isDragging = false; let offsetX, offsetY;",
        "if (controlBar) controlBar.onmousedown = function(e) { if (e.target.closest('.flux-window-controls button')) return; isDragging = true; offsetX = e.clientX - clientContainer.offsetLeft; offsetY = e.clientY - clientContainer.offsetTop; clientContainer.style.transition = 'opacity var(--flux-animation-duration) var(--flux-animation-timing), transform var(--flux-animation-duration) var(--flux-animation-timing)'; controlBar.style.cursor = 'grabbing'; e.preventDefault(); };",
        "document.onmousemove = function(e) { if (!isDragging || !clientContainer) return; let newX = e.clientX - offsetX; let newY = e.clientY - offsetY; const currentClientHeight = isMinimized ? parseFloat(getComputedStyle(clientContainer).getPropertyValue('--flux-control-bar-height')) : clientContainer.offsetHeight; const currentClientWidth = isMinimized ? 220 : clientContainer.offsetWidth; const maxX = window.innerWidth - currentClientWidth; const maxY = window.innerHeight - currentClientHeight; newX = Math.max(0, Math.min(newX, maxX)); newY = Math.max(0, Math.min(newY, maxY)); clientContainer.style.left = newX + 'px'; clientContainer.style.top = newY + 'px'; };",
        "document.onmouseup = function() { if (isDragging) { isDragging = false; if(clientContainer) clientContainer.style.transition = `opacity var(--flux-animation-duration) var(--flux-animation-timing), transform var(--flux-animation-duration) var(--flux-animation-timing), width var(--flux-animation-duration) var(--flux-animation-timing), min-height var(--flux-animation-duration) var(--flux-animation-timing)`; if (controlBar) controlBar.style.cursor = 'move'; } };",
        "activateTab('proxy');",
        "}", // End of initializeMainMenu
    ];
    try {
        if (document.getElementById(FLUX_CLIENT_ID) && document.getElementById(FLUX_CLIENT_ID).querySelector('#flux-key-screen')) {
             console.warn("Flux Client key screen already present. Aborting duplicate injection attempt.");
             return;
        }
        new Function(scriptParts.join('\n'))();
    } catch (e) {
        console.error('FluxClient Outer Exec Error:', e);
        let stackTrace = e.stack ? e.stack.split('\n').slice(0,5).join('\n') : 'No stack available.';
        if(typeof alert === 'function') alert('FluxClient Outer Exec Error:\nName: ' + e.name + '\nMessage: ' + e.message + '\nStack: ' + stackTrace);
    }
})();
