# RiftBrowser - Built-in Chromium Browser for RiftCode

## Overview

RiftBrowser is an integrated browser panel that provides full Chromium-based web browsing within RiftCode, positioned next to the RiftAI chat sidebar.

## Architecture

```
RiftCode
├── extensions/rift-ai/
│   ├── src/
│   │   ├── RiftBrowserView.ts          # Browser panel WebView
│   │   ├── SidebarHeader.ts           # Header with globe button
│   │   └── services/
│   │       └── RiftBrowserService.ts  # Browser management service
│   └── webview-ui/
│       └── riftclaw/                   # AI chat (separate view)
```

## Features

### ✅ Core Browser Features
- **Full Chromium Engine** - Uses Electron's embedded Chromium
- **Navigation Controls** - Back, Forward, Reload buttons
- **URL Bar** - Direct URL entry with auto-protocol
- **Search Support** - Enter keywords to search via Google
- **History** - Back/forward navigation support
- **External Links** - Open URLs in system browser

### ✅ Globe Icon Button
Located in the sidebar header, providing:
- Quick access to RiftBrowser
- Toggle between Chat and Browser views
- Consistent with VS Code's globe icon convention

### ✅ Integration with RiftAI
- Browser automation via Playwright (existing feature)
- AI agent can control browser
- Share URLs between Chat and Browser

## Files Created

| File | Description |
|------|-------------|
| `RiftBrowserView.ts` | Main WebView panel with iframe browser |
| `RiftBrowserService.ts` | Service managing browser lifecycle |
| `SidebarHeader.ts` | Header component with globe button |

## Commands Added

| Command | Icon | Description |
|---------|------|-------------|
| `riftcode.browser.open` | `$(globe)` | Open the browser panel |
| `riftcode.browser.navigate` | `$(globe)` | Navigate to specific URL |
| `riftcode.browser.close` | `$(globe)` | Close the browser |
| `riftcode.sidebar.openChat` | `$(chat)` | Return to RiftAI chat |

## How It Works

### 1. User Clicks Globe Icon
```
User clicks globe icon in sidebar
    ↓
Commands.executeCommand("riftcode.browser.open")
    ↓
RiftBrowserService.openBrowser()
    ↓
RiftBrowserView.create() → WebviewPanel
```

### 2. Browser Panel Structure
```
┌─────────────────────────────────────┐
│ [◀] [▶] [↻]  🔒 https://...  [↗]  │  ← Toolbar
├─────────────────────────────────────┤
│                                     │
│         <iframe>                    │  ← Web content
│         (Chromium)                  │
│                                     │
└─────────────────────────────────────┘
```

### 3. Communication Flow
```
WebView → postMessage → extension
    ↓
RiftBrowserView.onMessage()
    ↓
handle: navigate | goBack | reload | etc.
```

## Testing

### Open Browser
1. Open VS Code with RiftCode
2. Press `Ctrl+Shift+P` (Command Palette)
3. Type "RiftBrowser"
4. Select "Open RiftBrowser"

### Keyboard Shortcut (Optional)
Add to `keybindings.json`:
```json
{
  "key": "ctrl+shift+b",
  "command": "riftcode.browser.open",
  "when": "editorTextFocus"
}
```

## Technical Notes

### WebView Security
- Uses iframe with `sandbox` attribute
- Content Security Policy (CSP) configured
- Scripts are nonce-protected

### Browser Engine
- **Desktop**: Electron's Chromium (same as VS Code)
- **Web**: Host browser's WebView
- No separate Chrome process needed

### URL Handling
- Auto-adds `https://` if missing
- Converts search queries to Google search URL
- Handles cross-origin navigation gracefully

## Future Enhancements

1. **Tab Support** - Multiple browser tabs
2. **DevTools** - Chrome DevTools panel for debugging
3. **Bookmarks** - Save favorite URLs
4. **Browser Actions** - Extension buttons in toolbar
5. **AI Integration** - Agent can take screenshots, fill forms

---

*Generated: 2026-05-29*