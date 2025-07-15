# Userscript Dev Toolkit

An advanced, draggable, in-page GUI with a suite of essential tools for power users, extension authors, and userscript developers.



https://github.com/user-attachments/assets/23d075e5-39fd-4e50-ad27-eb23f98bd3d8



## Introduction

In the world of web development and customization, userscript authors often find themselves in a constant loop of inspecting elements, debugging scripts, and writing ad-hoc CSS, all while juggling browser developer tools that are not always tailored for the unique challenges of script injection. The **Userscript Dev Toolkit** was born out of this necessity. In short, I found myself doing things over and over and over again, realized this could be made into a simple tool.

This toolkit is a powerful, self-contained, in-page control panel that runs on any website. It consolidates the most common development tasks into a single, elegant, and highly configurable interface. Forget wrestling with the console; this toolkit provides specialized tools designed to streamline your workflow, from generating complex ad-blocker rules to capturing elusive hover-state styles with a delayed debugger. It's the co-pilot every serious userscript developer deserves.

## Features

The toolkit is organized into logical tabs, each providing a distinct set of functionalities.

---

#### 1. Inspector (🔍)
* **What it does:** Allows you to select any element on the page with a simple click. Upon selection, it provides the element's tag name, ID, classes, a precise CSS selector path, and its full `outerHTML`.
* **How it improves the interface:** It eliminates the need to dig through the browser's "Elements" panel to find a reliable selector for an element you wish to target. It provides clean, copy-paste-ready selectors instantly.
* **Example Usage:**
    1.  Click the "Pick Element" button.
    2.  Hover over the page; elements will be highlighted.
    3.  Click on the desired element.
    4.  The Inspector tab will populate with the element's details, ready for you to copy the CSS Path or OuterHTML.

    ```
    <!-- Sample Output -->
    Tag: <div> | ID: #main-content | Class: .container.flex
    CSS Path: body > div#app > main > div#main-content
    OuterHTML: <div id="main-content" class="container flex">...</div>
    ```

---

