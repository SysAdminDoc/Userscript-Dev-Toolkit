// ==UserScript==
// @name         Userscript Dev Toolkit
// @namespace    https://github.com/SysAdminDoc/Userscript-Dev-Toolkit
// @version      4.2.1
// @description  An advanced floating GUI with debugging, inspection, and development tools for userscript and extension authors.
// @author       SysAdminDoc & Gemini
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
// @updateURL    https://raw.githubusercontent.com/SysAdminDoc/Userscript-Dev-Toolkit/main/dist/Userscript-Dev-Toolkit.user.js
// @downloadURL  https://raw.githubusercontent.com/SysAdminDoc/Userscript-Dev-Toolkit/main/dist/Userscript-Dev-Toolkit.user.js
// ==/UserScript==

(function() {
    'use strict';

    // --- HELPER FUNCTIONS ---
    const qs = (selector, parent = document) => parent.querySelector(selector);
    const qsa = (selector, parent = document) => parent.querySelectorAll(selector);
    const clamp = (val, min, max) => Math.max(min, Math.min(val, max));
    const createElement = (tag, classes = [], attributes = {}, text = '') => {
        const el = document.createElement(tag);
        if (classes.length) el.classList.add(...classes.filter(Boolean));
        Object.entries(attributes).forEach(([key, value]) => el.setAttribute(key, value));
        if (text) el.innerHTML = text;
        el.setAttribute('data-devtoolkit', 'true');
        return el;
    };

    /**
     * Main application class that orchestrates the entire toolkit.
     */
    class DevToolkit {
        constructor() {
            this.id = 'userscript-dev-toolkit';
            this.isDragging = false;
            this.isResizing = false;
            this.dragOffset = {};
            this.resizeOffset = {};
            this.isInspectorActive = false;
            this.lastInspectedElement = null;
            this.lastHighlightedElement = null;
            this.devToolsCheckInterval = null;

            this.THEMES = {
                white: { name: 'White', vars: { '--bg': '#ffffff', '--bg-alt': '#f1f3f4', '--fg': '#202124', '--border': '#dadce0', '--accent': '#1a73e8', '--accent-fg': '#ffffff', '--shadow': 'rgba(0,0,0,0.2)' } },
                dark: { name: 'Dark', vars: { '--bg': '#202124', '--bg-alt': '#2d2e30', '--fg': '#e8eaed', '--border': '#5f6368', '--accent': '#8ab4f8', '--accent-fg': '#202124', '--shadow': 'rgba(0,0,0,0.5)' } },
                darker: { name: 'Darker', vars: { '--bg': '#121212', '--bg-alt': '#1e1e1e', '--fg': '#e0e0e0', '--border': '#3c3c3c', '--accent': '#bb86fc', '--accent-fg': '#000000', '--shadow': 'rgba(0,0,0,0.6)' } },
                glass: { name: 'Glass', vars: { '--bg': 'rgba(30, 30, 30, 0.75)', '--bg-alt': 'rgba(50, 50, 50, 0.75)', '--fg': '#f5f5f5', '--border': 'rgba(255, 255, 255, 0.2)', '--accent': '#64b5f6', '--accent-fg': '#000000', '--shadow': 'rgba(0,0,0,0.4)' } }
            };

            this.settings = new SettingsManager(this);
            this.components = {};

            this.componentDefinitions = [
                InspectorComponent,
                uBlockComponent,
                ConsoleComponent,
                CSSViewerComponent,
                FunctionGuideComponent,
            ];
        }

        async init() {
            if (window.top !== window.self) return;

            this.registerComponents();
            await this.settings.load();
            this.injectCoreMarkup();
            this.injectStyles();
            this.renderTabs();
            this.renderActiveContent();
            this.applyPreferences();
            this.bindCoreEvents();
            this.log(`Dev Toolkit v4.2.1 Initialized.`);
        }

        // --- CORE UI & RENDERING ---
        injectCoreMarkup() {
            const panel = createElement('div', [], { id: this.id });
            const titleHTML = `
                Dev Toolkit v4.2.1
                <span class="subtitle">Specialized for userscript and extension developers</span>
            `;
            panel.innerHTML = `
                <div id="${this.id}-header" data-devtoolkit>
                    <span id="${this.id}-title">${titleHTML}</span>
                    <div id="${this.id}-header-buttons">
                        <button id="${this.id}-collapse-left-btn" class="header-icon-btn" title="Collapse Left">⬅️</button>
                        <button id="${this.id}-collapse-right-btn" class="header-icon-btn" title="Collapse Right">➡️</button>
                        <button id="${this.id}-shrink-btn" class="header-icon-btn" title="Shrink Panel">-</button>
                        <button id="${this.id}-grow-btn" class="header-icon-btn" title="Grow Panel">+</button>
                        <button id="${this.id}-settings-btn" class="header-icon-btn" title="Settings">⚙️</button>
                        <button id="${this.id}-hide-btn" class="header-icon-btn" title="Hide Panel">❌</button>
                    </div>
                </div>
                <div id="${this.id}-tabs-container" data-devtoolkit><div id="${this.id}-tabs"></div></div>
                <div id="${this.id}-content" data-devtoolkit></div>
                <div id="${this.id}-resize-handle" data-devtoolkit></div>
                <div id="${this.id}-settings-menu" class="settings-menu" data-devtoolkit></div>
            `;
            document.body.appendChild(panel);

            const leftLip = createElement('div', ['panel-lip', 'left'], { id: `${this.id}-lip-left`, title: 'Show Dev Toolkit' }, '🛠️');
            const rightLip = createElement('div', ['panel-lip', 'right'], { id: `${this.id}-lip-right`, title: 'Show Dev Toolkit' }, '🛠️');
            document.body.append(leftLip, rightLip);
        }

        injectStyles() {
            GM_addStyle(`
                :root { --bg: #202124; --bg-alt: #2d2e30; --fg: #e8eaed; --border: #5f6368; --accent: #8ab4f8; --accent-fg: #202124; --shadow: rgba(0,0,0,0.5); }
                #${this.id} {
                    position: fixed; z-index: 9999999; display: none; flex-direction: column;
                    background-color: var(--bg); color: var(--fg); border: 1px solid var(--border);
                    border-radius: 8px; box-shadow: 0 5px 15px var(--shadow);
                    min-width: 450px; min-height: 300px; resize: none; overflow: hidden;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                    font-size: 14px; transition: opacity 0.2s, transform 0.2s, width 0.2s, height 0.2s;
                }
                #${this.id}.glass { backdrop-filter: blur(12px) saturate(150%); -webkit-backdrop-filter: blur(12px) saturate(150%); }
                #${this.id}-header { padding: 8px 12px; background-color: var(--bg-alt); cursor: move; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; flex-shrink: 0; }
                #${this.id}-title .subtitle { display: block; font-size: 0.8em; font-weight: normal; opacity: 0.7; }
                #${this.id}-header-buttons { display: flex; align-items: center; gap: 5px; }
                .header-icon-btn { cursor: pointer; background: none; border: none; color: var(--fg); font-size: 18px; opacity: 0.7; padding: 4px; border-radius: 4px; line-height: 1; display: flex; align-items: center; justify-content: center; }
                .header-icon-btn:hover { opacity: 1; background-color: var(--border); }
                #${this.id}-grow-btn, #${this.id}-shrink-btn { font-weight: bold; font-size: 22px; }

                #${this.id}-tabs-container { overflow: hidden; flex-shrink: 0; background-color: var(--bg); border-bottom: 1px solid var(--border); position: relative; }
                #${this.id}-tabs-container::after { content: ''; position: absolute; right: 0; top: 0; bottom: 0; width: 20px; background: linear-gradient(to right, transparent, var(--bg)); pointer-events: none; }
                #${this.id}-tabs { display: flex; overflow-x: auto; scrollbar-width: thin; scrollbar-color: var(--accent) var(--bg-alt); }
                #${this.id}-tabs::-webkit-scrollbar { height: 4px; }
                #${this.id}-tabs::-webkit-scrollbar-thumb { background: var(--accent); border-radius: 2px; }
                .tab-btn { flex-shrink: 0; padding: 10px 15px; background: var(--bg); color: var(--fg); border: none; border-right: 1px solid var(--border); cursor: pointer; opacity: 0.7; transition: background-color 0.2s, opacity 0.2s; }
                .tab-btn.active { background: var(--accent); color: var(--accent-fg); opacity: 1; font-weight: bold; }

                #${this.id}-content { padding: 15px; overflow-y: auto; flex-grow: 1; }
                .tab-content { display: none; }
                .tab-content.active { display: block; animation: fadeIn 0.3s; }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

                .panel-lip { position: fixed; top: 20%; z-index: 9999998; background-color: var(--accent); color: var(--accent-fg); padding: 10px 4px; border-radius: 0 8px 8px 0; cursor: pointer; font-size: 20px; box-shadow: 2px 0 8px var(--shadow); display: none; height: 60%; align-items: center; justify-content: center; writing-mode: vertical-rl; }
                .panel-lip.left { left: 0; border-radius: 0 8px 8px 0; }
                .panel-lip.right { right: 0; border-radius: 8px 0 0 8px; }

                #${this.id}-resize-handle { position: absolute; bottom: 0; right: 0; width: 15px; height: 15px; cursor: se-resize; }
                .element-highlight { outline: 2px solid #ff00ff !important; box-shadow: 0 0 10px #ff00ff !important; background-color: rgba(255, 0, 255, 0.2) !important; }

                .settings-menu { display: none; position: absolute; top: 45px; right: 10px; background-color: var(--bg-alt); border: 1px solid var(--border); border-radius: 6px; box-shadow: 0 4px 12px var(--shadow); z-index: 10; padding: 12px; width: 280px; max-height: 80vh; overflow-y: auto; }
                .settings-menu h5 { margin: 0 0 10px 0; padding-bottom: 5px; border-bottom: 1px solid var(--border); }
                .setting-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
                .setting-row label { font-size: 0.9em; padding-right: 10px; }
                #settings-github-link { display: flex; align-items: center; justify-content: center; gap: 8px; text-decoration: none; color: var(--fg); opacity: 0.7; margin-top: 10px; padding-top: 10px; border-top: 1px solid var(--border); }
                #settings-github-link:hover { opacity: 1; }
                .toggle-switch { position: relative; display: inline-block; width: 40px; height: 22px; }
                .toggle-switch input { opacity: 0; width: 0; height: 0; }
                .toggle-slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: var(--border); transition: .4s; border-radius: 22px; }
                .toggle-slider:before { position: absolute; content: ""; height: 16px; width: 16px; left: 3px; bottom: 3px; background-color: var(--fg); transition: .4s; border-radius: 50%; }
                input:checked + .toggle-slider { background-color: var(--accent); }
                input:checked + .toggle-slider:before { transform: translateX(18px); }
                .input-group, .log-box { font-family: "SF Mono", "Fira Code", Consolas, monospace; }
                .input-group { display: flex; margin-bottom: 5px; }
                .input-group input, .input-group textarea { flex-grow: 1; background-color: var(--bg); color: var(--fg); border: 1px solid var(--border); padding: 8px; border-radius: 4px 0 0 4px; }
                .input-group .copy-btn { border: 1px solid var(--border); border-left: none; padding: 8px; border-radius: 0 4px 4px 0; background-color: var(--bg-alt); cursor: pointer; display:flex; align-items:center;}
            `);
        }

        renderTabs() {
            const tabsContainer = qs(`#${this.id}-tabs`);
            tabsContainer.innerHTML = '';
            this.getVisibleComponents().forEach(comp => {
                const tabBtn = createElement('button', ['tab-btn'], { 'data-tab': comp.id, title: comp.name }, comp.name);
                tabsContainer.appendChild(tabBtn);
            });
        }

        renderActiveContent() {
            const contentContainer = qs(`#${this.id}-content`);
            contentContainer.innerHTML = '';
            this.getEnabledComponents().forEach(comp => {
                const contentEl = comp.render();
                contentContainer.appendChild(contentEl);
            });
            this.setActiveTab(this.settings.get('activeTab'));
        }

        renderSettingsMenu() {
            const menu = qs(`#${this.id}-settings-menu`);
            const prefs = this.settings.get('ui');
            const components = this.settings.get('components');

            let themeOptions = Object.entries(this.THEMES).map(([key, theme]) =>
                `<option value="${key}" ${prefs.theme === key ? 'selected' : ''}>${theme.name}</option>`
            ).join('');

            let tabToggles = Object.values(this.components).map(comp => {
                const isVisible = components[comp.id]?.showInToolbar ?? true;
                return `<div class="setting-row"><label>${comp.name}</label><label class="toggle-switch"><input type="checkbox" data-component-id="${comp.id}" ${isVisible ? 'checked' : ''}><span class="toggle-slider"></span></label></div>`;
            }).join('');

            const githubIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"/></svg>`;

            menu.innerHTML = `
                <h5>Appearance</h5>
                <div class="setting-row"><label for="settings-theme">Theme</label><select id="settings-theme">${themeOptions}</select></div>
                <div class="setting-row"><label>Compact Mode</label><label class="toggle-switch"><input type="checkbox" id="settings-compact" ${prefs.compact ? 'checked' : ''}><span class="toggle-slider"></span></label></div>
                <hr>
                <h5>Functionality</h5>
                <div class="setting-row"><label>Enable Collapse Arrows</label><label class="toggle-switch"><input type="checkbox" id="settings-collapse-enabled" ${prefs.collapseFeatureEnabled ? 'checked' : ''}><span class="toggle-slider"></span></label></div>
                <div class="setting-row"><label>Sync with DevTools</label><label class="toggle-switch"><input type="checkbox" id="settings-devtools-sync" ${this.settings.get('debug.autoToggleWithDevTools') ? 'checked' : ''}><span class="toggle-slider"></span></label></div>
                <hr>
                <h5>Visible Tabs</h5>
                ${tabToggles}
                <hr>
                <a href="https://github.com/SysAdminDoc/Userscript-Dev-Toolkit" target="_blank" id="settings-github-link">${githubIcon} <span>Report Issues</span></a>
            `;
            this.bindSettingsMenuEvents();
        }

        registerComponents() { this.componentDefinitions.forEach(CompClass => { const instance = new CompClass(this); this.components[instance.id] = instance; }); }
        getEnabledComponents() { return Object.values(this.components).filter(c => this.settings.getComponentState(c.id)?.enabled); }
        getVisibleComponents() { return Object.values(this.components).filter(c => this.settings.getComponentState(c.id)?.showInToolbar); }

        applyPreferences() {
            const panel = qs(`#${this.id}`);
            const prefs = this.settings.get('ui');

            const panelWidth = parseInt(prefs.size.width, 10);
            const panelHeight = parseInt(prefs.size.height, 10);
            panel.style.width = `${panelWidth}px`;
            panel.style.height = `${panelHeight}px`;
            panel.style.left = `${clamp(parseInt(prefs.position.left, 10), 0, window.innerWidth - panelWidth)}px`;
            panel.style.top = `${clamp(parseInt(prefs.position.top, 10), 0, window.innerHeight - panelHeight)}px`;

            const theme = this.THEMES[prefs.theme] || this.THEMES.dark;
            Object.entries(theme.vars).forEach(([key, value]) => document.documentElement.style.setProperty(key, value));
            panel.classList.toggle('glass', prefs.theme === 'glass');
            panel.classList.toggle('compact', prefs.compact);

            this.updateHeaderButtonsVisibility();
            this.toggleVisibility(prefs.isVisible, false);
            this.toggleDevToolsSync(this.settings.get('debug.autoToggleWithDevTools'));
        }

        updateHeaderButtonsVisibility() {
            const showCollapse = this.settings.get('ui.collapseFeatureEnabled');
            qs(`#${this.id}-collapse-left-btn`).style.display = showCollapse ? 'flex' : 'none';
            qs(`#${this.id}-collapse-right-btn`).style.display = showCollapse ? 'flex' : 'none';
        }

        resizePanel(factor) {
            const panel = qs(`#${this.id}`);
            const newWidth = clamp(Math.round(panel.offsetWidth * factor), 450, window.innerWidth - 20);
            const newHeight = clamp(Math.round(panel.offsetHeight * factor), 300, window.innerHeight - 20);
            panel.style.width = `${newWidth}px`;
            panel.style.height = `${newHeight}px`;
            this.settings.set('ui.size', { width: panel.style.width, height: panel.style.height });
        }

        setActiveTab(tabId) { const activeComponent = this.components[tabId]; if (!activeComponent || !this.settings.getComponentState(tabId)?.showInToolbar) { tabId = this.getVisibleComponents()[0]?.id; } if (!tabId) return; qsa('.tab-btn', qs(`#${this.id}`)).forEach(btn => btn.classList.toggle('active', btn.dataset.tab === tabId)); qsa('.tab-content', qs(`#${this.id}`)).forEach(content => content.classList.toggle('active', content.dataset.tab === tabId)); this.settings.set('activeTab', tabId); }
        toggleVisibility(show, shouldSave = true) { const panel = qs(`#${this.id}`); if (shouldSave) { this.settings.set('ui.isVisible', show); } if (!show) { qs(`#${this.id}-settings-menu`).style.display = 'none'; } panel.style.display = show ? 'flex' : 'none'; qsa('.panel-lip').forEach(lip => lip.style.display = 'none'); }
        handleCollapse(side) { const panel = qs(`#${this.id}`); const leftLip = qs(`#${this.id}-lip-left`); const rightLip = qs(`#${this.id}-lip-right`); this.toggleVisibility(false); leftLip.style.display = 'none'; rightLip.style.display = 'none'; if (side === 'left') { leftLip.style.display = 'flex'; } else if (side === 'right') { rightLip.style.display = 'flex'; } }
        toggleDevToolsSync(enabled) { if (enabled && !this.devToolsCheckInterval) { this.devToolsCheckInterval = setInterval(() => { const isOpen = window.outerWidth - window.innerWidth > 160 || window.outerHeight - window.innerHeight > 160; const panel = qs(`#${this.id}`); const isVisible = panel.style.display === 'flex'; if (isOpen && !isVisible) { this.toggleVisibility(true, false); this.log('DevTools opened, showing panel.'); } else if (!isOpen && isVisible) { this.toggleVisibility(false, false); this.log('DevTools closed, hiding panel.'); } }, 1000); } else if (!enabled && this.devToolsCheckInterval) { clearInterval(this.devToolsCheckInterval); this.devToolsCheckInterval = null; } }

        bindCoreEvents() {
            qs(`#${this.id}-header`).addEventListener('mousedown', this.onDragStart.bind(this));
            qs(`#${this.id}-resize-handle`).addEventListener('mousedown', this.onResizeStart.bind(this));
            document.addEventListener('mousemove', this.onMouseMove.bind(this));
            document.addEventListener('mouseup', this.onMouseUp.bind(this));
            qs(`#${this.id}-hide-btn`).addEventListener('click', () => this.toggleVisibility(false));
            qs(`#${this.id}-settings-btn`).addEventListener('click', (e) => { e.stopPropagation(); const menu = qs(`#${this.id}-settings-menu`); const isVisible = menu.style.display === 'block'; if (!isVisible) this.renderSettingsMenu(); menu.style.display = isVisible ? 'none' : 'block'; });
            document.addEventListener('click', (e) => { if (!e.target.closest('.settings-menu') && !e.target.closest(`#${this.id}-settings-btn`)) { qs(`#${this.id}-settings-menu`).style.display = 'none'; } });
            qsa('.panel-lip').forEach(lip => lip.addEventListener('click', () => this.toggleVisibility(true)));
            qs(`#${this.id}-collapse-left-btn`).addEventListener('click', () => this.handleCollapse('left'));
            qs(`#${this.id}-collapse-right-btn`).addEventListener('click', () => this.handleCollapse('right'));
            qs(`#${this.id}-grow-btn`).addEventListener('click', () => this.resizePanel(1.1));
            qs(`#${this.id}-shrink-btn`).addEventListener('click', () => this.resizePanel(0.9));
            qs(`#${this.id}-tabs`).addEventListener('click', e => { const tabId = e.target.closest('.tab-btn')?.dataset.tab; if (tabId) this.setActiveTab(tabId); });
            qs(`#${this.id}`).addEventListener('click', e => { const copyBtn = e.target.closest('.copy-btn'); if (copyBtn) { const input = copyBtn.previousElementSibling; GM_setClipboard(input.value); this.log(`Copied to clipboard.`); const originalText = copyBtn.innerHTML; copyBtn.innerHTML = '✅'; setTimeout(() => (copyBtn.innerHTML = originalText), 1500); } });
            window.addEventListener('error', e => { if (e.filename && (e.filename.includes('.user.js') || e.filename.includes('userscript.html?name='))) { this.components.console?.logError(e); } });
            GM_registerMenuCommand('Toggle Dev Toolkit', () => this.toggleVisibility(qs(`#${this.id}`).style.display === 'none'));
        }

        bindSettingsMenuEvents() {
            qs('#settings-theme').addEventListener('change', e => { this.settings.set('ui.theme', e.target.value); this.applyPreferences(); });
            qs('#settings-compact').addEventListener('change', e => { this.settings.set('ui.compact', e.target.checked); this.applyPreferences(); });
            qs('#settings-collapse-enabled').addEventListener('change', e => { this.settings.set('ui.collapseFeatureEnabled', e.target.checked); this.updateHeaderButtonsVisibility(); });
            qs('#settings-devtools-sync').addEventListener('change', e => { this.settings.set('debug.autoToggleWithDevTools', e.target.checked); this.toggleDevToolsSync(e.target.checked); });
            qsa('.settings-menu [data-component-id]').forEach(toggle => {
                toggle.addEventListener('change', e => {
                    const id = e.target.dataset.componentId;
                    this.settings.setComponentState(id, { ...this.settings.getComponentState(id), showInToolbar: e.target.checked });
                    this.renderTabs();
                    this.renderActiveContent();
                });
            });
        }
        onDragStart(e) { if (e.target.closest('.header-icon-btn, input, select, textarea, .copy-btn') || e.target.id === `${this.id}-resize-handle`) return; this.isDragging = true; const panel = qs(`#${this.id}`); this.dragOffset = { x: e.clientX - panel.offsetLeft, y: e.clientY - panel.offsetTop }; panel.style.userSelect = 'none'; }
        onResizeStart(e) { this.isResizing = true; const panel = qs(`#${this.id}`); this.resizeOffset = { x: panel.offsetWidth - e.clientX, y: panel.offsetHeight - e.clientY }; panel.style.userSelect = 'none'; }
        onMouseMove(e) { const panel = qs(`#${this.id}`); if (this.isDragging) { panel.style.left = `${e.clientX - this.dragOffset.x}px`; panel.style.top = `${e.clientY - this.dragOffset.y}px`; } if (this.isResizing) { panel.style.width = `${clamp(e.clientX + this.resizeOffset.x, 450, window.innerWidth)}px`; panel.style.height = `${clamp(e.clientY + this.resizeOffset.y, 300, window.innerHeight)}px`; } }
        onMouseUp() { if (this.isDragging || this.isResizing) { const panel = qs(`#${this.id}`); panel.style.userSelect = ''; if (this.isDragging) { const finalWidth = panel.offsetWidth; const finalHeight = panel.offsetHeight; panel.style.left = `${clamp(panel.offsetLeft, 0, window.innerWidth - finalWidth)}px`; panel.style.top = `${clamp(panel.offsetTop, 0, window.innerHeight - finalHeight)}px`; this.settings.set('ui.position', { top: panel.style.top, left: panel.style.left }); } if (this.isResizing) { this.settings.set('ui.size', { width: panel.style.width, height: panel.style.height }); } } this.isDragging = false; this.isResizing = false; }
        log(message, type = 'info') { this.components.console?.log(message, type); }
    }

    class ToolkitComponent { constructor(toolkit, id, name) { this.toolkit = toolkit; this.id = id; this.name = name; this.el = null; } render() { if (!this.el) { this.el = createElement('div', ['tab-content'], { 'data-tab': this.id }); this.el.innerHTML = this.getHTML(); this.bindEvents(); } return this.el; } getHTML() { return `<h4>${this.name}</h4><p>Component not implemented.</p>`; } bindEvents() {} update() {} }

    class InspectorComponent extends ToolkitComponent {
        constructor(toolkit) { super(toolkit, 'inspector', '🔍 Inspector'); }
        getHTML() { return `<h4>Element Inspector</h4><p>Click "Start" to highlight elements on hover. Click an element on the page to capture its details.</p><button id="inspector-btn">Start Inspecting</button><div id="inspector-results" style="display:none; margin-top: 15px;"><div id="inspector-summary" style="margin-bottom:10px; padding: 8px; background: var(--bg-alt); border-radius: 4px;"></div><label>CSS Path:</label><div class="input-group"><input type="text" id="css-path-result" readonly><button class="copy-btn" title="Copy">📋</button></div><label>OuterHTML:</label><div class="input-group"><textarea id="outerhtml-result" readonly rows="4"></textarea><button class="copy-btn" title="Copy">📋</button></div></div>`; }
        bindEvents() { qs('#inspector-btn', this.el).addEventListener('click', () => this.toolkit.isInspectorActive ? this.stop() : this.start()); }
        start() { if (this.toolkit.isInspectorActive) return; this.toolkit.isInspectorActive = true; document.body.style.cursor = 'crosshair'; this.onHover = this.onHover.bind(this); this.onClick = this.onClick.bind(this); document.addEventListener('mousemove', this.onHover, true); document.addEventListener('click', this.onClick, true); qs('#inspector-btn', this.el).textContent = 'Cancel Inspecting'; this.toolkit.log('Inspector started.'); }
        stop() { if (!this.toolkit.isInspectorActive) return; this.toolkit.isInspectorActive = false; document.body.style.cursor = ''; document.removeEventListener('mousemove', this.onHover, true); document.removeEventListener('click', this.onClick, true); this.removeHighlight(); qs('#inspector-btn', this.el).textContent = 'Start Inspecting'; }
        onHover(e) { if (e.target.closest('[data-devtoolkit]')) { this.removeHighlight(); return; } if (e.target === this.toolkit.lastHighlightedElement) return; this.removeHighlight(); this.toolkit.lastHighlightedElement = e.target; this.toolkit.lastHighlightedElement.classList.add('element-highlight'); }
        removeHighlight() { if (this.toolkit.lastHighlightedElement) { this.toolkit.lastHighlightedElement.classList.remove('element-highlight'); this.toolkit.lastHighlightedElement = null; } }
        onClick(e) { if (e.target.closest('[data-devtoolkit]')) return; e.preventDefault(); e.stopPropagation(); this.update(e.target); e.target.scrollIntoView({ behavior: 'smooth', block: 'center' }); this.toolkit.log('Element captured.'); this.stop(); }
        update(target) { if (!this.el || !target) return; this.toolkit.lastInspectedElement = target; qs('#inspector-results', this.el).style.display = 'block'; let summary = `<strong>Tag:</strong> &lt;${target.tagName.toLowerCase()}&gt;`; if (target.id) summary += ` | <strong>ID:</strong> #${target.id}`; if (target.className) summary += ` | <strong>Class:</strong> .${target.className.trim().replace(/\s+/g, '.')}`; qs('#inspector-summary', this.el).innerHTML = summary; qs('#css-path-result', this.el).value = getCssPath(target); qs('#outerhtml-result', this.el).value = target.outerHTML; this.toolkit.components.ublock?.update(target); }
    }
    class uBlockComponent extends ToolkitComponent {
        constructor(toolkit) { super(toolkit, 'ublock', '🛡️ uBlock'); }
        getHTML() { return `<h4>uBlock Origin Filter Generator</h4><p>Generates cosmetic filters for the inspected element. Click to copy and paste into your "My Filters" tab in uBlock.</p><div id="ublock-output"></div>`; }
        update(target) { if (!this.el || !target) return; const output = qs('#ublock-output', this.el); output.innerHTML = this.generateFilters(target).map(f => `<div class="input-group"><input type="text" readonly value="${f.rule}"><button class="copy-btn" title="Copy Rule">📋</button></div>`).join(''); }
        generateFilters(el) { const filters = []; const domain = window.location.hostname; if (el.id) { filters.push({ rule: `${domain}##${el.tagName.toLowerCase()}#${el.id}` }); } const classes = Array.from(el.classList).filter(c => !c.startsWith('element-highlight')); if (classes.length > 0) { filters.push({ rule: `${domain}##${el.tagName.toLowerCase()}.${classes.join('.')}` }); } if (el.innerText?.trim()) { const text = el.innerText.trim().replace(/([\\"])/g, '\\$1').substring(0, 50); filters.push({ rule: `${domain}##${el.tagName.toLowerCase()}:has-text(/${text}/)`}); } return filters; }
    }
    class ConsoleComponent extends ToolkitComponent {
        constructor(toolkit) { super(toolkit, 'console', '📋 Console'); }
        getHTML() { return `<h4>Toolkit Log</h4><div id="console-log-box" class="log-box" data-placeholder="No logs yet."></div><h4>Userscript Errors</h4><div id="console-error-log" class="log-box" data-placeholder="No userscript errors detected."></div>`; }
        log(message) { const logBox = qs('#console-log-box', this.el); if (!logBox) return; logBox.innerHTML += `<div>[${new Date().toLocaleTimeString()}] ${message}</div>`; logBox.scrollTop = logBox.scrollHeight; }
        logError(errorEvent) { const logBox = qs('#console-error-log', this.el); if (!logBox) return; logBox.innerHTML += `<div style="color: #ff8a80;">[${new Date().toLocaleTimeString()}] ${errorEvent.message}<br>&nbsp;&nbsp;at ${errorEvent.filename}:${errorEvent.lineno}:${errorEvent.colno}</div>`; logBox.scrollTop = logBox.scrollHeight; }
    }
    class CSSViewerComponent extends ToolkitComponent {
        constructor(toolkit) { super(toolkit, 'css-viewer', '🎨 CSS'); }
        getHTML() { return `<h4>Page Stylesheet Viewer</h4><p>Fetch all loaded CSS from external and inline styles.</p><div style="display:flex; gap: 8px; margin-bottom: 10px;"><button id="fetch-styles-btn" style="flex:1;">Fetch All Styles</button><button id="copy-styles-btn" style="display: none;">Copy</button><button id="export-styles-btn" style="display: none;">Download</button></div><pre id="styles-log-box" class="log-box" data-placeholder="Click 'Fetch' to load styles." style="max-height: none; flex-grow: 1;"></pre>`; }
        bindEvents() { qs('#fetch-styles-btn', this.el).addEventListener('click', () => this.fetchAllStyles()); qs('#export-styles-btn', this.el).addEventListener('click', () => { const css = qs('#styles-log-box', this.el).textContent; GM_download(css, `page-styles-${window.location.hostname}.css`); }); qs('#copy-styles-btn', this.el).addEventListener('click', () => { const css = qs('#styles-log-box', this.el).textContent; GM_setClipboard(css); this.toolkit.log('All fetched CSS copied.'); }); }
        async fetchAllStyles() { const logBox = qs('#styles-log-box', this.el); logBox.textContent = 'Fetching...'; this.toolkit.log('Starting stylesheet fetch...'); let allCss = `/* Stylesheet dump from ${window.location.href} at ${new Date().toISOString()} */\n\n`; const styleSheets = Array.from(document.styleSheets); let promises = []; for (const sheet of styleSheets) { if (sheet.href) { promises.push(new Promise(resolve => { GM_xmlhttpRequest({ method: 'GET', url: sheet.href, onload: r => { allCss += `/* === From ${sheet.href} === */\n${r.responseText}\n\n`; resolve(); }, onerror: () => { allCss += `/* FAILED: ${sheet.href} */\n\n`; resolve(); } }); })); } else { try { allCss += `/* === Inline <style> === */\n${Array.from(sheet.cssRules).map(r => r.cssText).join('\n')}\n\n`; } catch (e) {} } } await Promise.all(promises); logBox.textContent = allCss; qs('#copy-styles-btn', this.el).style.display = 'inline-block'; qs('#export-styles-btn', this.el).style.display = 'inline-block'; this.toolkit.log('Style fetching complete.'); }
    }
    class FunctionGuideComponent extends ToolkitComponent {
        constructor(toolkit) { super(toolkit, 'guide', '❓ Guide'); }
        getHTML() { return `<h4>How to Use This Toolkit</h4> <p>A brief guide to the toolkit's features.</p> <details> <summary><strong>🔍 Inspector</strong></summary> <ul> <li><strong>What it does:</strong> Lets you click any element on a page to get its technical details.</li> <li><strong>Why it's useful:</strong> To get a reliable "selector" (address) for an element you want to modify, hide, or interact with.</li> </ul> </details> <details> <summary><strong>🛡️ uBlock</strong></summary> <ul> <li><strong>What it does:</strong> Generates filter rules for the inspected element.</li> <li><strong>Why it's useful:</strong> The fastest way to create cosmetic filters to block annoying elements, including by an element's text.</li> </ul> </details> <details> <summary><strong>📋 Console</strong></summary> <ul> <li><strong>What it does:</strong> Shows logs from this toolkit and errors specifically from userscripts, ignoring website noise.</li> <li><strong>Why it's useful:</strong> The first place to check if your script has errors.</li> </ul> </details> <details> <summary><strong>🎨 CSS Viewer</strong></summary> <ul> <li><strong>What it does:</strong> Scans the page and pulls all CSS code into one place.</li> <li><strong>Why it's useful:</strong> For understanding how a site is styled or finding specific rules.</li> </ul> </details> <details> <summary><strong>⚙️ Settings & Header Buttons</strong></summary> <ul> <li><strong>Collapse (⬅️➡️):</strong> Instantly tuck the panel to the side of the screen.</li> <li><strong>Resize (+-):</strong> Quickly grow or shrink the panel.</li> <li><strong>Settings (⚙️):</strong> Customize the theme, toggle features, and show/hide tabs.</li> </ul> </details>`; }
    }

    class SettingsManager {
        constructor(toolkit) { this.toolkit = toolkit; this.prefs = {}; this.STORAGE_KEY = 'dev-toolkit-prefs-v4.2'; }
        getDefaults() { return { ui: { position: { top: '15px', left: '15px' }, size: { width: '550px', height: '450px' }, theme: 'dark', compact: false, isVisible: true, collapseFeatureEnabled: true }, activeTab: 'inspector', components: Object.fromEntries(Object.values(this.toolkit.components).map(c => [c.id, { enabled: true, showInToolbar: true }])), debug: { autoToggleWithDevTools: false } }; }
        async load() { const defaults = this.getDefaults(); const loadedPrefs = await GM_getValue(this.STORAGE_KEY, defaults); this.prefs = { ...defaults, ...loadedPrefs, ui: { ...defaults.ui, ...(loadedPrefs.ui || {}) }, components: { ...defaults.components, ...(loadedPrefs.components || {}) }, debug: { ...defaults.debug, ...(loadedPrefs.debug || {}) } }; }
        async save() { await GM_setValue(this.STORAGE_KEY, this.prefs); }
        get(key) { return key.split('.').reduce((o, i) => o?.[i], this.prefs); }
        set(key, value) { key.split('.').reduce((o, i, idx, arr) => { if (idx === arr.length - 1) o[i] = value; else if (o[i] === undefined) o[i] = {}; return o[i]; }, this.prefs); this.save(); }
        getComponentState(id) { return this.prefs.components[id]; }
        setComponentState(id, state) { this.prefs.components[id] = state; this.save(); }
    }

    function getCssPath(el) { if (!(el instanceof Element)) return ''; let path = []; while (el && el.nodeType === Node.ELEMENT_NODE) { let selector = el.nodeName.toLowerCase(); if (el.id) { selector += '#' + el.id.trim().replace(/(:|\.|\[|\]|,)/g, '\\$1'); path.unshift(selector); break; } else { let sib = el, nth = 1; while ((sib = sib.previousElementSibling)) { if (sib.nodeName.toLowerCase() == selector) nth++; } if (nth != 1) selector += `:nth-of-type(${nth})`; } path.unshift(selector); el = el.parentNode; } return path.join(" > "); }

    new DevToolkit().init();

})();