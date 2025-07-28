# Userscript Dev Toolkit

A professional, draggable, in-page GUI with a suite of essential, AI-powered tools for power users, extension authors, and userscript developers.

## Introduction

In the world of web development and customization, userscript authors often find themselves in a constant loop of inspecting elements, debugging scripts, and writing ad-hoc CSS, all while juggling browser developer tools that are not always tailored for the unique challenges of script injection. The **Userscript Dev Toolkit** was born out of this necessity.

This toolkit is a powerful, self-contained, in-page control panel that runs on any website. It consolidates the most common development tasks into a single, elegant, and highly configurable interface. Now supercharged with AI, the toolkit streamlines your workflow by integrating intelligent prompt generation, advanced element analysis, and robust filter creation. It's the co-pilot every serious userscript developer deserves.

## Features

The toolkit is organized into logical, re-orderable tabs, each providing a distinct set of functionalities.

-----

#### 1\. 🧠 AI Smart Prompt Aggregator

  * **What it does:** Integrates with AI providers (like Gemini, ChatGPT, Claude) to help debug code, explain elements, or generate new scripts. It can combine context from other tools (like the Inspector or Error Log) and even use a full userscript file you upload for more accurate analysis.
  * **How it improves the workflow:** It centralizes your development and AI-assisted tasks in one place. Instead of manually copying and pasting error messages or code snippets, you can send them directly to your AI of choice with pre-configured, context-rich prompts.
  * **Example Usage:**
    1.  An error appears in the Debugger's error log.
    2.  Click the "🧠" button next to the error.
    3.  The AI tab opens with the error pre-loaded into a "Fix an Error" prompt template.
    4.  Optionally, upload your userscript file for full context.
    5.  Click "Send to AI" to open your preferred AI chat with the complete prompt copied to your clipboard.

-----

#### 2\. 🔍 Inspector

  * **What it does:** Allows you to select any element on the page with a simple click. It displays an interactive breadcrumb trail of the element's parents, a list of its direct children, its CSS Path, and its `outerHTML`.
  * **How it improves the workflow:** It eliminates digging through the browser's "Elements" panel. The interactive DOM navigator lets you easily traverse up and down the element hierarchy, and the selected element's `outerHTML` is automatically sent to the HTML Stripper for cleaning.
  * **Example Usage:**
    1.  Click the "Pick Element" button.
    2.  Click on the desired element on the page.
    3.  The Inspector tab populates. You can now click on a parent in the breadcrumbs or a child in the list to inspect it instead.
    4.  Copy the stable CSS Path or review the `outerHTML`.

-----

#### 3\. ✂️ HTML Stripper

  * **What it does:** Takes raw HTML and cleans it by removing dynamic or unnecessary attributes (like `jsaction`, `data-ved`, etc.) based on a safe whitelist. This results in cleaner, more stable HTML for creating selectors.
  * **How it improves the workflow:** Dynamic attributes and framework-specific classes often make selectors brittle. This tool instantly strips that noise, helping you identify the core structure of an element for more reliable and maintainable script targeting.
  * **Example Usage:**
    1.  Inspect an element using the `Inspector` tool.
    2.  The element's `outerHTML` automatically appears in the "Raw HTML Input" field of the Stripper.
    3.  The "Cleaned HTML Output" field instantly shows a simplified version, which you can use to craft better selectors.

-----

#### 4\. 🛡️ uBlock Filter Generator

  * **What it does:** Automatically generates a list of robust, ready-to-use cosmetic filter rules for uBlock Origin based on a selected element and its relatives.

  * **How it improves the workflow:** It dramatically accelerates creating ad-blocker filters. Instead of manually crafting rules, it provides multiple strategic options (by ID, stable classes, text content, attributes, and even parent/child relationships) to ensure the element is blocked effectively.

  * **Example Usage:**

    1.  In the uBlock tab, click "Pick Element" and select an ad banner.
    2.  The toolkit instantly generates several filter rules.
    3.  You can click the parent or a child element within the tool to generate new filters based on them.
    4.  Click the copy icon next to the most suitable one and paste it into your uBlock Origin "My Filters" list.

    <!-- end list -->

    ```
    # Generated Filters for a div with id="promo-banner"
    example.com##div#promo-banner
    example.com##div.promo.advert
    example.com##div:has-text(/Limited Time Offer/)
    example.com##div:has(> svg[aria-label="Advert"])
    ```

-----

#### 5\. 🎨 CSS Viewer

  * **What it does:** Fetches and aggregates all CSS from every stylesheet (`<link>` and `<style>`) loaded on the current page. It includes an option to automatically clean the output by removing comments and empty rules.
  * **How it improves the workflow:** It provides a centralized view of the page's entire styling architecture. This is invaluable for understanding how a site is built, finding specific style rules to override, or grabbing a clean copy of a site's CSS.
  * **Example Usage:**
    1.  Click the "Fetch All Styles" button.
    2.  Toggle the "Remove junk/empty styles" switch to get a minified, readable version.
    3.  Click "Download .css" to save the entire stylesheet collection to a local file.

-----

#### 6\. 🛠️ CSS Tools

  * **What it does:** Features an advanced, high-precision color picker that utilizes the browser's native `EyeDropper` API. It also provides instant conversion to HEX, RGB, and HSL formats.
  * **How it improves the workflow:** It allows you to pick *any* color from anywhere on your screen, not just from within the webpage. The native browser interface provides a zoomed-in loupe for pixel-perfect accuracy, far surpassing traditional element-based color pickers.
  * **Example Usage:**
    1.  Click the color preview box.
    2.  The browser's eyedropper interface activates.
    3.  Use the loupe to select the exact color you need, even from a background image or a browser UI element.
    4.  The selected color's HEX, RGB, and HSL codes appear in the toolkit, ready to be copied.