#### 2. uBlock Filter Generator (🛡️)
* **What it does:** Automatically generates a list of robust, ready-to-use cosmetic filter rules for [uBlock Origin](https://github.com/gorhill/uBlock) based on a selected element.
* **How it improves the interface:** It dramatically accelerates the process of creating ad-blocker filters. Instead of manually crafting rules, it provides multiple strategic options (by ID, class, text content, attributes) to ensure the element is blocked effectively and reliably.
* **Example Usage:**
    1.  In the uBlock tab, click "Pick Element".
    2.  Select an annoying ad banner on the page.
    3.  The toolkit will instantly generate several filter rules. Click the copy icon next to the most suitable one and paste it into your uBlock Origin "My Filters" list.

    ```
    # Generated Filters for a div with id="promo-banner"
    example.com##div#promo-banner
    example.com##div.promo.advert
    example.com##div:has-text(/Limited Time Offer/)
    ```

---

#### 3. CSS Viewer (🎨)
* **What it does:** Fetches and aggregates all CSS from every stylesheet (`<link>` and `<style>`) loaded on the current page. It includes an option to automatically clean the output by removing comments and empty rules.
* **How it improves the interface:** It provides a centralized view of the page's entire styling architecture. This is invaluable for understanding how a site is built, finding specific style rules to override, or grabbing a clean copy of a site's CSS for local experimentation.
* **Example Usage:**
    1.  Click the "Fetch All Styles" button.
    2.  Toggle the "Remove junk/empty styles" switch to get a minified, readable version.
    3.  Click "Download .css" to save the entire stylesheet collection to a local file.

---

#### 4. CSS Tools (🛠️)
* **What it does:** Features an advanced, high-precision color picker that utilizes the browser's native `EyeDropper` API.
* **How it improves the interface:** It allows you to pick *any* color from anywhere on your screen, not just from within the webpage. The native browser interface provides a zoomed-in loupe for pixel-perfect accuracy, far surpassing traditional element-based color pickers.
* **Example Usage:**
    1.  Click "Pick Screen Color".
    2.  The browser's eyedropper interface activates.
    3.  Use the loupe to select the exact color you need, even from a background image or a browser UI element.
    4.  The selected color's HEX code appears in the toolkit, ready to be copied.

---

#### 5. JavaScript Debugger (🐛)
* **What it does:** Triggers a `debugger;` statement with a configurable time delay (0, 3, 6, or 9 seconds).
* **How it improves the interface:** This is a game-changer for debugging dynamic UIs. You can trigger the pause, then use the delay to perform an action like hovering over a menu to reveal a dropdown. The script execution will then pause, freezing the temporary element in place so you can inspect its properties and styles in the DevTools.
* **Example Usage:**
    1.  Set the delay to "3 Seconds".
    2.  Click "Trigger Pause".
    3.  Quickly move your mouse to hover over a navigation menu that has a CSS-based `:hover` dropdown.
    4.  After 3 seconds, the script will pause, and the dropdown will remain visible in the DevTools for inspection.

## Installation

### Prerequisites
You must have a userscript manager browser extension installed. Recommended options include:
* [Tampermonkey](https://www.tampermonkey.net/) (for Chrome, Firefox, Edge, Safari)
* [Greasemonkey](https://www.greasespot.net/) (for Firefox)
* [Violentmonkey](https://violentmonkey.github.io/) (for Chrome, Firefox, Edge)

### Step-by-step instructions
1.  **Click to Install:** Click the following link to navigate to the script source:
    * [**Install Userscript Dev Toolkit**](https://raw.githubusercontent.com/SysAdminDoc/Userscript-Dev-Toolkit/main/dist/Userscript-Dev-Toolkit.user.js)
2.  **Confirm Installation:** Your userscript manager will automatically detect the script and prompt you to confirm the installation.
3.  **Done!** The script is now installed and will run on all websites.

## Usage

Once installed, the Userscript Dev Toolkit will automatically appear on every webpage.

* **Activation:** The toolkit panel is visible by default. You can hide and show it by clicking the `❌` button or by using the toggle command in your userscript manager's menu.
* **Interface:**
    * **Draggable & Resizable:** Click and drag the header to move the panel. Drag the bottom-right corner to resize it.
    * **Tabs:** Click any tab at the top to switch between tools.
    * **Header Buttons:** Use the header icons to collapse the panel to the side of the screen, resize it, access settings, or hide it completely.

## Configuration

The toolkit is highly configurable via the **Settings (⚙️)** menu. All preferences are automatically saved and restored on your next visit.

* **Appearance:**
    * **Theme:** Choose between White, Dark, Darker, and Glass (with acrylic blur effect).
    * **Compact Mode:** Reduces padding for a more condensed view.
* **Functionality:**
    * **Enable Collapse Arrows:** Show or hide the `⬅️` and `➡️` buttons in the header.
    * **Sync with DevTools:** Automatically show/hide the toolkit when you open/close the browser's F12 developer tools.
* **Visible Tabs:** Don't need a specific tool? Hide any tab from the main interface to declutter your workspace.

### Core modules and their responsibilities
The script is built with a modular, class-based architecture for maintainability and extensibility.
* `DevToolkit`: The main application class. It orchestrates the entire lifecycle, manages the UI, state, and communication between components.
* `ToolkitComponent`: A base class that all functional tabs (Inspector, uBlock, etc.) extend from. It provides a standardized structure for rendering and event binding.
* `SettingsManager`: A dedicated class for managing persistence. It handles loading and saving all user preferences to `GM_storage`, ensuring a consistent experience across sessions.

## API / Function Reference

While most of the script is self-contained, its core helper functions are robust and can be referenced for understanding the script's internals.

| Function | Parameters | Return Value | Purpose |
| :--- | :--- | :--- | :--- |
| `qs(selector, parent)` | `selector` (String), `parent` (Element, optional) | `Element` | A shorthand for `document.querySelector`, scoped to a parent if provided. |
| `qsa(selector, parent)` | `selector` (String), `parent` (Element, optional) | `NodeList` | A shorthand for `document.querySelectorAll`, scoped to a parent if provided. |
| `createElement(...)` | `tag` (String), `classes` (Array), `attributes` (Object), `text` (String) | `Element` | A factory function for creating and configuring DOM elements. |
| `rgbToHex(rgb)` | `rgb` (String) | `String` | Converts an `rgb(r, g, b)` color string to its `#RRGGBB` hex equivalent. |
| `getCssPath(el)` | `el` (Element) | `String` | Generates a unique and stable CSS selector path for a given DOM element. |

## Contributing

Contributions are welcome and appreciated! This project follows standard open-source practices.

### How to report issues
* Please use the [**GitHub Issues**](https://github.com/SysAdminDoc/Userscript-Dev-Toolkit/issues) page to report bugs or request features.
* Before opening a new issue, please search existing issues to avoid duplicates.
* When reporting a bug, include your browser version, userscript manager version, steps to reproduce the issue, and any relevant console errors.

### How to submit pull requests
1.  Fork the repository.
2.  Create a new feature branch (`git checkout -b feature/AmazingNewTool`).
3.  Make your changes.
4.  Commit your changes with a clear and descriptive commit message.
5.  Push to your forked repository.
6.  Open a pull request back to the `main` branch of the original repository.

### Coding style guidelines
* The project uses modern JavaScript (ES6+).
* Please follow the existing coding style (class-based components, clear variable names).
* Ensure your code is well-commented, especially for complex logic.

## License

This project is licensed under the **MIT License**.

Copyright (c) 2024 SysAdminDoc & Gemini

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

## Disclosure

This userscript is an independent project developed to enhance web development workflows. It is not affiliated with, endorsed by, or in any way officially connected with any of the websites it is used on, nor with the developers of any browser or userscript manager extension. Any trademarks or brand names mentioned are the property of their respective owners.
# Userscript Dev Toolkit

An advanced, draggable, in-page GUI with a suite of essential tools for power users, extension authors, and userscript developers.

![Toolkit Preview](https://i.imgur.com/sZ7gJvL.png)

## Introduction

In the world of web development and customization, userscript authors often find themselves in a constant loop of inspecting elements, debugging scripts, and writing ad-hoc CSS, all while juggling browser developer tools that are not always tailored for the unique challenges of script injection. The **Userscript Dev Toolkit** was born out of this necessity.

This toolkit is a powerful, self-contained, in-page control panel that runs on any website. It consolidates the most common development tasks into a single, elegant, and highly configurable interface. Forget wrestling with the console; this toolkit provides specialized tools designed to streamline your workflow, from generating complex ad-blocker rules to capturing elusive hover-state styles with a delayed debugger. It's the co-pilot every serious userscript developer deserves.

## Features

The toolkit is organized into logical tabs, each providing a distinct set of functionalities.

---

#### 1. Inspector (🔍)
* **What it does:** Allows you to select any element on the page with a simple click. Upon selection, it provides the element's tag name, ID, classes, a precise CSS selector path, and its full `outerHTML`.
* **How it improves the interface:** It eliminates the need to dig through the browser's "Elements" panel to find a reliable selector for an element you wish to target. It provides clean, copy-paste-ready selectors instantly.
* **Example Usage:**
    1.  Click the "Pick Element" button.
    2.  Hover over the page; elements will be highlighted.
    3.  Click on the desired element.
    4.  The Inspector tab will populate with the element's details, ready for you to copy the CSS Path or OuterHTML.

    ```
    <!-- Sample Output -->
    Tag: <div> | ID: #main-content | Class: .container.flex
    CSS Path: body > div#app > main > div#main-content
    OuterHTML: <div id="main-content" class="container flex">...</div>
    ```

---

#### 2. uBlock Filter Generator (🛡️)
* **What it does:** Automatically generates a list of robust, ready-to-use cosmetic filter rules for [uBlock Origin](https://github.com/gorhill/uBlock) based on a selected element.
* **How it improves the interface:** It dramatically accelerates the process of creating ad-blocker filters. Instead of manually crafting rules, it provides multiple strategic options (by ID, class, text content, attributes) to ensure the element is blocked effectively and reliably.
* **Example Usage:**
    1.  In the uBlock tab, click "Pick Element".
    2.  Select an annoying ad banner on the page.
    3.  The toolkit will instantly generate several filter rules. Click the copy icon next to the most suitable one and paste it into your uBlock Origin "My Filters" list.

    ```
    # Generated Filters for a div with id="promo-banner"
    example.com##div#promo-banner
    example.com##div.promo.advert
    example.com##div:has-text(/Limited Time Offer/)
    ```

---

#### 3. CSS Viewer (🎨)
* **What it does:** Fetches and aggregates all CSS from every stylesheet (`<link>` and `<style>`) loaded on the current page. It includes an option to automatically clean the output by removing comments and empty rules.
* **How it improves the interface:** It provides a centralized view of the page's entire styling architecture. This is invaluable for understanding how a site is built, finding specific style rules to override, or grabbing a clean copy of a site's CSS for local experimentation.
* **Example Usage:**
    1.  Click the "Fetch All Styles" button.
    2.  Toggle the "Remove junk/empty styles" switch to get a minified, readable version.
    3.  Click "Download .css" to save the entire stylesheet collection to a local file.

---

#### 4. CSS Tools (🛠️)
* **What it does:** Features an advanced, high-precision color picker that utilizes the browser's native `EyeDropper` API.
* **How it improves the interface:** It allows you to pick *any* color from anywhere on your screen, not just from within the webpage. The native browser interface provides a zoomed-in loupe for pixel-perfect accuracy, far surpassing traditional element-based color pickers.
* **Example Usage:**
    1.  Click "Pick Screen Color".
    2.  The browser's eyedropper interface activates.
    3.  Use the loupe to select the exact color you need, even from a background image or a browser UI element.
    4.  The selected color's HEX code appears in the toolkit, ready to be copied.

---

#### 5. JavaScript Debugger (🐛)
* **What it does:** Triggers a `debugger;` statement with a configurable time delay (0, 3, 6, or 9 seconds).
* **How it improves the interface:** This is a game-changer for debugging dynamic UIs. You can trigger the pause, then use the delay to perform an action like hovering over a menu to reveal a dropdown. The script execution will then pause, freezing the temporary element in place so you can inspect its properties and styles in the DevTools.
* **Example Usage:**
    1.  Set the delay to "3 Seconds".
    2.  Click "Trigger Pause".
    3.  Quickly move your mouse to hover over a navigation menu that has a CSS-based `:hover` dropdown.
    4.  After 3 seconds, the script will pause, and the dropdown will remain visible in the DevTools for inspection.

## Installation

### Prerequisites
You must have a userscript manager browser extension installed. Recommended options include:
* [Tampermonkey](https://www.tampermonkey.net/) (for Chrome, Firefox, Edge, Safari)
* [Greasemonkey](https://www.greasespot.net/) (for Firefox)
* [Violentmonkey](https://violentmonkey.github.io/) (for Chrome, Firefox, Edge)

### Step-by-step instructions
1.  **Click to Install:** Click the following link to navigate to the script source:
    * [**Install Userscript Dev Toolkit**](https://raw.githubusercontent.com/SysAdminDoc/Userscript-Dev-Toolkit/main/dist/Userscript-Dev-Toolkit.user.js)
2.  **Confirm Installation:** Your userscript manager will automatically detect the script and prompt you to confirm the installation.
3.  **Done!** The script is now installed and will run on all websites.

## Usage

Once installed, the Userscript Dev Toolkit will automatically appear on every webpage.

* **Activation:** The toolkit panel is visible by default. You can hide and show it by clicking the `❌` button or by using the toggle command in your userscript manager's menu.
* **Interface:**
    * **Draggable & Resizable:** Click and drag the header to move the panel. Drag the bottom-right corner to resize it.
    * **Tabs:** Click any tab at the top to switch between tools.
    * **Header Buttons:** Use the header icons to collapse the panel to the side of the screen, resize it, access settings, or hide it completely.

## Configuration

The toolkit is highly configurable via the **Settings (⚙️)** menu. All preferences are automatically saved and restored on your next visit.

* **Appearance:**
    * **Theme:** Choose between White, Dark, Darker, and Glass (with acrylic blur effect).
    * **Compact Mode:** Reduces padding for a more condensed view.
* **Functionality:**
    * **Enable Collapse Arrows:** Show or hide the `⬅️` and `➡️` buttons in the header.
    * **Sync with DevTools:** Automatically show/hide the toolkit when you open/close the browser's F12 developer tools.
* **Visible Tabs:** Don't need a specific tool? Hide any tab from the main interface to declutter your workspace.

### Core modules and their responsibilities
The script is built with a modular, class-based architecture for maintainability and extensibility.
* `DevToolkit`: The main application class. It orchestrates the entire lifecycle, manages the UI, state, and communication between components.
* `ToolkitComponent`: A base class that all functional tabs (Inspector, uBlock, etc.) extend from. It provides a standardized structure for rendering and event binding.
* `SettingsManager`: A dedicated class for managing persistence. It handles loading and saving all user preferences to `GM_storage`, ensuring a consistent experience across sessions.

## API / Function Reference

While most of the script is self-contained, its core helper functions are robust and can be referenced for understanding the script's internals.

| Function | Parameters | Return Value | Purpose |
| :--- | :--- | :--- | :--- |
| `qs(selector, parent)` | `selector` (String), `parent` (Element, optional) | `Element` | A shorthand for `document.querySelector`, scoped to a parent if provided. |
| `qsa(selector, parent)` | `selector` (String), `parent` (Element, optional) | `NodeList` | A shorthand for `document.querySelectorAll`, scoped to a parent if provided. |
| `createElement(...)` | `tag` (String), `classes` (Array), `attributes` (Object), `text` (String) | `Element` | A factory function for creating and configuring DOM elements. |
| `rgbToHex(rgb)` | `rgb` (String) | `String` | Converts an `rgb(r, g, b)` color string to its `#RRGGBB` hex equivalent. |
| `getCssPath(el)` | `el` (Element) | `String` | Generates a unique and stable CSS selector path for a given DOM element. |

## Contributing

Contributions are welcome and appreciated! This project follows standard open-source practices.

### How to report issues
* Please use the [**GitHub Issues**](https://github.com/SysAdminDoc/Userscript-Dev-Toolkit/issues) page to report bugs or request features.
* Before opening a new issue, please search existing issues to avoid duplicates.
* When reporting a bug, include your browser version, userscript manager version, steps to reproduce the issue, and any relevant console errors.

### How to submit pull requests
1.  Fork the repository.
2.  Create a new feature branch (`git checkout -b feature/AmazingNewTool`).
3.  Make your changes.
4.  Commit your changes with a clear and descriptive commit message.
5.  Push to your forked repository.
6.  Open a pull request back to the `main` branch of the original repository.

### Coding style guidelines
* The project uses modern JavaScript (ES6+).
* Please follow the existing coding style (class-based components, clear variable names).
* Ensure your code is well-commented, especially for complex logic.

## License

This project is licensed under the **MIT License**.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

## Disclosure

This userscript is an independent project developed to enhance web development workflows. It is not affiliated with, endorsed by, or in any way officially connected with any of the websites it is used on, nor with the developers of any browser or userscript manager extension. Any trademarks or brand names mentioned are the property of their respective owners.
