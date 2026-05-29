# 🤖 RiftCode AI Extension Pack

**The Ultimate AI-Powered Development Environment**

This document describes the AI extension ecosystem for RiftCode, featuring KiloCode (RiftAI) and Error Lens working together.

---

## 📦 Extension Pack

| Extension | Purpose | Key Feature |
|-----------|---------|-------------|
| **RiftAI** | Main AI assistant | Chat, agent, browser control |
| **Error Lens** | Inline error display | AI-powered error explanation |

---

## 🔗 Integration Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    RiftCode IDE                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                    Activity Bar                         │ │
│  │  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐     │ │
│  │  │ 🏠 │ │ 🔍 │ │ 🧩 │ │ 🤖 │ │ 🌐 │ │ 📊 │ │ ⚙️ │     │ │
│  │  └────┘ └────┘ └────┘ └────┘ └────┘ └────┘ └────┘     │ │
│  │              │       │       │                       │ │
│  │         Explorer  RiftAI RiftBrowser ErrorLens       │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                    Editor Area                          │ │
│  │                                                         │ │
│  │  function foo() {                                       │ │
│  │    const x: number = "hello"; ←────────────────────── │ │
│  │                         │                               │ │
│  │                         │ (Error highlighted)           │ │
│  │                         │                               │ │
│  │                         ▼                               │ │
│  │                    ┌─────────────────┐                  │ │
│  │                    │ Hover:          │                  │ │
│  │                    │ ❌ Type error   │                  │ │
│  │                    │ [🤖 Ask RiftAI] │                  │ │
│  │                    │ [🔧 Fix with AI]│                  │ │
│  │                    └─────────────────┘                  │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                 RiftAI Sidebar                          │ │
│  │                                                         │ │
│  │  ┌──────────────────────────────────────────────────┐  │ │
│  │  │  🤖 Welcome to RiftAI                            │  │ │
│  │  │                                                    │  │ │
│  │  │  Ask me anything about your code!                │  │ │
│  │  │                                                    │  │ │
│  │  │  ┌──────────────────────────────────────────────┐│  │ │
│  │  │  │ Explain this error:                        ││  │ │
│  │  │  │ Type 'string' not assignable to 'number'   ││  │ │
│  │  │  │                                              ││  │ │
│  │  │  │ **AI Response:**                           ││  │ │
│  │  │  │ The error occurs because you're assigning ││  │ │
│  │  │  │ a string to a number variable. To fix,    ││  │ │
│  │  │  │ change the type annotation or convert    ││  │ │
│  │  │  │ the string to a number.                  ││  │ │
│  │  │  └──────────────────────────────────────────────┘│  │ │
│  │  │                                                    │  │
│  │  │  [Type your message...] [Send]                   │  │
│  │  └──────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 How They Work Together

### Flow 1: Error Detection → AI Explanation

```
Error Lens              RiftAI                  Result
    │                      │                       │
    │  (1) Shows error      │                       │
    │  inline in code       │                       │
    │──────────────────────▶│                       │
    │                      │                       │
    │                      │ (2) User clicks       │
    │                      │ "Explain with RiftAI" │
    │                      │                       │
    │                      ▼                       │
    │                ┌─────────────┐              │
    │                │ AI analyzes │              │
    │                │ error +     │              │
    │                │ context     │              │
    │                └─────────────┘              │
    │                      │                       │
    │                      │ (3) Returns          │
    │                      │ explanation          │
    │                      │──────────────────────▶│
    │                      │                       │
    ▼                      ▼                  Chat panel shows
Error highlighted         │                  explanation
with AI button             │
                           ▼
                    ┌─────────────┐
                    │ User can    │
                    │ ask follow  │
                    │ up questions│
                    └─────────────┘
```

### Flow 2: AI Fix → Applied to Code

```
RiftAI                   Error Lens              Code
    │                      │                       │
    │  (1) AI generates fix│                       │
    │  for error           │                       │
    │─────────────────────▶│                       │
    │                      │                       │
    │                      │ (2) Error Lens        │
    │                      │ confirms fix          │
    │                      │──────────────────────▶│
    │                      │                       │
    ▼                      ▼                  Code updated
AI explains               Error disappears        with fix
fix in chat               from inline
```

---

## 🎯 Features by Extension

### RiftAI Features

| Feature | Description |
|---------|-------------|
| **Chat Interface** | Natural language interaction |
| **Multi-Agent** | Parallel AI agents for complex tasks |
| **Browser Control** | AI can browse the web |
| **Tool Execution** | AI can run terminal commands |
| **Context Awareness** | Understands your codebase |
| **Model Routing** | Routes to optimal AI model |

### Error Lens Features

| Feature | Description |
|---------|-------------|
| **Inline Highlighting** | Errors shown directly in code |
| **Severity Colors** | Red (error), Yellow (warning), Blue (info) |
| **Hover Details** | Full error message on hover |
| **AI Integration** | One-click to explain/fix with AI |
| **Quick Navigation** | Jump between errors |
| **Status Bar** | Error count in status bar |

---

## 🔧 Commands

### Error Lens Commands

| Command | Shortcut | Description |
|---------|----------|-------------|
| `error-lens.showErrors` | - | Show error summary |
| `error-lens.nextError` | `Ctrl+Shift+Alt+E` | Go to next error |
| `error-lens.previousError` | `Ctrl+Shift+Alt+Shift+E` | Go to previous |
| `error-lens.explainWithAI` | `Ctrl+Shift+Alt+A` | Explain error with AI |
| `error-lens.fixWithAI` | - | Fix error with AI |
| `error-lens.searchOnline` | - | Search error online |
| `error-lens.toggleHighlights` | - | Toggle highlights |

### RiftAI Commands

| Command | Shortcut | Description |
|---------|----------|-------------|
| `rift-ai.chat` | `Ctrl+Shift+R` | Open AI chat |
| `riftcode.browser.open` | `Ctrl+Shift+B` | Open browser |

---

## ⚙️ Configuration

### Error Lens

```json
{
  "errorLens.enabled": true,
  "errorLens.includeWarnings": true,
  "errorLens.includeInfo": false,
  "errorLens.aiIntegration": true,
  "errorLens.backgroundOpacity": 0.1
}
```

### RiftAI

```json
{
  "rift.enabled": true,
  "rift.defaultModel": "gpt-4o",
  "rift.browserEnabled": true,
  "rift.multiAgentEnabled": true
}
```

---

## 📊 Comparison with Standard IDEs

| Feature | VS Code | Cursor | Windsurf | RiftCode |
|---------|---------|--------|----------|----------|
| Basic Error Display | ✅ | ✅ | ✅ | ✅ |
| Inline Error Messages | ❌ | ❌ | ❌ | ✅ (Error Lens) |
| AI Chat | Extension | ✅ | ✅ | ✅ (RiftAI) |
| AI-Powered Error Fix | ❌ | Partial | Partial | ✅ |
| AI Browser | ❌ | ✅ | ✅ | ✅ (RiftBrowser) |
| Multi-Agent | ❌ | ❌ | ❌ | ✅ |
| Integrated Ecosystem | ❌ | Partial | Partial | ✅ |

---

## 🎓 Use Cases

### Use Case 1: Fixing TypeScript Errors

1. Write code with type error
2. Error Lens highlights error inline
3. Hover over error
4. Click "Fix with RiftAI"
5. RiftAI explains and fixes error
6. Error disappears from inline display

### Use Case 2: Understanding Unknown Errors

1. Encounter unfamiliar error
2. Error Lens shows error message
3. Click "Explain with RiftAI"
4. AI explains error in plain language
5. Ask follow-up questions in chat

### Use Case 3: Web Research for Errors

1. Error Lens shows error
2. Click "Search Online"
3. RiftBrowser opens with Google search
4. AI can browse documentation
5. Results shared with RiftAI chat

---

## 🔮 Future Extensions

### Planned Extensions

| Extension | Purpose | Status |
|-----------|---------|--------|
| **CodeLens AI** | AI-powered code lens | Planned |
| **Debug AI** | AI-assisted debugging | Planned |
| **Refactor AI** | AI-powered refactoring | Planned |
| **Test AI** | AI-generated tests | Planned |
| **Doc AI** | AI documentation | Planned |

### Extension API

```typescript
// How extensions can integrate with each other
interface RiftAIIntegration {
  // Send error to AI chat
  explainError(error: ErrorInfo): void
  
  // Ask AI to fix error
  fixError(error: ErrorInfo): Promise<FixResult>
  
  // Get AI suggestions for current code
  getSuggestions(context: CodeContext): Promise<Suggestion[]>
}

// Register with Error Lens
ErrorLens.registerIntegration({
  onErrorClick: (error) => {
    RiftAI.explainError(error)
  }
})
```

---

## 📚 Documentation

- [RiftAI Extension](../rift-ai/README.md)
- [Error Lens Extension](./README.md)
- [AI Extension Ecosystem](../../docs/AI_EXTENSION_ECOSYSTEM.md)
- [RiftCode Main README](../../README.md)

---

*Extension Pack Version: 1.0.0*  
*Last Updated: 2026-05-29*  
*RiftCode AI Ecosystem*