# Error Lens Extension for RiftCode

**Inline error highlighting with AI integration**

Error Lens enhances the coding experience by showing errors, warnings, and info directly inline with your code, and integrates seamlessly with RiftAI for AI-powered explanations and fixes.

## 🌟 Features

### 1. Inline Error Highlighting
- Errors shown inline with clear visual indicators
- Color-coded by severity (Error: red, Warning: yellow, Info: blue)
- Message preview at end of line
- Overview ruler markers for quick navigation

### 2. AI Integration with RiftAI
- **Explain with RiftAI** - Get AI-powered explanation of any error
- **Fix with RiftAI** - Ask AI to fix the error automatically
- **Search Online** - Search error online (opens in RiftBrowser)

### 3. Navigation
- Quick navigation between errors (Ctrl+Shift+Alt+E)
- Jump to any error with a single click
- Status bar showing error summary

### 4. Customization
- Toggle highlights on/off
- Show/hide warnings and info
- Configurable delay for decoration updates
- Customizable colors and opacity

## 🎯 Integration Flow

```
┌─────────────────────────────────────────────────────────────┐
│                      Error Lens Flow                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   Code with Error                                            │
│        │                                                     │
│        ▼                                                     │
│   ┌─────────────────────────────────────────────────────┐    │
│   │ function foo() {                                    │    │
│   │   const x: number = "hello";  ← Inline Error       │    │
│   │ }                            "Type mismatch"         │    │
│   └─────────────────────────────────────────────────────┘    │
│        │                                                     │
│   Click/Hover                                               │
│        │                                                     │
│        ▼                                                     │
│   ┌─────────────────────────────────────────────────────┐    │
│   │ Hover Message:                                      │    │
│   │ ❌ Error: Type 'string' not assignable to 'number' │    │
│   │                                                      │    │
│   │ [🤖 Ask RiftAI] [🔧 Fix with RiftAI] [🌐 Search]   │    │
│   └─────────────────────────────────────────────────────┘    │
│        │                                                     │
│        ▼                                                     │
│   RiftAI Chat Opens with Error Context                      │
│        │                                                     │
│        ▼                                                     │
│   AI Explains/Fixes the Error                               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+Alt+E` | Go to next error |
| `Ctrl+Shift+Alt+Shift+E` | Go to previous error |
| `Ctrl+Shift+Alt+A` | Explain with RiftAI |

## 🔧 Configuration

```json
{
  "errorLens.enabled": true,
  "errorLens.includeWarnings": true,
  "errorLens.includeInfo": false,
  "errorLens.aiIntegration": true,
  "errorLens.delay": 0,
  "errorLens.backgroundOpacity": 0.1
}
```

## 📁 Extension Structure

```
extensions/error-lens/
├── package.json      # Extension manifest
├── tsconfig.json     # TypeScript config
├── src/
│   └── extension.ts  # Main extension code
└── README.md         # This file
```

## 🔗 Works With

- **RiftAI** - AI explanation and fixing
- **RiftBrowser** - Search error online
- **Built-in diagnostics** - Uses VS Code's diagnostic system

## 🚀 Installation

1. Copy `extensions/error-lens/` to RiftCode extensions folder
2. Restart RiftCode
3. Error Lens will be auto-activated

## 📝 Usage

### View Errors Inline
Errors appear inline with messages:

```typescript
// Hover shows full error message
// Click shows AI options
```

### Use AI Commands
1. Click on error or use hover
2. Click "🤖 Ask RiftAI" or "🔧 Fix with RiftAI"
3. RiftAI opens with error context

### Navigate Errors
- Use `Ctrl+Shift+Alt+E` to jump to next error
- Status bar shows error count

## 🎨 Visual Design

| Severity | Color | Icon |
|----------|-------|------|
| Error | Red (#ff5555) | ❌ |
| Warning | Yellow (#ffbd2e) | ⚠️ |
| Info | Blue (#0097ff) | ℹ️ |
| Hint | Gray (#c8c8c8) | 💡 |

## 📚 References

- [RiftAI Extension](../rift-ai/README.md)
- [RiftCode Main README](../../README.md)
- [AI Extension Ecosystem](../../docs/AI_EXTENSION_ECOSYSTEM.md)

---

*Error Lens v1.0.0 - Built for RiftCode*