-----

#### 7\. ⏸️ Pause Debugger

  * **What it does:** Triggers a `debugger;` statement with a configurable time delay. It also includes a passive error log that automatically captures and displays runtime errors from any userscript on the page.
  * **How it improves the workflow:** This is a game-changer for debugging dynamic UIs. You can trigger the pause, then use the delay to perform an action like hovering over a menu to reveal a dropdown. The script execution will then freeze, keeping the temporary element visible for inspection in the DevTools. The error log helps you catch and debug issues without needing the console open.
  * **Example Usage:**
    1.  Set the delay to "3 seconds".
    2.  Click "Trigger Pause".
    3.  Quickly move your mouse to hover over a menu that has a CSS-based `:hover` dropdown.
    4.  After 3 seconds, the browser will pause, and the dropdown will remain visible in the DevTools for inspection.

## Installation

### Prerequisites

You must have a userscript manager browser extension installed. Recommended options include:

  * [Tampermonkey](https://www.tampermonkey.net/) (for Chrome, Firefox, Edge, Safari)
  * [Violentmonkey](https://violentmonkey.github.io/) (for Chrome, Firefox, Edge)

### Step-by-step instructions

1.  **Click to Install:** Click the following link to install the script directly.
      * [**Install Userscript Dev Toolkit**](https://github.com/SysAdminDoc/Userscript-Dev-Toolkit/raw/refs/heads/main/Userscript%20Dev%20Toolkit.user.js)
2.  **Confirm Installation:** Your userscript manager will automatically detect the script and prompt you to confirm the installation.
3.  **Done\!** The script is now installed and will run on all websites.

## Usage

Once installed, a "🛠️" handle will appear on the side of every webpage.

  * **Activation:**
      * Hovering the handle expands the panel. Moving the mouse away collapses it.
      * Click the lock icon (🔓) to keep the panel open permanently.
      * Use the toggle command in your userscript manager's menu.
  * **Interface:**
      * **Positionable & Resizable:** Use the "↔️" button to switch the panel between the left and right sides of the screen. Drag the edge to resize it.
      * **Re-orderable Tabs:** Click and drag any tab icon to change its position in the toolbar.
      * **Settings:** Click the gear icon (⚙️) to configure the toolkit's features.

## Configuration

The toolkit is highly configurable via the **Settings (⚙️)** menu. All preferences are automatically saved.

  * **Functionality:**
      * **Sync with DevTools:** Automatically show the toolkit panel when you open the browser's F12 developer tools.
      * **Enable AI Features:** Turn the AI component on or off.
  * **Visible Tabs:** Don't need a specific tool? Hide any tab from the interface to declutter your workspace. Your choices are saved, so you only see the tools you use most.

### Core modules and their responsibilities

The script is built with a modular, class-based architecture for maintainability and extensibility.

  * `DevToolkit`: The main application class. It orchestrates the entire lifecycle, manages the UI, state, and communication between components.
  * `ToolkitComponent`: A base class that all functional tabs (Inspector, uBlock, etc.) extend from. It provides a standardized structure for rendering and event binding.
  * `SettingsManager`: A dedicated class for managing persistence. It handles loading and saving all user preferences to `GM_getValue` and `GM_setValue`.

## API / Function Reference

While most of the script is self-contained, its core helper functions are robust and can be referenced for understanding the script's internals.

| Function | Parameters | Return Value | Purpose |
| :--- | :--- | :--- | :--- |
| `qs(selector, parent)` | `selector` (String), `parent` (Element, optional) | `Element` | A shorthand for `document.querySelector`, scoped to a parent if provided. |
| `qsa(selector, parent)` | `selector` (String), `parent` (Element, optional) | `NodeList` | A shorthand for `document.querySelectorAll`, scoped to a parent if provided. |
| `createElement(...)` | `tag` (String), `classes` (Array), `attributes` (Object), `text` (String) | `Element` | A factory function for creating and configuring DOM elements. |
| `colorUtils.hexToRgb(hex)` | `hex` (String) | `String` | Converts a `#RRGGBB` hex color string to its `rgb(r, g, b)` equivalent. |
| `colorUtils.hexToHsl(hex)` | `hex` (String) | `String` | Converts a `#RRGGBB` hex color string to its `hsl(h, s, l)` equivalent. |
| `getCssPath(el)` | `el` (Element) | `String` | Generates a unique and stable CSS selector path for a given DOM element. |

## Contributing

Contributions are welcome and appreciated\!

### How to report issues

  * Please use the [**GitHub Issues**](https://github.com/SysAdminDoc/Userscript-Dev-Toolkit/issues) page to report bugs or request features.
  * When reporting a bug, include your browser version, userscript manager version, steps to reproduce the issue, and any relevant console errors.

### How to submit pull requests

1.  Fork the repository.
2.  Create a new feature branch (`git checkout -b feature/AmazingNewTool`).
3.  Make your changes, following the existing coding style.
4.  Commit your changes with a clear and descriptive message.
5.  Push to your forked repository and open a pull request.

## License

This project is licensed under the **MIT License**.

Copyright (c) 2025 Matthew Parker

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

## Disclosure

This userscript is an independent project. It is not affiliated with, endorsed by, or in any way officially connected with any of the websites it is used on, nor with the developers of any browser or userscript manager extension. Any trademarks mentioned are the property of their respective owners.
