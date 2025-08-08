// ==UserScript==
// @name         Userscript Dev Toolkit Pro
// @namespace    https://github.com/SysAdminDoc/Userscript-Dev-Toolkit
// @version      9.0.2
// @description  A powerhouse side-panel for live userscript development. Press Ctrl+Shift+D to toggle. Features an advanced DOM inspector, form/storage analysis, resource filtering, and a premium UI.
// @author       Matthew Parker
// @match        *://*/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_addStyle
// @grant        GM_info
// @grant        GM_download
// @grant        GM_registerMenuCommand
// @grant        GM_xmlhttpRequest
// @grant        GM_setClipboard
// @grant        GM_listValues
// @run-at       document-idle
// @license      MIT
// @updateURL    https://github.com/SysAdminDoc/Userscript-Dev-Toolkit/blob/main/Userscript%20Dev%20Toolkit.user.js
// @downloadURL  https://github.com/SysAdminDoc/Userscript-Dev-Toolkit/blob/main/Userscript%20Dev%20Toolkit.user.js
// ==/UserScript==

(function() {
    'use strict';

    // --- CONFIG & HELPERS ---
    const KEYBOARD_SHORTCUT = { key: 'D', ctrlKey: true, shiftKey: true, altKey: false };
    const qs = (selector, parent = document) => parent.querySelector(selector);
    const qsa = (selector, parent = document) => parent.querySelectorAll(selector);
    const clamp = (val, min, max) => Math.max(min, Math.min(val, max));
    const clearElement = (el) => { if(el) while (el.firstChild) { el.removeChild(el.firstChild); } };
    const createElement = (tag, classes = [], attributes = {}, text = '') => {
        const el = document.createElement(tag);
        if (classes.length) el.classList.add(...classes.filter(Boolean));
        Object.entries(attributes).forEach(([key, value]) => el.setAttribute(key, value));
        if (text) el.textContent = text;
        el.setAttribute('data-udt-element', 'true');
        return el;
    };
    const ICONS = {
        launcher: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M19.479 10.092a.5.5 0 0 0-.488-1.4l-3.32-.95a.5.5 0 0 0-.585.19l-1.44 2.492a.5.5 0 0 0-.022.49c.205.353.385.72.538 1.1a.5.5 0 0 0 .463.32l3.435.49a.5.5 0 0 0 .584-.39l1.335-3.342zM12 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7zm0-5.5a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/><path d="m19.938 11.666-1.335 3.342a2 2 0 0 1-2.336 1.56l-3.435-.49a2 2 0 0 1-1.85-1.28l-.538-1.1a.5.5 0 0 0-.44-.26h-3.315a.5.5 0 0 0-.44.26l-.538 1.1a2 2 0 0 1-1.85 1.28l-3.435.49a2 2 0 0 1-2.336-1.56L2.062 11.666a2 2 0 0 1 .74-2.22l2.42-2.008a.5.5 0 0 0 0-.876l-2.42-2.008a2 2 0 0 1-.74-2.22l1.335-3.342a2 2 0 0 1 2.336-1.56l3.435.49a2 2 0 0 1 1.85 1.28l.538 1.1a.5.5 0 0 0 .44.26h3.315a.5.5 0 0 0 .44.26l.538-1.1a2 2 0 0 1 1.85-1.28l3.435.49a2 2 0 0 1 2.336 1.56l1.335 3.342a2 2 0 0 1-.74 2.22l-2.42 2.008a.5.5 0 0 0 0 .876l2.42 2.008a2 2 0 0 1 .74 2.22zM4.521 13.908l3.32.95a.5.5 0 0 0 .584-.39l1.44-2.492a.5.5 0 0 0 .022-.49c-.205-.353-.385-.72-.538-1.1a.5.5 0 0 0-.463-.32l-3.435-.49a.5.5 0 0 0-.585.19l-1.335 3.342a.5.5 0 0 0 .488 1.4z"/></svg>`,
        sun: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41l1.06 1.06c.39.39 1.02.39 1.41 0s.39-1.02 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41l1.06 1.06c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.02 0-1.41-.39-.39-1.02-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.02 0 1.41s1.02.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.02 0-1.41-.39-.39-1.02-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.02 0 1.41s1.02.39 1.41 0l1.06-1.06z"/></svg>`,
        moon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M11.1 12.08c-2.33-4.51-.5-8.48.53-10.07-1.26.13-2.48.53-3.62 1.15-3.32 1.79-5.18 5.7-4.99 9.87.2 4.31 3.57 7.89 7.89 8.27 4.52.39 8.48-1.45 9.87-4.99-.13-1.14-.53-2.36-1.15-3.62-1.59.98-5.56 2.76-8.53.37z"/></svg>`,
        copy: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>`,
        hide: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.44-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l3.28 3.28.01.01C3.37 8.09 2.09 9.92 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l3.15 3.15L21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/></svg>`,
        info: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>`,
        unhide: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>`,
        settings: `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69.98l2.49 1c.23.09.49 0 .61.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/></svg>`,
        pin: `<svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><g><rect fill="none" height="24" width="24"/></g><g><path d="M16,9V4l1,0V2H7v2l1,0v5c0,1.66-1.34,3-3,3h0v2h5.97v7l1,1l1-1v-7H19v-2h0C17.34,12,16,10.66,16,9z"/></g></svg>`,
        arrowLeft: `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z"/></svg>`,
        arrowRight: `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>`,
        inspect: `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M12 6c3.79 0 7.17 2.13 8.82 5.5C19.17 14.87 15.79 17 12 17s-7.17-2.13-8.82-5.5C4.83 8.13 8.21 6 12 6m0-2C7 4 2.73 7.11 1 11.5 2.73 15.89 7 19 12 19s9.27-3.11 11-7.5C21.27 7.11 17 4 12 4zm0 5c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3m0-2c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5z"/></svg>`,
    };

    class DevToolkit {
        constructor() {
            this.id = 'userscript-dev-toolkit-pro';
            this.isPanelOpen = false; this.isPickerActive = false; this.isDragging = false;
            this.onPickerClickCallback = null; this.lastHighlightedElement = null;
            this.toastTimeout = null;
            this.launcherPos = { x: 30, y: 30 };
            this.HIDDEN_SELECTORS_KEY = 'udt_hidden_selectors_v6';
            this.dom = {}; // To store references to key DOM elements

            this.settings = new SettingsManager(this);
            this.components = {};

            this.componentDefinitions = [
                InspectorComponent, ElementScannerComponent, FormsComponent, ResourceViewerComponent, StorageComponent,
                uBlockComponent, AIComponent, HtmlStripperComponent,
                CSSViewerComponent, CSSToolsComponent, DebuggerComponent,
            ];
        }

        async init() {
            if (window.top !== window.self) return;
            this.registerComponents();
            await this.settings.load();
            this.injectCoreMarkup();
            this.storeDomReferences();
            this.injectStyles();
            this.renderTabs();
            this.renderAllContent();
            this.applyPreferences();
            this.bindCoreEvents();
            this.showToast(`Dev Toolkit Pro v9.0.2 Initialized.`, 2000);
            GM_registerMenuCommand('Toggle Dev Toolkit', () => this.handleShortcutToggle());
        }

        injectCoreMarkup() {
            const launcher = createElement('div', [], { id: `${this.id}-launcher` });
            launcher.innerHTML = ICONS.launcher;

            const panel = createElement('div', ['udt-panel'], { id: `${this.id}-panel` });
            panel.innerHTML = `
                <div id="${this.id}-header">
                    <div id="${this.id}-title">Dev Toolkit Pro</div>
                    <div class="udt-header-icon" id="${this.id}-side-switcher-btn" title="Switch Side"></div>
                    <div class="udt-header-icon" id="${this.id}-pin-btn" title="Pin Panel Open">${ICONS.pin}</div>
                    <div class="udt-header-icon" id="${this.id}-theme-toggle" title="Toggle Theme">
                         <div id="udt-theme-icon-sun">${ICONS.sun}</div>
                         <div id="udt-theme-icon-moon">${ICONS.moon}</div>
                    </div>
                     <div class="udt-header-icon" id="${this.id}-settings-btn" title="Settings">${ICONS.settings}</div>
                </div>
                <div id="${this.id}-main-content">
                    <div id="${this.id}-sidebar"></div>
                    <div id="${this.id}-content-area">
                         <div id="${this.id}-settings-panel" class="udt-content-panel"></div>
                    </div>
                </div>
            `;

            const resizer = createElement('div', [], { id: `${this.id}-resizer` });
            const highlighter = createElement('div', [], { id: `${this.id}-highlighter`, style: 'display: none;' });
            const toastContainer = createElement('div', [], { id: `${this.id}-toast-container` });

            document.body.append(launcher, panel, resizer, highlighter, toastContainer);
        }

        storeDomReferences() {
            this.dom = {
                launcher: qs(`#${this.id}-launcher`),
                panel: qs(`#${this.id}-panel`),
                resizer: qs(`#${this.id}-resizer`),
                pinBtn: qs(`#${this.id}-pin-btn`),
                themeToggle: qs(`#${this.id}-theme-toggle`),
                settingsBtn: qs(`#${this.id}-settings-btn`),
                sidebar: qs(`#${this.id}-sidebar`),
                contentArea: qs(`#${this.id}-content-area`),
                settingsPanel: qs(`#${this.id}-settings-panel`),
                highlighter: qs(`#${this.id}-highlighter`),
                toastContainer: qs(`#${this.id}-toast-container`),
                sideSwitcherBtn: qs(`#${this.id}-side-switcher-btn`)
            };
        }

        injectStyles() {
            GM_addStyle(`
                :root {
                    --udt-font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                    --udt-border-radius: 12px; --udt-transition-fast: all 0.2s ease-in-out; --udt-panel-width: 450px;
                    --udt-table-cell-padding: 8px 12px;
                }
                html { transition: margin 0.3s ease-in-out; }
                body.udt-dark-theme {
                    --bg-primary: #121212; --bg-secondary: #1e1e1e; --bg-tertiary: #2a2a2a;
                    --bg-interactive: #333333; --bg-interactive-hover: #404040;
                    --text-primary: #e0e0e0; --text-secondary: #b3b3b3; --border-primary: #383838;
                    --accent-primary: #00aaff; --accent-glow: rgba(0, 170, 255, 0.3);
                    --destructive: #ff4d4d; --destructive-glow: rgba(255, 77, 77, 0.3);
                    --shadow-color: rgba(0, 0, 0, 0.5);
                }
                body.udt-light-theme {
                    --bg-primary: #f5f5f7; --bg-secondary: #ffffff; --bg-tertiary: #f0f0f0;
                    --bg-interactive: #e9e9e9; --bg-interactive-hover: #e0e0e0;
                    --text-primary: #1d1d1f; --text-secondary: #515154; --border-primary: #d2d2d7;
                    --accent-primary: #007aff; --accent-glow: rgba(0, 122, 255, 0.2);
                    --destructive: #ff3b30; --destructive-glow: rgba(255, 59, 48, 0.2);
                    --shadow-color: rgba(0, 0, 0, 0.15);
                }
                #${this.id}-launcher { position: fixed; width: 48px; height: 48px; background-color: var(--bg-secondary); border: 1px solid var(--border-primary); border-radius: 50%; box-shadow: 0 4px 15px var(--shadow-color); display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 2147483645; transition: transform 0.2s ease, box-shadow 0.2s ease; }
                #${this.id}-launcher:hover { transform: scale(1.1); box-shadow: 0 6px 20px var(--shadow-color), 0 0 15px var(--accent-glow); }
                #${this.id}-launcher svg { width: 28px; height: 28px; color: var(--accent-primary); transition: transform 0.8s ease; }
                .udt-panel { position: fixed; top: 0; height: 100vh; width: var(--udt-panel-width); z-index: 2147483646; display: flex; flex-direction: column; background-color: var(--bg-secondary); color: var(--text-primary); box-shadow: 0 0 20px var(--shadow-color); transition: transform 0.3s ease-in-out; }
                .udt-panel.side-left { left: 0; transform: translateX(-100%); border-right: 1px solid var(--border-primary); }
                .udt-panel.side-right { right: 0; transform: translateX(100%); border-left: 1px solid var(--border-primary); }
                .udt-panel.expanded { transform: translateX(0); }
                #${this.id}-resizer { position: fixed; top: 0; height: 100%; width: 5px; cursor: col-resize; z-index: 2147483647; }
                .udt-panel.side-left + #${this.id}-resizer { left: var(--udt-panel-width); }
                .udt-panel.side-right + #${this.id}-resizer { right: var(--udt-panel-width); }
                #${this.id}-header { display: flex; align-items: center; padding: 12px 20px; border-bottom: 1px solid var(--border-primary); flex-shrink: 0; }
                #${this.id}-title { font-size: 18px; font-weight: 600; margin-right: auto; white-space: nowrap; }
                .udt-header-icon { display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; margin-left: 8px; cursor: pointer; color: var(--text-secondary); border-radius: 50%; transition: var(--udt-transition-fast); }
                .udt-panel.side-left #${this.id}-side-switcher-btn { order: 10; } /* Push to the right */
                .udt-header-icon:hover { color: var(--text-primary); background-color: var(--bg-interactive); transform: scale(1.1); }
                .udt-header-icon svg { width: 20px; height: 20px; }
                .udt-header-icon#${this.id}-pin-btn.pinned { color: var(--accent-primary); }
                .udt-header-icon #udt-theme-icon-sun { display: none; }
                body.udt-dark-theme .udt-header-icon #udt-theme-icon-moon { display: none; }
                body.udt-dark-theme .udt-header-icon #udt-theme-icon-sun { display: block; }
                #${this.id}-main-content { flex-grow: 1; display: flex; overflow: hidden; }
                #${this.id}-sidebar { width: 220px; flex-shrink: 0; padding: 12px 0; border-right: 1px solid var(--border-primary); display: flex; flex-direction: column; }
                .udt-panel.side-right #${this.id}-sidebar { order: 2; border-right: none; border-left: 1px solid var(--border-primary); }
                .udt-tab-btn { width: 100%; padding: 10px 20px; font-size: 15px; font-weight: 500; cursor: pointer; background: none; border: none; color: var(--text-secondary); text-align: left; border-left: 3px solid transparent; transition: var(--udt-transition-fast); display: flex; align-items: center; gap: 12px; }
                .udt-tab-btn:hover { color: var(--text-primary); background-color: var(--bg-tertiary); }
                .udt-tab-btn.active { color: var(--accent-primary); font-weight: 600; background-color: var(--bg-tertiary); border-left-color: var(--accent-primary); }
                .udt-panel.side-right .udt-tab-btn { border-left: none; border-right: 3px solid transparent; }
                .udt-panel.side-right .udt-tab-btn.active { border-right-color: var(--accent-primary); }
                .udt-tab-btn .picker-active-dot { width: 8px; height: 8px; background-color: var(--destructive); border-radius: 50%; animation: udt-pulse 1.5s infinite; }
                #${this.id}-content-area { flex-grow: 1; display: flex; flex-direction: column; overflow: hidden; position: relative; }
                .udt-content-panel { position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; flex-direction: column; opacity: 0; visibility: hidden; transition: opacity 0.2s ease, visibility 0s 0.2s; }
                .udt-content-panel.active { opacity: 1; visibility: visible; z-index: 1; transition: opacity 0.2s ease 0.1s, visibility 0s; }
                .udt-panel-header { padding: 16px 24px; border-bottom: 1px solid var(--border-primary); display: flex; align-items: center; gap: 16px; flex-shrink: 0; }
                .udt-panel-title { font-size: 18px; font-weight: 600; color: var(--text-primary); margin-right:auto; }
                .udt-panel-body { flex-grow: 1; overflow-y: auto; padding: 15px; font-size: 14px; }
                .udt-panel-body.no-padding { padding: 0; }
                .udt-panel-body::-webkit-scrollbar { width: 12px; } .udt-panel-body::-webkit-scrollbar-track { background: var(--bg-tertiary); } .udt-panel-body::-webkit-scrollbar-thumb { background-color: var(--bg-interactive-hover); border-radius: 10px; border: 3px solid var(--bg-tertiary); }
                .udt-btn { padding: 8px 16px; font-size: 14px; font-weight: 600; border: none; border-radius: 8px; cursor: pointer; transition: var(--udt-transition-fast); display: inline-flex; align-items: center; gap: 8px; }
                .udt-btn.primary { color: #fff; background-image: linear-gradient(to top, var(--accent-primary), #00c6ff); box-shadow: 0 4px 15px var(--accent-glow); }
                .udt-btn.primary:hover { transform: translateY(-2px); box-shadow: 0 6px 20px var(--accent-glow); }
                .udt-btn.secondary { background-color: var(--bg-interactive); color: var(--text-primary); } .udt-btn.secondary:hover { background-color: var(--bg-interactive-hover); }
                .udt-btn.destructive { background-color: var(--bg-interactive); color: var(--destructive); } .udt-btn.destructive:hover { background-color: var(--destructive-glow); }
                .udt-input, .udt-textarea, .udt-select { width: 100%; background-color: var(--bg-tertiary); color: var(--text-primary); border: 1px solid var(--border-primary); padding: 8px; border-radius: 6px; font-family: var(--udt-font-family); }
                .udt-input-group { display: flex; } .udt-input-group > .udt-input { border-right: 0; border-top-right-radius: 0; border-bottom-right-radius: 0; }
                .udt-input-group > .udt-copy-btn { border-top-left-radius: 0; border-bottom-left-radius: 0; }
                .udt-table { width: 100%; border-collapse: collapse; font-size: 13px; table-layout: fixed; }
                .udt-table th { position: sticky; top: 0; background-color: var(--bg-secondary); z-index: 1; cursor: pointer; user-select: none; position: relative; }
                .udt-table th .resize-handle { position: absolute; top: 0; right: 0; width: 5px; height: 100%; cursor: col-resize; z-index: 2; }
                .udt-table th, .udt-table td { padding: var(--udt-table-cell-padding); text-align: left; border-bottom: 1px solid var(--border-primary); white-space:nowrap; overflow: hidden; text-overflow: ellipsis; }
                .udt-table td { max-width: 200px; } /* Prevent wide columns by default */
                .udt-table tbody tr:hover { background-color: var(--bg-tertiary); }
                .udt-action-icon { cursor: pointer; color: var(--text-secondary); width: 18px; height: 18px; transition: color 0.2s, transform 0.2s; }
                .udt-action-icon.copy:hover, .udt-action-icon.inspect:hover { color: var(--accent-primary); transform: scale(1.2); }
                .udt-action-icon.hide:hover { color: var(--destructive); transform: scale(1.2); }
                #${this.id}-highlighter { position: absolute; background-color: rgba(255, 0, 255, 0.2); border: 2px dashed #ff00ff; border-radius: 4px; z-index: 2147483644; pointer-events: none; transition: all 0.1s ease-out; box-sizing: border-box; }
                .element-selected-permanent { outline: 3px solid var(--accent-primary) !important; box-shadow: 0 0 12px var(--accent-glow) !important; }
                .udt-settings-group { margin-bottom: 24px; padding-bottom: 24px; border-bottom: 1px solid var(--border-primary); }
                .udt-settings-group:last-child { border-bottom: none; }
                .udt-settings-group h3 { font-size: 16px; font-weight: 600; margin-bottom: 16px; }
                .udt-settings-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; }
                .udt-toggle-switch { position: relative; display: inline-block; width: 50px; height: 28px; }
                .udt-toggle-switch input { display: none; }
                .udt-toggle-slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: var(--bg-interactive); transition: var(--udt-transition-fast); border-radius: 28px; }
                .udt-toggle-slider:before { position: absolute; content: ""; height: 20px; width: 20px; left: 4px; bottom: 4px; background-color: white; transition: var(--udt-transition-fast); border-radius: 50%; }
                input:checked + .udt-toggle-slider { background-color: var(--accent-primary); } input:checked + .udt-toggle-slider:before { transform: translateX(22px); }
                #udt-hidden-items-list { list-style: none; padding: 0; max-height: 200px; overflow-y: auto; border: 1px solid var(--border-primary); border-radius: 8px; }
                .udt-hidden-item { display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; font-family: 'Courier New', monospace; font-size: 13px; border-bottom: 1px solid var(--border-primary); }
                .udt-hidden-item:last-child { border-bottom: none; }
                .udt-unhide-btn { display: flex; align-items: center; gap: 6px; cursor: pointer; color: var(--text-secondary); transition: var(--udt-transition-fast); background:none; border:none; font-size:13px; font-family:var(--udt-font-family); }
                .udt-unhide-btn:hover { color: var(--accent-primary); } .udt-unhide-btn svg { width: 16px; height: 16px; }
                #${this.id}-toast-container { position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); z-index: 2147483647; display: flex; flex-direction: column; gap: 10px; }
                .udt-toast { padding: 12px 20px; background-color: var(--bg-secondary); color: var(--text-primary); border: 1px solid var(--border-primary); border-radius: 8px; box-shadow: 0 4px 15px var(--shadow-color); font-size: 14px; font-weight: 500; display: flex; align-items: center; gap: 10px; animation: udt-toast-in 0.3s ease forwards, udt-toast-out 0.3s ease 2.7s forwards; }
                .udt-toast svg { width: 20px; height: 20px; color: var(--accent-primary); }
                @keyframes udt-toast-in { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes udt-toast-out { from { opacity: 1; transform: translateY(0); } to { opacity: 0; transform: translateY(20px); } }
                @keyframes udt-pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(0.8); } }
            `);
        }

        renderTabs() {
            clearElement(this.dom.sidebar);
            this.getVisibleComponents().forEach(comp => {
                const tabBtn = createElement('button', ['udt-tab-btn'], { 'data-tab': comp.id, title: comp.name });
                tabBtn.innerHTML = `<span>${comp.icon || '●'}</span><span>${comp.name}</span>`;
                this.dom.sidebar.appendChild(tabBtn);
            });
        }

        renderAllContent() {
            this.getEnabledComponents().forEach(comp => {
                const contentEl = comp.render();
                this.dom.contentArea.appendChild(contentEl);
            });
            this.renderSettingsMenu();
        }

        renderSettingsMenu() {
            const menu = this.dom.settingsPanel; clearElement(menu);
            const body = createElement('div', ['udt-panel-body']);
            const header = createElement('div', ['udt-panel-header']);
            header.append(createElement('h2', ['udt-panel-title'], {}, 'Settings'));

            const appearanceGroup = createElement('div', ['udt-settings-group']);
            appearanceGroup.append(createElement('h3', [], {}, 'Appearance'));
            const darkModeRow = createElement('div', ['udt-settings-row']);
            darkModeRow.append(createElement('label', [], {}, 'Dark Mode'), this.createToggle('dark-mode-toggle', this.settings.get('ui.isDarkMode')));
            const sideSelectRow = createElement('div', ['udt-settings-row']);
            const sideSelect = createElement('select', ['udt-select'], {id: 'udt-side-select'});
            sideSelect.innerHTML = `<option value="left">Left</option><option value="right">Right</option>`;
            sideSelect.value = this.settings.get('ui.positionSide');
            sideSelectRow.append(createElement('label', [], {}, 'Panel Side'), sideSelect);
            appearanceGroup.append(darkModeRow, sideSelectRow);

            const tabsGroup = createElement('div', ['udt-settings-group']);
            tabsGroup.append(createElement('h3', [], {}, 'Visible Tabs'));
            this.getOrderedComponents().forEach(comp => {
                const isVisible = this.settings.getComponentState(comp.id)?.showInToolbar ?? true;
                const row = createElement('div', ['udt-settings-row']);
                row.append(createElement('label', [], {}, comp.name), this.createToggle(null, isVisible, { 'data-component-id': comp.id }));
                tabsGroup.append(row);
            });

            const dataGroup = createElement('div', ['udt-settings-group']);
            dataGroup.innerHTML = `<h3>Hidden Items on ${window.location.hostname}</h3><ul id="udt-hidden-items-list"></ul><div style="margin-top: 16px; display: flex; justify-content: flex-end;"><button id="udt-clear-hidden-btn" class="udt-btn destructive">Clear All</button></div>`;
            const exportGroup = createElement('div', ['udt-settings-group']);
            exportGroup.innerHTML = `<h3>Data</h3>`;
            const exportRow = createElement('div', ['udt-settings-row']);
            exportRow.append(createElement('label', [], {}, 'Export all data to a JSON file.'), createElement('button', ['udt-btn', 'primary'], { id: 'udt-export-btn' }, 'Export All Data'));
            exportGroup.append(exportRow);

            body.append(appearanceGroup, tabsGroup, dataGroup, exportGroup);
            menu.append(header, body);
            this.bindSettingsMenuEvents();
        }

        createToggle(id, isChecked, attributes = {}) {
            const label = createElement('label', ['udt-toggle-switch']);
            const input = createElement('input', [], { type: 'checkbox', ...attributes });
            if (id) input.id = id;
            input.checked = isChecked;
            const slider = createElement('span', ['udt-toggle-slider']);
            label.append(input, slider);
            return label;
        }

        registerComponents() { this.componentDefinitions.forEach(CompClass => { const instance = new CompClass(this); this.components[instance.id] = instance; }); }
        getOrderedComponents() {
            const order = this.settings.get('components.order') || [];
            const componentMap = new Map(Object.values(this.components).map(c => [c.id, c]));
            return [...order.map(id => componentMap.get(id)).filter(Boolean), ...Object.values(this.components).filter(c => !order.includes(c.id))];
        }
        getEnabledComponents() { return this.getOrderedComponents().filter(c => this.settings.getComponentState(c.id)?.enabled); }
        getVisibleComponents() { return this.getOrderedComponents().filter(c => this.settings.getComponentState(c.id)?.showInToolbar); }

        applyPreferences() {
            this.applyTheme(this.settings.get('ui.isDarkMode'));
            this.switchSide(this.settings.get('ui.positionSide'));
            const isPinned = this.settings.get('ui.isPinned');
            if (isPinned) {
                this.dom.panel.classList.add('expanded');
                this.updatePageMargin(true);
            }
            if (this.dom.pinBtn) this.dom.pinBtn.classList.toggle('pinned', isPinned);

            (async () => {
                this.launcherPos = await GM_getValue('udtLauncherPos_v7', { x: 30, y: 30 });
                this.dom.launcher.style.left = `${this.launcherPos.x}px`;
                this.dom.launcher.style.top = `${this.launcherPos.y}px`;
                const panelWidth = await GM_getValue('udtPanelWidth_v7', 450);
                document.documentElement.style.setProperty('--udt-panel-width', `${panelWidth}px`);
            })();
        }

        applyTheme(isDark) {
            const themeClass = isDark ? 'udt-dark-theme' : 'udt-light-theme';
            document.body.classList.remove('udt-dark-theme', 'udt-light-theme');
            document.body.classList.add(themeClass);
            this.settings.set('ui.isDarkMode', isDark);
            const toggle = qs('#dark-mode-toggle');
            if (toggle) toggle.checked = isDark;
        }

        togglePanel() {
            const isPinned = this.settings.get('ui.isPinned'); if (isPinned) return;
            this.isPanelOpen = !this.isPanelOpen;
            this.dom.panel.classList.toggle('expanded', this.isPanelOpen);
            if (this.isPanelOpen) this.setActiveTab(this.settings.get('activeTab'));
        }

        handleShortcutToggle() {
            this.togglePin();
        }

        togglePin() {
            const isPinned = !this.settings.get('ui.isPinned');
            this.settings.set('ui.isPinned', isPinned);
            if(this.dom.pinBtn) this.dom.pinBtn.classList.toggle('pinned', isPinned);
            this.dom.panel.classList.toggle('expanded', isPinned);
            this.isPanelOpen = isPinned;
            this.updatePageMargin(isPinned);
        }

        updatePageMargin(isPanelVisible) {
            const side = this.settings.get('ui.positionSide');
            const width = isPanelVisible ? `calc(${getComputedStyle(document.documentElement).getPropertyValue('--udt-panel-width')} + 5px)` : '0px';
            document.documentElement.style.marginLeft = (side === 'left') ? width : '0px';
            document.documentElement.style.marginRight = (side === 'right') ? width : '0px';
        }

        switchSide(side) {
            this.dom.panel.classList.remove('side-left', 'side-right'); this.dom.panel.classList.add(`side-${side}`);
            this.dom.resizer.style.left = side === 'left' ? 'var(--udt-panel-width)' : 'auto';
            this.dom.resizer.style.right = side === 'right' ? 'var(--udt-panel-width)' : 'auto';
            this.settings.set('ui.positionSide', side);
            this.updatePageMargin(this.settings.get('ui.isPinned'));
            this.updateSideSwitcherIcon();
        }

        updateSideSwitcherIcon() {
            if (!this.dom.sideSwitcherBtn) return;
            const side = this.settings.get('ui.positionSide');
            this.dom.sideSwitcherBtn.innerHTML = side === 'left' ? ICONS.arrowRight : ICONS.arrowLeft;
            this.dom.sideSwitcherBtn.title = side === 'left' ? 'Dock Right' : 'Dock Left';
        }

        setActiveTab(tabId) {
            if (tabId === 'settings') { this.populateHiddenElementsList(); }
            else { const comp = this.components[tabId]; if (!comp || !this.settings.getComponentState(tabId)?.showInToolbar) { tabId = this.getVisibleComponents()[0]?.id; } }
            if (!tabId) return;
            qsa('.udt-tab-btn', this.dom.panel).forEach(btn => btn.classList.toggle('active', btn.dataset.tab === tabId));
            qsa('.udt-content-panel', this.dom.panel).forEach(content => content.classList.toggle('active', content.id === `${this.id}-${tabId}-panel`));
            this.settings.set('activeTab', tabId);
            this.components[tabId]?.update?.();
        }

        showToast(message, duration = 3000) {
            const toast = createElement('div', ['udt-toast']);
            toast.innerHTML = `${ICONS.info} ${message}`;
            this.dom.toastContainer.appendChild(toast);
            clearTimeout(this.toastTimeout);
            this.toastTimeout = setTimeout(() => toast.remove(), duration);
        }

        startPicker(callback, cursor = 'crosshair', highlight = true, sourceComponent) {
            if (this.isPickerActive) return; this.isPickerActive = true;
            this.onPickerClickCallback = callback; document.body.style.cursor = cursor;
            this.onPickerHover = (e) => {
                if (e.target.closest('[data-udt-element]')) { this.removeHighlight(); return; }
                if (e.target === this.lastHighlightedElement) return;
                if (highlight) { this.removeHighlight(); this.lastHighlightedElement = e.target; this.dom.highlighter.style.display = 'block'; this.updateHighlighter(); }
            };
            this.onPickerClick = (e) => {
                if (e.target.closest('[data-udt-element]')) return;
                e.preventDefault(); e.stopPropagation();
                if (this.onPickerClickCallback) this.onPickerClickCallback(e.target);
                this.stopPicker();
            };
            document.addEventListener('mousemove', this.onPickerHover, true);
            document.addEventListener('click', this.onPickerClick, true);
            sourceComponent?.updatePickerButton(true);
        }

        stopPicker() {
            if (!this.isPickerActive) return; this.isPickerActive = false;
            document.body.style.cursor = '';
            document.removeEventListener('mousemove', this.onPickerHover, true);
            document.removeEventListener('click', this.onPickerClick, true);
            this.removeHighlight();
            Object.values(this.components).forEach(c => c.updatePickerButton?.(false));
        }

        removeHighlight() { if(this.dom.highlighter) this.dom.highlighter.style.display = 'none'; if (this.lastHighlightedElement) { this.lastHighlightedElement = null; } }
        updateHighlighter() {
            if (!this.lastHighlightedElement) return;
            const rect = this.lastHighlightedElement.getBoundingClientRect();
            const highlighter = this.dom.highlighter;
            highlighter.style.width = `${rect.width}px`;
            highlighter.style.height = `${rect.height}px`;
            highlighter.style.top = `${rect.top + window.scrollY}px`;
            highlighter.style.left = `${rect.left + window.scrollX}px`;
        }

        bindCoreEvents() {
            this.dom.launcher.addEventListener('click', () => { if(!this.isDragging) { this.dom.panel.classList.add('expanded'); this.isPanelOpen = true; } });
            this.dom.panel.addEventListener('mouseenter', () => { if (!this.settings.get('ui.isPinned')) { this.dom.panel.classList.add('expanded'); this.isPanelOpen = true; } });
            this.dom.panel.addEventListener('mouseleave', () => { if (!this.settings.get('ui.isPinned')) { this.dom.panel.classList.remove('expanded'); this.isPanelOpen = false; } });
            if (this.dom.pinBtn) this.dom.pinBtn.addEventListener('click', () => this.togglePin());
            if (this.dom.sideSwitcherBtn) this.dom.sideSwitcherBtn.addEventListener('click', () => this.switchSide(this.settings.get('ui.positionSide') === 'left' ? 'right' : 'left'));
            if (this.dom.sidebar) this.dom.sidebar.addEventListener('click', e => { const tabId = e.target.closest('.udt-tab-btn')?.dataset.tab; if (tabId) this.setActiveTab(tabId); });
            if (this.dom.settingsBtn) this.dom.settingsBtn.addEventListener('click', () => this.setActiveTab('settings'));
            if (this.dom.themeToggle) this.dom.themeToggle.addEventListener('click', () => this.applyTheme(!this.settings.get('ui.isDarkMode')));
            this.dom.panel.addEventListener('click', e => { const copyBtn = e.target.closest('.udt-copy-btn'); if (copyBtn) { const input = copyBtn.previousElementSibling; if (input) { GM_setClipboard(input.value); this.showToast('Copied!'); } } });
            document.addEventListener('keydown', e => {
                if (e.key.toUpperCase() === KEYBOARD_SHORTCUT.key && e.ctrlKey === KEYBOARD_SHORTCUT.ctrlKey && e.shiftKey === KEYBOARD_SHORTCUT.shiftKey && e.altKey === KEYBOARD_SHORTCUT.altKey) {
                    e.preventDefault(); e.stopPropagation(); this.handleShortcutToggle();
                }
            });
            this.bindDragEvents(this.dom.launcher, 'udtLauncherPos_v7');
            this.bindResizeEvents();
        }

        bindSettingsMenuEvents() {
            const settingsPanel = this.dom.settingsPanel; if (!settingsPanel) return;
            qs('#dark-mode-toggle', settingsPanel)?.addEventListener('change', e => this.applyTheme(e.target.checked));
            qs('#udt-side-select', settingsPanel)?.addEventListener('change', e => this.switchSide(e.target.value));
            qsa('[data-component-id]', settingsPanel).forEach(toggle => {
                toggle.addEventListener('change', e => {
                    const id = e.target.dataset.componentId; this.settings.setComponentState(id, { ...this.settings.getComponentState(id), showInToolbar: e.target.checked }); this.renderTabs();
                });
            });
            qs('#udt-clear-hidden-btn', settingsPanel)?.addEventListener('click', async () => { await this.setHiddenSelectors([]); await this.populateHiddenElementsList(); this.showToast('All hidden items cleared for this domain.'); });
            qs('#udt-export-btn', settingsPanel)?.addEventListener('click', () => this.exportDataAsJSON());
            qs('#udt-hidden-items-list', settingsPanel)?.addEventListener('click', async (e) => {
                const unhideBtn = e.target.closest('.udt-unhide-btn'); if (!unhideBtn) return;
                const item = unhideBtn.closest('.udt-hidden-item'); const selectorToUnhide = item.dataset.selector;
                let hiddenSelectors = await this.getHiddenSelectors(); const updatedSelectors = hiddenSelectors.filter(s => s !== selectorToUnhide);
                await this.setHiddenSelectors(updatedSelectors); item.remove(); this.showToast('Element un-hidden. Rescan to see it.');
            });
        }

        bindResizeEvents() {
            const resizer = this.dom.resizer; if (!resizer) return;
            const onMouseDown = (e) => {
                e.preventDefault();
                const startX = e.clientX;
                const startWidth = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--udt-panel-width'));
                const side = this.settings.get('ui.positionSide');
                const onMouseMove = (moveEvent) => {
                    const dx = moveEvent.clientX - startX;
                    const newWidth = clamp(side === 'left' ? startWidth + dx : startWidth - dx, 300, 1000);
                    document.documentElement.style.setProperty('--udt-panel-width', `${newWidth}px`);
                    if (this.settings.get('ui.isPinned')) this.updatePageMargin(true);
                };
                const onMouseUp = () => {
                    document.removeEventListener('mousemove', onMouseMove); document.removeEventListener('mouseup', onMouseUp);
                    GM_setValue('udtPanelWidth_v7', parseInt(getComputedStyle(document.documentElement).getPropertyValue('--udt-panel-width')));
                };
                document.addEventListener('mousemove', onMouseMove); document.addEventListener('mouseup', onMouseUp);
            };
            resizer.addEventListener('mousedown', onMouseDown);
        }

        bindDragEvents(element, storageKey) {
            if (!element) return;
            let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
            element.onmousedown = (e) => {
                e = e || window.event; e.preventDefault(); this.isDragging = false;
                pos3 = e.clientX; pos4 = e.clientY;
                document.onmouseup = closeDragElement; document.onmousemove = elementDrag;
            };
            const elementDrag = (e) => {
                this.isDragging = true; e = e || window.event; e.preventDefault();
                pos1 = pos3 - e.clientX; pos2 = pos4 - e.clientY; pos3 = e.clientX; pos4 = e.clientY;
                element.style.top = (element.offsetTop - pos2) + "px"; element.style.left = (element.offsetLeft - pos1) + "px";
                element.style.cursor = 'grabbing';
            };
            const closeDragElement = () => {
                document.onmouseup = null; document.onmousemove = null; element.style.cursor = 'grab';
                this.launcherPos = { x: element.offsetLeft, y: element.offsetTop }; GM_setValue(storageKey, this.launcherPos);
                setTimeout(() => this.isDragging = false, 50);
            };
        }

        getHiddenSelectors = async () => { const all = await GM_getValue(this.HIDDEN_SELECTORS_KEY, {}); return all[window.location.hostname] || []; };
        setHiddenSelectors = async (selectors) => { const all = await GM_getValue(this.HIDDEN_SELECTORS_KEY, {}); all[window.location.hostname] = selectors; await GM_setValue(this.HIDDEN_SELECTORS_KEY, all); };

        async populateHiddenElementsList() {
            const list = qs('#udt-hidden-items-list', this.dom.panel); if (!list) return; clearElement(list);
            const hiddenSelectors = await this.getHiddenSelectors();
            if (hiddenSelectors.length === 0) { list.append(createElement('li', ['udt-hidden-item'], {}, 'No items hidden on this domain.')); return; }
            hiddenSelectors.forEach(selector => {
                const item = createElement('li', ['udt-hidden-item'], { 'data-selector': selector });
                item.append(createElement('span', ['udt-hidden-item-selector'], {title: selector}, selector));
                const btn = createElement('button', ['udt-unhide-btn']); btn.innerHTML = `${ICONS.unhide} Unhide`;
                item.append(btn); list.append(item);
            });
        }

        async exportDataAsJSON() {
            this.showToast("Generating export...");
            const interactiveElements = Array.from(document.querySelectorAll('button, a[href], input:not([type="hidden"]), select, textarea'))
                .filter(el => !el.closest('[data-udt-element]'))
                .map(el => ({ tag: el.tagName.toLowerCase(), text: el.textContent?.trim() || el.name || el.value || '', selector: getCssPath(el), html: el.outerHTML }));
            const resources = performance.getEntriesByType("resource").map(res => ({ name: res.name, type: res.initiatorType, size_kb: (res.transferSize / 1024).toFixed(2), load_time_ms: res.duration.toFixed(2) }));
            const exportData = {
                metadata: { url: window.location.href, domain: window.location.hostname, exportedAt: new Date().toISOString(), hiddenSelectorsOnDomain: await this.getHiddenSelectors() },
                interactiveElements, resources
            };
            GM_download({
                url: 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportData, null, 2)),
                name: `udt-export-${window.location.hostname}-${new Date().toISOString().split('T')[0]}.json`,
                saveAs: true
            });
            this.showToast("Export download started.");
        }
    }

    class ToolkitComponent {
        constructor(toolkit, id, name, icon = '●') { this.toolkit = toolkit; this.id = id; this.name = name; this.icon = icon; this.el = null; }
        render() {
            if (!this.el) {
                this.el = createElement('div', ['udt-content-panel'], { id: `${this.toolkit.id}-${this.id}-panel` });
                this.buildContent(); this.bindEvents();
            }
            return this.el;
        }
        buildContent() { this.el.innerHTML = `<h2>${this.name}</h2><p>Component not implemented.</p>`; }
        bindEvents() {}
        update() {}
        updatePickerButton(isPickerActive, btnClass = '.picker-btn') {
            const btn = qs(btnClass, this.el);
            if (btn) {
                btn.textContent = isPickerActive ? 'Cancel Picking' : btn.dataset.defaultText || 'Pick';
                btn.classList.toggle('primary', !isPickerActive);
                const tabBtn = qs(`.udt-tab-btn[data-tab="${this.id}"]`, this.toolkit.dom.panel);
                if(tabBtn) {
                    let dot = qs('.picker-active-dot', tabBtn);
                    if (isPickerActive && !dot) {
                        const iconSpan = qs('span:first-child', tabBtn); if(iconSpan) iconSpan.appendChild(createElement('span', ['picker-active-dot']));
                    } else if (!isPickerActive && dot) { dot.remove(); }
                }
            }
        }
        createInputGroup(labelText, inputId, inputValue, withCopy = true) {
            const container = createElement('div', [], {style: 'padding: 0; border: 0; margin: 0 0 10px 0;'});
            const label = createElement('label', [], { for: inputId, style: 'display:block; margin-bottom: 4px; font-size: 12px; font-weight: 500; color: var(--text-secondary);' }, labelText);
            const group = createElement('div', ['udt-input-group']);
            const input = createElement('input', ['udt-input'], { id: inputId, value: inputValue, readonly: true, style: 'font-family: monospace; font-size: 12px;' });
            group.append(input);
            if (withCopy) {
                const copyBtn = createElement('button', ['udt-btn', 'secondary', 'udt-copy-btn'], {title: 'Copy'});
                copyBtn.innerHTML = ICONS.copy;
                group.append(copyBtn);
            }
            container.append(label, group);
            return container;
        }
    }

    // --- All Component Classes (ElementScanner, ResourceViewer, AI, Inspector, etc.) are defined below ---

    class ElementScannerComponent extends ToolkitComponent {
        constructor(toolkit) { super(toolkit, 'element-scanner', 'Scanner', '🔍'); this.elements = []; }
        buildContent() {
            const header = createElement('div', ['udt-panel-header']);
            header.innerHTML = `<h2 class="udt-panel-title">${this.name}</h2><button class="udt-btn secondary" id="udt-rescan-btn">Rescan</button><div id="udt-element-count" style="margin-left:10px;">Found: 0</div>`;
            const body = createElement('div', ['udt-panel-body', 'no-padding']);
            body.innerHTML = `<table class="udt-table" id="udt-elements-table"><thead><tr><th>Tag</th><th>Text / Name</th><th>Selector</th><th>Actions</th></tr></thead><tbody></tbody></table>`;
            this.el.append(header, body);
        }
        bindEvents() {
            qs('#udt-rescan-btn', this.el).addEventListener('click', () => this.update());
            const tableBody = qs('#udt-elements-table tbody', this.el);
            tableBody.addEventListener('mouseover', e => {
                const row = e.target.closest('tr'); if (!row) return;
                const element = this.elements[row.dataset.index]; if (!element) return;
                this.toolkit.lastHighlightedElement = element; this.toolkit.updateHighlighter();
                this.toolkit.dom.highlighter.style.display = 'block';
            });
            tableBody.addEventListener('mouseout', () => this.toolkit.removeHighlight());
            tableBody.addEventListener('click', async e => {
                const row = e.target.closest('tr'); if (!row) return;
                const element = this.elements[row.dataset.index]; if(!element) return;
                if (e.target.closest('.copy')) { GM_setClipboard(getCssPath(element)); this.toolkit.showToast('Selector Copied!'); }
                if (e.target.closest('.hide')) {
                    const selectorToHide = getCssPath(element);
                    let hiddenSelectors = await this.toolkit.getHiddenSelectors();
                    if (!hiddenSelectors.includes(selectorToHide)) {
                        hiddenSelectors.push(selectorToHide);
                        await this.toolkit.setHiddenSelectors(hiddenSelectors);
                        this.toolkit.showToast('Element hidden. Rescan to update.');
                        row.remove();
                    }
                }
                if (e.target.closest('.inspect')) {
                    const inspector = this.toolkit.components.inspector;
                    if(inspector) {
                        inspector.update(element);
                        this.toolkit.setActiveTab('inspector');
                    }
                }
            });
        }
        async update() {
            this.toolkit.showToast('Scanning elements...');
            const hiddenSelectors = await this.toolkit.getHiddenSelectors();
            const selector = 'button, a[href], input:not([type="hidden"]), select, textarea, [role="button"], [role="link"], [tabindex]:not([tabindex="-1"])';
            this.elements = Array.from(document.querySelectorAll(selector)).filter(el => {
                if (el.closest('[data-udt-element]')) return false;
                for (const hidden of hiddenSelectors) { try { if (el.matches(hidden)) return false; } catch (e) {} }
                return true;
            });
            const tableBody = qs('#udt-elements-table tbody', this.el); clearElement(tableBody);
            this.elements.forEach((el, index) => {
                const text = el.textContent?.trim() || el.name || el.value || el.ariaLabel || 'N/A';
                const row = createElement('tr', [], { 'data-index': index });
                row.innerHTML = `
                    <td>&lt;${el.tagName.toLowerCase()}&gt;</td>
                    <td title="${text}">${text.substring(0, 50)}</td>
                    <td title="${getCssPath(el)}">${getCssPath(el).substring(0,50)}...</td>
                    <td style="display:flex; gap:12px;">
                        <span class="udt-action-icon inspect" title="Inspect Element">${ICONS.inspect}</span>
                        <span class="udt-action-icon copy" title="Copy Selector">${ICONS.copy}</span>
                        <span class="udt-action-icon hide" title="Hide Element">${ICONS.hide}</span>
                    </td>`;
                tableBody.append(row);
            });
            qs('#udt-element-count', this.el).textContent = `Found: ${this.elements.length}`;
        }
    }
    class ResourceViewerComponent extends ToolkitComponent {
        constructor(toolkit) { super(toolkit, 'resource-viewer', 'Resources', '⚡'); }
         buildContent() {
            const header = createElement('div', ['udt-panel-header']);
            header.innerHTML = `<h2 class="udt-panel-title">${this.name}</h2><div id="udt-resource-count">Loaded: 0</div>`;
            const body = createElement('div', ['udt-panel-body', 'no-padding']);
            body.innerHTML = `<table class="udt-table" id="udt-resources-table"><thead><tr><th>Name</th><th>Type</th><th>Size (KB)</th><th>Time (ms)</th></tr></thead><tbody></tbody></table>`;
            this.el.append(header, body);
        }
        update() {
            const resources = performance.getEntriesByType("resource");
            const tableBody = qs('#udt-resources-table tbody', this.el); clearElement(tableBody);
            resources.forEach(res => {
                const fileName = res.name.split('/').pop().split('?')[0];
                const row = createElement('tr');
                row.innerHTML = `
                    <td title="${res.name}">${fileName.substring(0, 50)}...</td>
                    <td>${res.initiatorType}</td>
                    <td>${(res.transferSize / 1024).toFixed(2)}</td>
                    <td>${res.duration.toFixed(2)}</td>`;
                tableBody.append(row);
            });
            qs('#udt-resource-count', this.el).textContent = `Loaded: ${resources.length}`;
        }
    }
    class FormsComponent extends ToolkitComponent {
        constructor(toolkit) { super(toolkit, 'forms-analyzer', 'Forms', '📝'); }
        buildContent() {
            const header = createElement('div', ['udt-panel-header']);
            header.innerHTML = `<h2 class="udt-panel-title">Forms Analyzer</h2>`;
            const body = createElement('div', ['udt-panel-body']);
            this.el.append(header, body);
        }
        update() {
            const body = qs('.udt-panel-body', this.el); clearElement(body);
            const forms = qsa('form');
            if (forms.length === 0) {
                body.textContent = 'No forms found on this page.';
                return;
            }
            forms.forEach((form, index) => {
                const formContainer = createElement('div', ['udt-settings-group']);
                const formTitle = createElement('h3', [], {}, `Form #${index + 1} (Action: ${form.action.substring(0, 50)}...)`);
                formContainer.append(formTitle);

                const table = createElement('table', ['udt-table']);
                table.innerHTML = `<thead><tr><th>Name</th><th>Type</th><th>Value</th></tr></thead>`;
                const tbody = createElement('tbody');
                const inputs = qsa('input, select, textarea', form);
                inputs.forEach(input => {
                    const row = createElement('tr');
                    row.innerHTML = `<td>${input.name || '(no name)'}</td><td>${input.type}</td><td title="${input.value}">${input.value.substring(0, 100)}</td>`;
                    tbody.appendChild(row);
                });
                table.appendChild(tbody);
                formContainer.appendChild(table);
                body.appendChild(formContainer);
            });
        }
    }
    class StorageComponent extends ToolkitComponent {
        constructor(toolkit) { super(toolkit, 'storage-inspector', 'Storage', '💾'); }
        buildContent() {
            const header = createElement('div', ['udt-panel-header']);
            header.innerHTML = `<h2 class="udt-panel-title">Storage Inspector</h2>`;
            const body = createElement('div', ['udt-panel-body']);
            this.el.append(header, body);
        }
        update() {
            const body = qs('.udt-panel-body', this.el); clearElement(body);
            this.renderStorageSection('Cookies', this.parseCookies(), body);
            this.renderStorageSection('Local Storage', Object.entries(localStorage), body);
            this.renderStorageSection('Session Storage', Object.entries(sessionStorage), body);
        }
        parseCookies() {
            return document.cookie.split(';').map(cookie => {
                const parts = cookie.trim().split('=');
                return [parts[0], parts.slice(1).join('=')];
            });
        }
        renderStorageSection(title, data, parent) {
            const container = createElement('div', ['udt-settings-group']);
            container.append(createElement('h3', [], {}, `${title} (${data.length})`));
            if (data.length === 0 || (data.length === 1 && !data[0][0])) {
                container.append(createElement('p', [], {style:'opacity:0.7'}, `No ${title.toLowerCase()} found.`));
                parent.append(container);
                return;
            }
            const table = createElement('table', ['udt-table']);
            table.innerHTML = `<thead><tr><th>Key</th><th>Value</th></tr></thead>`;
            const tbody = createElement('tbody');
            data.forEach(([key, value]) => {
                const row = createElement('tr');
                row.innerHTML = `<td title="${key}">${key.substring(0, 50)}</td><td title="${value}">${value.substring(0, 100)}</td>`;
                tbody.appendChild(row);
            });
            table.appendChild(tbody);
            container.appendChild(table);
            parent.appendChild(container);
        }
    }
    class AIComponent extends ToolkitComponent {
        constructor(toolkit) { super(toolkit, 'ai', 'AI', '🧠'); this.context = { data: '', userScript: '' }; }
        buildContent() {
            const header = createElement('div', ['udt-panel-header']);
            header.append(createElement('h2', ['udt-panel-title'], {}, 'Smart Prompt Aggregator'));
            const body = createElement('div', ['udt-panel-body']);
            const btnContainer = createElement('div', [], { style: 'display:flex; gap:10px; margin-top:10px;' });
            btnContainer.append(
                createElement('button', ['udt-btn', 'primary'], {id: 'ai-send-btn'}, 'Send to AI'),
                createElement('button', ['udt-btn', 'secondary'], {id: 'ai-copy-btn'}, 'Copy Full Prompt')
            );
            body.append(
                createElement('select', ['udt-select'], { id: 'ai-prompt-template', style: 'margin-bottom: 10px;' }),
                createElement('textarea', ['udt-textarea'], {id: 'ai-prompt-preview', rows: 8, placeholder: 'Click a 🧠 button or select a template to begin...'}),
                btnContainer,
                createElement('h5', [], {style: 'margin-top: 15px;'}, 'Upload Userscript for Context'),
                createElement('input', ['udt-input'], {type: 'file', id: 'ai-upload-script', accept: '.js,.user.js'}),
                createElement('span', [], {id: 'ai-upload-filename', style: 'margin-left: 10px; opacity: 0.7;'}),
                createElement('h5', [], {style: 'margin-top: 15px;'}, 'AI Response'),
                createElement('div', ['ai-response-box', 'udt-textarea'], {style: 'min-height: 100px;'}, 'AI response will appear here...')
            );
            this.el.append(header, body);
        }
        render() { super.render(); this.loadPromptTemplates(); return this.el; }
        loadPromptTemplates() {
            const templates = this.toolkit.settings.get('ai.promptTemplates');
            const select = qs('#ai-prompt-template', this.el);
            clearElement(select);
            for (const key in templates) { select.add(new Option(templates[key].name, key)); }
        }
        setPromptContext(data, templateKey) { this.context.data = data; qs('#ai-prompt-template', this.el).value = templateKey; this.compilePrompt(); this.toolkit.setActiveTab(this.id); }
        compilePrompt() {
            const templates = this.toolkit.settings.get('ai.promptTemplates');
            const selectedKey = qs('#ai-prompt-template', this.el).value;
            const template = templates[selectedKey].prompt;
            let fullPrompt = `${template}\n\n--- CONTEXT DATA ---\n${this.context.data}`;
            if (this.context.userScript) { fullPrompt += `\n\n--- FULL USERSCRIPT FOR ANALYSIS ---\n${this.context.userScript}`; }
            qs('#ai-prompt-preview', this.el).value = fullPrompt;
        }
        sendToAI() {
            const aiPrefs = this.toolkit.settings.get('ai');
            const prompt = qs('#ai-prompt-preview', this.el).value;
            if (!prompt) { this.toolkit.showToast('Prompt is empty.'); return; }
            if (aiPrefs.mode === 'newtab') {
                const chatUrl = { gemini: 'https://gemini.google.com/app', chatgpt: 'https://chat.openai.com/', claude: 'https://claude.ai/chats' }[aiPrefs.provider] || 'https://google.com/search?q=';
                GM_setClipboard(prompt); window.open(chatUrl, '_blank');
                this.toolkit.showToast('Prompt copied! Paste it into the new tab.');
            } else { this.toolkit.showToast('API mode is not yet implemented.'); }
        }
        bindEvents() {
            qs('#ai-prompt-template', this.el).addEventListener('change', () => this.compilePrompt());
            qs('#ai-send-btn', this.el).addEventListener('click', () => this.sendToAI());
            qs('#ai-copy-btn', this.el).addEventListener('click', () => { GM_setClipboard(qs('#ai-prompt-preview', this.el).value); this.toolkit.showToast('Full prompt copied!'); });
            qs('#ai-upload-script', this.el).addEventListener('change', e => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (evt) => { this.context.userScript = evt.target.result; qs('#ai-upload-filename', this.el).textContent = file.name; this.compilePrompt(); };
                    reader.readAsText(file);
                }
            });
        }
    }
    class InspectorComponent extends ToolkitComponent {
        constructor(toolkit) { super(toolkit, 'inspector', 'Inspector', 'DOM'); this.selectedElement = null; }
        buildContent() {
            const header = createElement('div', ['udt-panel-header']);
            header.innerHTML = `<h2 class="udt-panel-title">${this.name}</h2> <button class="udt-btn primary picker-btn" data-default-text="Pick Element">Pick Element</button>`;
            const body = createElement('div', ['udt-panel-body']);
            body.innerHTML = `
                <div id="inspector-breadcrumbs"></div>
                <div id="inspector-children-list" style="margin-top: 10px;"></div>
                <div id="inspector-results" style="margin-top: 10px;"></div>
            `;
            this.el.append(header, body);
        }
        bindEvents() {
            qs('.picker-btn', this.el).addEventListener('click', () => {
                if (this.toolkit.isPickerActive) { this.toolkit.stopPicker(); }
                else { if (this.selectedElement) this.selectedElement.classList.remove('element-selected-permanent');
                    this.toolkit.startPicker(target => this.update(target), 'crosshair', true, this); }
            });
            const navClickListener = e => { const targetCrumb = e.target.closest('.dom-navigator-item'); if(targetCrumb && targetCrumb.elementRef) this.update(targetCrumb.elementRef); };
            qs('#inspector-breadcrumbs', this.el).addEventListener('click', navClickListener);
            qs('#inspector-children-list', this.el).addEventListener('click', navClickListener);
        }
        update(target) {
            if (this.selectedElement) this.selectedElement.classList.remove('element-selected-permanent');
            this.selectedElement = target; this.selectedElement.classList.add('element-selected-permanent');
            this.renderBreadcrumbs(); this.renderChildrenList(); this.renderResults();
            const stripperComp = this.toolkit.components['html-stripper'];
            if(stripperComp && stripperComp.el) { const rawInput = qs('#stripper-raw-html', stripperComp.el); if (rawInput) { rawInput.value = this.selectedElement.outerHTML; rawInput.dispatchEvent(new Event('input', { bubbles: true })); } }
        }
        createNavElement(node) {
            let desc = node.tagName.toLowerCase();
            if (node.id) desc += `#${node.id.split(' ')[0]}`;
            if (node.className && typeof node.className === 'string') { const cls = node.className.trim().split(' ')[0]; if(cls) desc += `.${cls}`; }
            const crumb = createElement('div', ['udt-input'], {style: 'cursor:pointer; margin-bottom:5px;'});
            crumb.textContent = desc; crumb.elementRef = node; crumb.classList.add('dom-navigator-item');
            return crumb;
        }
        renderBreadcrumbs() {
            const container = qs('#inspector-breadcrumbs', this.el); clearElement(container);
            container.append(createElement('h4', [], {}, 'Parents'));
            let path = []; let el = this.selectedElement;
            while (el && el.tagName !== 'BODY') { path.unshift(el); el = el.parentElement; }
            path.forEach(node => { const crumb = this.createNavElement(node); if (node === this.selectedElement) crumb.style.borderColor = 'var(--accent-primary)'; container.append(crumb); });
        }
        renderChildrenList() {
            const container = qs('#inspector-children-list', this.el); clearElement(container);
            if (this.selectedElement && this.selectedElement.children.length > 0) {
                container.append(createElement('h4', [], {}, 'Children'));
                Array.from(this.selectedElement.children).forEach(node => container.append(this.createNavElement(node)));
            }
        }
        renderResults() {
            const container = qs('#inspector-results', this.el); clearElement(container);
            container.append(this.createInputGroup('CSS Path:', 'css-path-result', getCssPath(this.selectedElement)));
            const outerHTMLTextarea = this.createInputGroup('OuterHTML:', 'outerhtml-result', this.selectedElement.outerHTML);
            qs('input', outerHTMLTextarea).replaceWith(createElement('textarea', ['udt-textarea'], {id: 'outerhtml-result', readonly:true, rows: 6, value:this.selectedElement.outerHTML}));
            container.append(outerHTMLTextarea);
        }
    }
    class HtmlStripperComponent extends ToolkitComponent {
        constructor(toolkit) { super(toolkit, 'html-stripper', 'Stripper', '✂️'); this.ATTRIBUTE_WHITELIST = [ 'id', 'class', 'role', 'href', 'src', 'alt', 'title', 'aria-label', 'aria-labelledby', 'aria-describedby', 'tabindex', 'target', 'rel', 'd' ]; }
        buildContent() {
            const header = createElement('div', ['udt-panel-header']); header.append(createElement('h2', ['udt-panel-title'], {}, this.name));
            const body = createElement('div', ['udt-panel-body', 'stripper-container']);
            const ioGrid = createElement('div', [], {style:'display:grid; grid-template-columns: 1fr 1fr; gap:15px; height:100%;'});
            const inputCol = createElement('div', [], {style: 'display:flex; flex-direction:column;'});
            inputCol.append( createElement('h4', [], { for: 'stripper-raw-html' }, 'Raw HTML'), createElement('textarea', ['udt-textarea'], { id: 'stripper-raw-html', placeholder: 'Paste outerHTML here...', style:'flex-grow:1;' }) );
            const outputCol = createElement('div', [], {style: 'display:flex; flex-direction:column; position: relative;'});
            const copyBtn = createElement('button', ['udt-btn', 'secondary', 'udt-copy-btn'], {title: 'Copy', style: 'position: absolute; top: 0; right: 0;'}); copyBtn.innerHTML = ICONS.copy;
            outputCol.append( createElement('h4', [], { for: 'stripper-clean-html' }, 'Condensed HTML'), copyBtn, createElement('textarea', ['udt-textarea'], { id: 'stripper-clean-html', readonly: true, placeholder: 'Clean HTML appears here...', style:'flex-grow:1; margin-top: 8px;' }) );
            ioGrid.append(inputCol, outputCol); body.append(ioGrid); this.el.append(header, body);
        }
        bindEvents() {
            qs('#stripper-raw-html', this.el).addEventListener('input', () => this.stripAndDisplay());
            qs('.udt-copy-btn', this.el).addEventListener('click', () => {
                const output = qs('#stripper-clean-html', this.el);
                if (output.value) { GM_setClipboard(output.value); this.toolkit.showToast('Condensed HTML Copied!'); }
            });
        }
        stripAndDisplay() {
            const rawHtmlInput = qs('#stripper-raw-html', this.el); const strippedHtmlOutput = qs('#stripper-clean-html', this.el);
            if (!rawHtmlInput.value) { strippedHtmlOutput.value = "Paste HTML to begin."; return; }
            try {
                const tempDiv = document.createElement('div'); tempDiv.innerHTML = rawHtmlInput.value;
                this._cleanElement(tempDiv.firstElementChild); strippedHtmlOutput.value = this._condenseHtml(tempDiv.innerHTML);
            } catch (error) { strippedHtmlOutput.value = `Error: ${error.message}`; }
        }
        _cleanElement(element) {
            if (!element) return;
            Array.from(element.attributes).forEach(attr => { if (!this.ATTRIBUTE_WHITELIST.includes(attr.name.toLowerCase())) { element.removeAttribute(attr.name); } });
            Array.from(element.children).forEach(child => this._cleanElement(child));
        }
        _condenseHtml(htmlString) { return htmlString.replace(/>\s+</g, '><').trim(); }
    }
    class uBlockComponent extends ToolkitComponent {
        constructor(toolkit) { super(toolkit, 'ublock', 'uBlock', '🛡️'); this.focusedElement = null; }
        buildContent() {
             const header = createElement('div', ['udt-panel-header']);
             header.innerHTML = `<h2 class="udt-panel-title">uBlock Filter Generator</h2> <button class="udt-btn primary picker-btn" data-default-text="Pick Element">Pick Element</button>`;
             const body = createElement('div', ['udt-panel-body']);
             body.innerHTML = ` <div id="ublock-navigator"></div> <hr style="margin: 15px 0; border-color: var(--border-primary);"> <div id="ublock-output"></div> `;
             this.el.append(header, body);
        }
        bindEvents() {
            qs('.picker-btn', this.el).addEventListener('click', () => { if (this.toolkit.isPickerActive) this.toolkit.stopPicker(); else this.toolkit.startPicker(target => this.update(target), 'crosshair', true, this); });
            qs('#ublock-navigator', this.el).addEventListener('click', e => { const targetItem = e.target.closest('.dom-navigator-item'); if (targetItem?.elementRef) this.update(targetItem.elementRef); });
        }
        update(target) {
            if (this.focusedElement) this.focusedElement.classList.remove('element-selected-permanent');
            this.focusedElement = target; this.focusedElement.classList.add('element-selected-permanent');
            this.renderNavigator(); this.generateAndShowFilters();
        }
        createNavItem(el, label) {
            if (!el || el === document.documentElement) return null;
            let desc = el.tagName.toLowerCase();
            if (el.id) desc += `#${el.id.split(' ')[0]}`;
            if (el.className && typeof el.className === 'string') { const cls = el.className.trim().split(' ')[0]; if(cls) desc += `.${cls}`; }
            const item = createElement('div', ['dom-navigator-item', 'udt-input'], {style: 'cursor:pointer; margin-bottom:5px;'});
            item.innerHTML = `<span style="color:var(--text-secondary); margin-right:8px;">${label}</span>${desc}`;
            item.elementRef = el;
            if (el === this.focusedElement) item.style.borderColor = 'var(--accent-primary)';
            return item;
        }
        renderNavigator() {
            const container = qs('#ublock-navigator', this.el); clearElement(container);
            container.append(this.createNavItem(this.focusedElement.parentElement, 'Parent'), this.createNavItem(this.focusedElement, 'Target'));
            if (this.focusedElement.children.length > 0) {
                const childrenLabel = createElement('h4', [], {style:'margin: 10px 0 5px;'}, 'Children:'); container.append(childrenLabel);
                Array.from(this.focusedElement.children).slice(0, 5).forEach(child => container.append(this.createNavItem(child, '↳')));
            }
        }
        generateAndShowFilters() {
            const output = qs('#ublock-output', this.el); clearElement(output);
            const filters = this.generateFilters(this.focusedElement);
            if (filters.length === 0) { output.textContent = 'Could not generate specific filters.'; return; }
            filters.forEach(f => output.append(this.createInputGroup(f.desc, `ublock-${f.desc.replace(/\s/g, '-')}`, f.rule)));
        }
        generateFilters(el) {
            const filters = new Map(); const domain = window.location.hostname; const tag = el.tagName.toLowerCase();
            const add = (desc, rule) => { if (rule && !filters.has(rule)) filters.set(rule, { desc, rule }); };
            const escapeForRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

            if (el.id) add('By ID (Strongest)', `${domain}##${tag}#${el.id}`);
            const cleanClasses = Array.from(el.classList).filter(c => !c.startsWith('element-') && !/^[a-zA-Z0-9_-]{20,}/.test(c));
            if (cleanClasses.length > 0) add('By Classes', `${domain}##${tag}.${cleanClasses.join('.')}`);
            ['data-testid', 'aria-label', 'name', 'title'].forEach(attr => { if (el.hasAttribute(attr)) add(`By [${attr}]`, `${domain}##${tag}[${attr}="${el.getAttribute(attr)}"]`); });

            const directText = Array.from(el.childNodes).find(n => n.nodeType === Node.TEXT_NODE && n.textContent.trim().length > 3)?.textContent.trim();
            if (directText) add('By Text Content', `${domain}##${tag}:has-text(/${escapeForRegex(directText)}/)`);

            const parent = el.parentElement;
            if (parent) {
                const parentTag = parent.tagName.toLowerCase();
                if (parent.id) add('By Parent ID', `${domain}##${parentTag}#${parent.id} > ${tag}`);
                const parentCleanClasses = Array.from(parent.classList).filter(c => !c.startsWith('element-') && !/^[a-zA-Z0-9_-]{20,}/.test(c));
                if (parentCleanClasses.length > 0) add('By Parent Class', `${domain}##${parentTag}.${parentCleanClasses.join('.')} > ${tag}`);

                const childIndex = Array.from(parent.children).indexOf(el) + 1;
                add('By Child Index', `${domain}##${parentTag} > ${tag}:nth-child(${childIndex})`);
            }

            return Array.from(filters.values());
        }
    }
    class CSSViewerComponent extends ToolkitComponent {
        constructor(toolkit) { super(toolkit, 'css-viewer', 'Styles', '🎨'); this.rawCss = ''; }
        buildContent() {
            const header = createElement('div', ['udt-panel-header']);
            header.innerHTML = `<h2 class="udt-panel-title">Page Stylesheet Viewer</h2>`;
            const body = createElement('div', ['udt-panel-body']);
            const btnContainer = createElement('div', [], { style: 'display:flex; flex-wrap: wrap; gap: 8px; margin-bottom: 10px;' });
            btnContainer.innerHTML = `
                <button class="udt-btn primary" id="fetch-styles-btn" style="flex:1;">Fetch All Styles</button>
                <button class="udt-btn secondary" id="copy-styles-btn" style="display: none;">Copy CSS</button>
                <button class="udt-btn secondary" id="export-styles-btn" style="display: none;">Download .css</button>
            `;
            const toggleContainer = createElement('div', ['udt-settings-row'], {style: 'font-size: 0.9em;'});
            toggleContainer.append( createElement('label', [], {}, 'Remove junk/empty styles'), this.toolkit.createToggle('clean-css-toggle', true) );
            const logBox = createElement('pre', ['udt-textarea'], { id: 'styles-log-box', 'data-placeholder': "Click 'Fetch' to load styles.", style: 'max-height: none; flex-grow: 1; min-height: 400px;' });
            body.append(btnContainer, toggleContainer, createElement('hr', [], { style: 'border-color: var(--border-primary); margin: 15px 0;' }), logBox);
            this.el.append(header, body);
        }
        bindEvents() {
            qs('#fetch-styles-btn', this.el).addEventListener('click', () => this.fetchAllStyles());
            qs('#export-styles-btn', this.el).addEventListener('click', () => this.exportCss());
            qs('#copy-styles-btn', this.el).addEventListener('click', () => { GM_setClipboard(qs('#styles-log-box', this.el).textContent); this.toolkit.showToast('CSS copied!'); });
            qs('#clean-css-toggle', this.el).addEventListener('change', () => this.displayCss());
        }
        exportCss() {
            const css = qs('#styles-log-box', this.el).textContent;
            if (!css) { this.toolkit.showToast('No CSS to export.'); return; }
            GM_download({ url: 'data:text/css;charset=utf-8,' + encodeURIComponent(css), name: `page-styles-${window.location.hostname}.css`});
        }
        async fetchAllStyles() {
            qs('#styles-log-box', this.el).textContent = 'Fetching...'; this.toolkit.showToast('Starting stylesheet fetch...');
            const promises = Array.from(document.styleSheets).map(sheet => {
                try {
                    if (sheet.href) { return new Promise(resolve => { GM_xmlhttpRequest({ method: 'GET', url: sheet.href, onload: r => resolve(r.responseText), onerror: () => resolve(`/* FAILED to fetch ${sheet.href} (CSP issue?) */`) }); });
                    } else if (sheet.cssRules) { return Promise.resolve(Array.from(sheet.cssRules).map(r => r.cssText).join('\n')); }
                    return Promise.resolve('');
                } catch (e) { return Promise.resolve(''); }
            });
            this.rawCss = (await Promise.all(promises)).join('\n');
            this.displayCss();
            qs('#copy-styles-btn', this.el).style.display = 'inline-block';
            qs('#export-styles-btn', this.el).style.display = 'inline-block';
            this.toolkit.showToast('Style fetching complete.');
        }
        cleanCss(css) { return css.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*[^{}]+\{\s*\}/gm, '').replace(/(\r\n|\n|\r){2,}/g, '$1').trim(); }
        displayCss() { const logBox = qs('#styles-log-box', this.el); if(logBox) logBox.textContent = qs('#clean-css-toggle', this.el).checked ? this.cleanCss(this.rawCss) : this.rawCss; }
    }
    class CSSToolsComponent extends ToolkitComponent {
        constructor(toolkit) { super(toolkit, 'css-tools', 'Tools', '🛠️'); }
        buildContent() {
            const header = createElement('div', ['udt-panel-header']);
            header.innerHTML = `<h2 class="udt-panel-title">CSS Tools</h2>`;
            const body = createElement('div', ['udt-panel-body']);
            body.innerHTML = `
                <h3>Advanced Color Picker</h3>
                <p>Use the browser's eyedropper to select any color on the screen.</p>
                <div id="color-picker-container" style="display:flex; align-items:center; gap: 20px;">
                    <div id="color-preview" style="width: 80px; height: 80px; border-radius: 50%; cursor: pointer; border: 2px solid var(--border-primary); background-color: var(--bg-tertiary); display:flex; align-items:center; justify-content:center; text-align:center; font-size:12px;">Click to Pick</div>
                    <div id="color-values" style="flex-grow:1;"></div>
                </div>`;
            const values = qs('#color-values', body);
            values.append( this.createInputGroup('HEX', 'color-hex', ''), this.createInputGroup('RGB', 'color-rgb', ''), this.createInputGroup('HSL', 'color-hsl', '') );
            this.el.append(header, body);
        }
        bindEvents() {
            qs('#color-preview', this.el).addEventListener('click', () => this.startColorPicker());
        }
        async startColorPicker() {
            if (!('EyeDropper' in window)) {
                this.toolkit.showToast('EyeDropper not supported. Picking element background instead.');
                this.toolkit.startPicker(target => this.updateColorDisplay(window.getComputedStyle(target).backgroundColor), 'copy', false, this);
                return;
            }
            try { const result = await new EyeDropper().open(); this.updateColorDisplay(result?.sRGBHex); }
            catch (e) { this.toolkit.showToast('Color picking cancelled.'); }
        }
        updateColorDisplay(color) {
            if (!color) return;
            const hexColor = color.startsWith('rgb') ? `#${[...color.matchAll(/\d+/g)].map(m=>parseInt(m[0]).toString(16).padStart(2,'0')).join('')}`.toUpperCase() : color.toUpperCase();
            qs('#color-preview', this.el).style.backgroundColor = hexColor; qs('#color-hex', this.el).value = hexColor;
            qs('#color-rgb', this.el).value = colorUtils.hexToRgb(hexColor); qs('#color-hsl', this.el).value = colorUtils.hexToHsl(hexColor);
        }
    }
    class DebuggerComponent extends ToolkitComponent {
        constructor(toolkit) { super(toolkit, 'debugger', 'Pause', '⏸️'); }
        buildContent() {
             const header = createElement('div', ['udt-panel-header']); header.innerHTML = `<h2 class="udt-panel-title">JS Debugger</h2>`;
             const body = createElement('div', ['udt-panel-body']);
             const container = createElement('div', ['udt-settings-row'], { style: 'margin-bottom: 15px;' });
             const select = createElement('select', ['udt-select'], { id: 'debugger-delay' });
             [['Instant', 0], ['3s', 3000], ['6s', 6000], ['9s', 9000]].forEach(([text, val]) => select.add(new Option(text, val)));
             container.append( createElement('label', [], { for: 'debugger-delay' }, 'Pause Delay:'), select, createElement('button', ['udt-btn', 'primary'], { id: 'trigger-debugger-btn' }, 'Trigger Pause') );
             body.append( container, createElement('hr'), createElement('h3', [], {style:'margin-top:15px;'}, 'Userscript Error Log'), createElement('div', ['udt-textarea'], {id: 'userscript-error-log'}, 'No userscript errors captured.') );
             this.el.append(header, body);
        }
        bindEvents() {
            qs('#trigger-debugger-btn', this.el).addEventListener('click', () => {
                const isOpen = window.outerWidth - window.innerWidth > 160 || window.outerHeight - window.innerHeight > 160;
                if (!isOpen) { alert('DevTools must be open (F12) to use the debugger.'); return; }
                const delay = parseInt(qs('#debugger-delay', this.el).value, 10);
                if (delay === 0) { this.toolkit.showToast('Pausing now...'); debugger; return; }
                let remaining = delay / 1000;
                const countdown = setInterval(() => { this.toolkit.showToast(`Pausing in ${remaining--}s...`, 900); if (remaining < 0) { clearInterval(countdown); debugger; } }, 1000);
            });
            window.addEventListener('error', (e) => this.handleGlobalError(e));
        }
        handleGlobalError(error) {
            if (!error.filename || !(error.filename.includes('userscript.html') || error.filename.startsWith('blob:'))) return;
            const logBox = qs('#userscript-error-log', this.el); if (!logBox) return;
            if (logBox.textContent === 'No userscript errors captured.') clearElement(logBox);
            const msg = `[${new Date().toLocaleTimeString()}] ${error.message} (at ${error.filename.split('/').pop()}:${error.lineno})`;
            logBox.prepend(createElement('div', ['error-item'], {}, msg));
        }
    }
    class SettingsManager {
        constructor(toolkit) { this.toolkit = toolkit; this.prefs = {}; this.STORAGE_KEY = 'udt-prefs-v7.0'; }
        getDefaults() {
            const defaultOrder = this.toolkit.componentDefinitions.map(c => new c(this.toolkit).id);
            return {
                ui: { isDarkMode: true, positionSide: 'left', isPinned: false }, activeTab: 'inspector',
                components: Object.fromEntries(this.toolkit.componentDefinitions.map(c => [new c(this.toolkit).id, { enabled: true, showInToolbar: true }])),
                ai: { enabled: true, provider: 'gemini', mode: 'newtab', promptTemplates: {
                    errorFix: { name: 'Fix an Error', prompt: 'You are a professional userscript JavaScript developer specializing in debugging. Analyze the following captured error message and suggest a fix. If a full script is provided, reference it to provide a more accurate solution.' },
                    domExplain: { name: 'Explain an Element', prompt: 'You are a web developer expert. Describe the following HTML element, its purpose, and any notable attributes.' }
                }},
                'components.order': defaultOrder
            };
        }
        async load() {
            const defaults = this.getDefaults(); const loadedPrefs = await GM_getValue(this.STORAGE_KEY, defaults);
            this.prefs = loadedPrefs;
            for (const key in defaults) {
                if (typeof defaults[key] === 'object' && defaults[key] !== null && !Array.isArray(defaults[key])) { this.prefs[key] = { ...defaults[key], ...(this.prefs[key] || {}) };
                } else if (this.prefs[key] === undefined) { this.prefs[key] = defaults[key]; }
            }
            const componentIds = this.toolkit.componentDefinitions.map(c => new c(this.toolkit).id);
            if (!this.prefs['components.order'] || this.prefs['components.gorder']?.length !== componentIds.length) this.prefs['components.order'] = componentIds;
            Object.keys(this.prefs.components).forEach(id => { if(!componentIds.includes(id)) delete this.prefs.components[id]; });
            await this.save();
        }
        async save() { await GM_setValue(this.STORAGE_KEY, this.prefs); }
        get(key) { return key.split('.').reduce((o, i) => o?.[i], this.prefs); }
        set(key, value) {
            const keys = key.split('.'); let obj = this.prefs;
            for (let i = 0; i < keys.length - 1; i++) { obj = obj[keys[i]] = obj[keys[i]] || {}; }
            obj[keys[keys.length - 1]] = value;
            this.save();
        }
        getComponentState(id) { return this.prefs.components[id]; }
        setComponentState(id, state) { this.prefs.components[id] = state; this.save(); }
    }

    function getCssPath(el) {
        if (!(el instanceof Element)) return ''; let path = [];
        while (el && el.nodeType === Node.ELEMENT_NODE) {
            let selector = el.nodeName.toLowerCase();
            if (el.id) { selector += '#' + el.id.trim().split(' ')[0].replace(/(:|\.|\[|\]|,|=)/g, '\\$1'); path.unshift(selector); break;
            } else {
                let sib = el, nth = 1;
                while ((sib = sib.previousElementSibling)) { if (sib.nodeName.toLowerCase() == selector) nth++; }
                if (nth != 1) selector += `:nth-of-type(${nth})`;
            }
            path.unshift(selector); el = el.parentNode;
        }
        return path.join(" > ");
    }

    // --- INITIALIZATION ---
    new DevToolkit().init();

})();
