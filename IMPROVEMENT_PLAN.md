# Onnenpyörä — Improvement Plan

## Priority 1: Core Functionality Improvements

### 1.1 Dynamic sector count (allow 2–12 sectors)
- Add "+" and "−" buttons to add/remove sectors
- Update `wheel.js` to handle variable sector counts
- Update `storage.js` to persist the sector count
- Auto-generate input fields in JS instead of hardcoding 8 in HTML
- Minimum 2 sectors, maximum 12
- **Files:** `index.html`, `js/app.js`, `js/wheel.js`, `js/storage.js`, `css/style.css`

### 1.2 Skip empty sectors
- When spinning, only consider sectors that have non-empty text
- Gray out or visually dim empty sectors on the wheel
- Require at least 2 filled sectors before enabling the spin button
- **Files:** `js/wheel.js`, `js/app.js`

### 1.3 Spin history
- Show last 10 results below the wheel
- Store history in localStorage alongside sector data
- Add a "Clear history" button
- **Files:** `index.html`, `js/app.js`, `js/storage.js`, `css/style.css`

---

## Priority 2: UX & Accessibility

### 2.1 Keyboard support
- Space or Enter triggers spin when spin button is focused
- Tab navigation through all controls
- Focus ring styling for keyboard users
- **Files:** `js/app.js`, `css/style.css`

### 2.2 ARIA & screen reader support
- Add `role="img"` and `aria-label` to the canvas
- Use `aria-live="polite"` on the result div so screen readers announce winners
- Add `aria-disabled` to the spin button during animation
- Label all input fields properly
- **Files:** `index.html`, `js/app.js`

### 2.3 Sound / visual feedback
- Add a subtle tick sound as the wheel passes each sector boundary (optional, user-togglable)
- Add confetti or particle effect on win (CSS-only, lightweight)
- Add a sound toggle button
- **Files:** `js/wheel.js`, `js/app.js`, `index.html`, `css/style.css`

### 2.4 Text contrast on wheel
- Use dark text on light sectors and white text on dark sectors
- Calculate luminance from sector color to pick text color
- **Files:** `js/wheel.js`

---

## Priority 3: Visual & Technical Polish

### 3.1 HiDPI / Retina canvas support
- Scale canvas by `window.devicePixelRatio`
- Set CSS size to logical size, canvas attribute to physical size
- Keep rendering crisp on high-DPI displays
- **Files:** `js/wheel.js`

### 3.2 Configurable color themes
- Allow users to pick from 3–4 predefined color palettes
- Store selected theme in localStorage
- **Files:** `js/wheel.js`, `js/app.js`, `js/storage.js`, `index.html`, `css/style.css`

### 3.3 Share / export configuration
- "Copy link" button that encodes sectors into a URL hash (`#sectors=A,B,C`)
- On page load, parse the hash and pre-fill sectors
- Enables sharing wheel setups without a backend
- **Files:** `js/app.js`, `index.html`

---

## Priority 4: Code Quality & Robustness

### 4.1 Input validation hardening
- Validate localStorage data shape on load (check array, length, string types)
- Enforce `maxlength` in JS as well as HTML
- Sanitize any unexpected data gracefully
- **Files:** `js/storage.js`, `js/app.js`

### 4.2 Content Security Policy
- Add `<meta http-equiv="Content-Security-Policy">` with appropriate directives
- Restrict to `self` for scripts and styles
- **Files:** `index.html`

### 4.3 Add basic tests
- Unit tests for `FortuneWheel.getWinner()` (verify correct sector for known rotation angles)
- Unit tests for `Storage` module (save/load/clear round-trip)
- Use a lightweight test runner (e.g., a simple HTML test page or plain Node assertions)
- **Files:** new `tests/` directory

### 4.4 Refactor to ES modules
- Convert script tags to `<script type="module">`
- Use `export`/`import` instead of global variables
- Improves code organization and enables tree-shaking if a bundler is added later
- **Files:** `index.html`, `js/app.js`, `js/wheel.js`, `js/storage.js`

---

## Implementation Order (Recommended)

| Step | Item | Rationale |
|------|------|-----------|
| 1 | 3.1 HiDPI canvas | Quick win, improves visual quality on most modern devices |
| 2 | 2.4 Text contrast | Quick win, fixes readability issue |
| 3 | 1.2 Skip empty sectors | Small change, big usability gain |
| 4 | 2.1 Keyboard support | Low effort, important for accessibility |
| 5 | 2.2 ARIA support | Low effort, important for accessibility |
| 6 | 4.1 Input validation | Defensive hardening |
| 7 | 4.2 CSP header | One-line security improvement |
| 8 | 1.1 Dynamic sector count | Biggest feature, most code changes |
| 9 | 1.3 Spin history | Medium feature |
| 10 | 3.3 Share via URL | Medium feature |
| 11 | 3.2 Color themes | Nice to have |
| 12 | 2.3 Sound/confetti | Nice to have |
| 13 | 4.3 Tests | Should ideally be added alongside each change |
| 14 | 4.4 ES modules refactor | Can be done at any point, easier if done early |
