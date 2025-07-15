// ==UserScript==
// @name         Universal CSS Editor Toolkit
// @namespace    https://github.com/SysAdminDoc/
// @version      2.0
// @description  Inspect, edit, inject, and export CSS on any site with a dev-style GUI
// @match        *://*/*
// @grant        GM_addStyle
// @grant        GM_download
// @require      https://cdn.jsdelivr.net/npm/monaco-editor@0.34.1/min/vs/loader.js
// ==/UserScript==

(function () {
  'use strict';

  // ─── Inject Base Styles ─────────────────────────────────────────────
  GM_addStyle(`
    #cssToolkit {
      position: fixed;
      top: 60px;
      left: 60px;
      width: 400px;
      height: 550px;
      background: #1e1e1e;
      color: white;
      z-index: 2147483647;
      font-family: sans-serif;
      border: 1px solid #444;
      box-shadow: 0 0 10px black;
      resize: both;
      overflow: hidden;
    }
    #cssToolkit header {
      background: #111;
      padding: 8px;
      font-weight: bold;
      cursor: move;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    #cssToolkit .tabs {
      display: flex;
      background: #2c2c2c;
    }
    #cssToolkit .tabs button {
      flex: 1;
      padding: 8px;
      background: #333;
      border: none;
      color: white;
      cursor: pointer;
    }
    #cssToolkit .tabs button.active {
      background: #555;
    }
    #cssToolkit .panel {
      display: none;
      padding: 10px;
      height: calc(100% - 95px);
      overflow: auto;
    }
    #cssToolkit .panel.active {
      display: block;
    }
    #cssToolkit input, #cssToolkit textarea {
      width: 100%;
      margin-bottom: 5px;
      background: #2b2b2b;
      border: 1px solid #555;
      color: white;
      padding: 5px;
    }
    #cssToolkit button.small {
      font-size: 12px;
      padding: 4px 6px;
      margin-top: 5px;
    }
    .highlight-hover {
      outline: 2px dashed red !important;
      cursor: pointer !important;
    }
  `);

  // ─── Build GUI Container ────────────────────────────────────────────
  const container = document.createElement('div');
  container.id = 'cssToolkit';
  container.innerHTML = `
    <header>
      <span>🧪 CSS Toolkit</span>
      <button id="closeToolkit" style="background:transparent;color:red;border:none;">✕</button>
    </header>
    <div class="tabs">
      <button class="tabBtn active" data-tab="elementTab">Element</button>
      <button class="tabBtn" data-tab="editorTab">Raw CSS</button>
      <button class="tabBtn" data-tab="settingsTab">Settings</button>
    </div>
    <div id="elementTab" class="panel active">
      <button id="startPick" class="small">Select Element</button>
      <input id="selectorInput" placeholder="Selected selector" readonly />
      <input id="propInput" placeholder="Property (e.g. color)" />
      <input id="valueInput" placeholder="Value (e.g. red)" />
      <button id="applyStyle" class="small">Apply Style</button>
      <button id="exportRules" class="small">Export Current Styles</button>
    </div>
    <div id="editorTab" class="panel">
      <div id="monaco" style="height:100%; width:100%;"></div>
      <button id="injectRaw" class="small">Inject CSS</button>
    </div>
    <div id="settingsTab" class="panel">
      <label><input type="checkbox" id="squarify"> Squarify (remove border-radius)</label><br>
      <label><input type="checkbox" id="darkMode" checked> Dark Mode</label><br>
    </div>
  `;
  document.body.appendChild(container);

  // ─── Drag Logic ─────────────────────────────────────────────────────
  let offsetX, offsetY, dragging = false;
  const header = container.querySelector('header');
  header.addEventListener('mousedown', e => {
    dragging = true;
    offsetX = e.clientX - container.offsetLeft;
    offsetY = e.clientY - container.offsetTop;
  });
  document.addEventListener('mouseup', () => dragging = false);
  document.addEventListener('mousemove', e => {
    if (dragging) {
      container.style.left = (e.clientX - offsetX) + 'px';
      container.style.top = (e.clientY - offsetY) + 'px';
    }
  });

  // ─── Tabs ───────────────────────────────────────────────────────────
  document.querySelectorAll('.tabBtn').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('.tabBtn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(btn.dataset.tab).classList.add('active');
    };
  });

  // ─── Element Picker ─────────────────────────────────────────────────
  let selectedSelector = '';
  document.getElementById('startPick').onclick = () => {
    alert('Click any element to select it');
    document.body.addEventListener('mouseover', hoverHighlight);
    document.body.addEventListener('click', pickElement, true);
  };
  function hoverHighlight(e) {
    e.target.classList.add('highlight-hover');
  }
  function pickElement(e) {
    e.preventDefault();
    e.stopPropagation();
    const el = e.target;
    el.classList.remove('highlight-hover');
    selectedSelector = getUniqueSelector(el);
    document.getElementById('selectorInput').value = selectedSelector;
    document.body.removeEventListener('mouseover', hoverHighlight);
    document.body.removeEventListener('click', pickElement, true);
  }
  function getUniqueSelector(el) {
    if (el.id) return `#${el.id}`;
    const path = [];
    while (el.parentElement) {
      let selector = el.tagName.toLowerCase();
      const siblings = Array.from(el.parentElement.children).filter(e => e.tagName === el.tagName);
      if (siblings.length > 1) {
        selector += `:nth-of-type(${siblings.indexOf(el) + 1})`;
      }
      path.unshift(selector);
      el = el.parentElement;
    }
    return path.join(' > ');
  }

  // ─── Apply Style ────────────────────────────────────────────────────
  const appliedStyles = [];
  document.getElementById('applyStyle').onclick = () => {
    const sel = selectedSelector;
    const prop = document.getElementById('propInput').value;
    const val = document.getElementById('valueInput').value;
    if (!sel || !prop || !val) return;
    const css = `${sel} { ${prop}: ${val} !important; }`;
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
    appliedStyles.push(css);
  };

  // ─── Export Styles ──────────────────────────────────────────────────
  document.getElementById('exportRules').onclick = () => {
    const blob = new Blob([appliedStyles.join('\n')], { type: 'text/css' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'custom-style.css';
    a.click();
    URL.revokeObjectURL(url);
  };

  // ─── Monaco Editor ──────────────────────────────────────────────────
  require.config({ paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.34.1/min/vs' } });
  require(['vs/editor/editor.main'], () => {
    const editor = monaco.editor.create(document.getElementById('monaco'), {
      value: '/* Type CSS here */',
      language: 'css',
      theme: 'vs-dark',
      fontSize: 14,
      automaticLayout: true,
    });
    window.monacoEditor = editor;
    document.getElementById('injectRaw').onclick = () => {
      const css = editor.getValue();
      const style = document.createElement('style');
      style.textContent = css;
      document.head.appendChild(style);
    };
  });

  // ─── Settings Toggles ───────────────────────────────────────────────
  document.getElementById('squarify').onchange = e => {
    if (e.target.checked) {
      const style = document.createElement('style');
      style.textContent = `* { border-radius: 0 !important; }`;
      document.head.appendChild(style);
    }
  };

  document.getElementById('darkMode').onchange = e => {
    container.style.background = e.target.checked ? '#1e1e1e' : '#fff';
    container.style.color = e.target.checked ? 'white' : 'black';
  };

  // ─── Close Button ───────────────────────────────────────────────────
  document.getElementById('closeToolkit').onclick = () => container.remove();
})();
