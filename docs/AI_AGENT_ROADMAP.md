# 🎯 RiftCode AI Agent - Built-in Roadmap

## 📋 Executive Summary

This document outlines the comprehensive roadmap for integrating a **built-in AI agent** directly into RiftCode's core workbench, replacing the extension-based approach with proper VS Code core integration.

---

## 🏗️ Architecture Overview

### Directory Structure

```
src/vs/
├── workbench/
│   ├── contrib/
│   │   └── rift/                    # ⬅️ MAIN AI CONTAINER
│   │       ├── browser/              # UI Components
│   │       │   ├── riftPart.ts       # Sidebar container
│   │       │   ├── riftView.ts       # Main view
│   │       │   ├── chatPanel.ts      # Chat interface
│   │       │   ├── browserPanel.ts   # Real Chromium browser
│   │       │   └── widgets/          # UI widgets
│   │       ├── electron-browser/    # Electron-specific
│   │       │   ├── riftMain.ts       # Main process
│   │       │   ├── browserView.ts    # BrowserView integration
│   │       │   └── ipc.ts            # IPC handlers
│   │       ├── common/               # Shared logic
│   │       │   ├── riftService.ts    # Core service
│   │       │   ├── agentRuntime.ts   # Agent execution
│   │       │   └── tools/            # Tool registry
│   │       └── test/
│   │
│   ├── services/
│   │   └── rift/                     # ⬅️ AI SERVICES
│   │       ├── browser/               # Browser service
│   │       ├── agent/                # Agent service
│   │       ├── model/               # Model management
│   │       ├── session/             # Session management
│   │       └── mcp/                 # MCP integration
│   │
│   └── api/
│       └── rift/                    # Public API
│
└── platform/
    └── ai/                          # ⬅️ AI PLATFORM
        ├── common/                   # Shared types
        ├── registry/                # Extensions registry
        └── config/                 # Configuration
```

### Visual Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         VS Code Core                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │   Sidebar    │  │   Editor    │  │      Terminal        │  │
│  │  ┌────────┐  │  │             │  │                      │  │
│  │  │RiftAI  │  │  │             │  │                      │  │
│  │  │ Chat   │  │  │             │  │                      │  │
│  │  ├────────┤  │  │             │  │                      │  │
│  │  │Rift    │  │  │             │  │                      │  │
│  │  │Browser │  │  │             │  │                      │  │
│  │  └────────┘  │  │             │  │                      │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    Workbench Services                     │  │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌──────────────┐  │  │
│  │  │  Rift  │  │ Agent  │  │ Model  │  │    MCP      │  │  │
│  │  │Browser │  │Runtime │  │Service │  │  Registry    │  │  │
│  │  └─────────┘  └─────────┘  └─────────┘  └──────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                      Platform Layer                        │  │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────────────────────┐    │  │
│  │  │   AI    │  │ Config  │  │    Tool Registry        │    │  │
│  │  │Registry │  │ Store   │  │  (File, Terminal, Git)   │    │  │
│  │  └─────────┘  └─────────┘  └─────────────────────────┘    │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Implementation Phases

### Phase 1: Foundation (Week 1-2)

#### 1.1 Directory Structure
```
src/vs/workbench/contrib/rift/
├── rift.contribution.ts         # Registration
├── rift.ts                       # Module entry
├── browser/
│   ├── riftPart.ts              # Sidebar container
│   ├── riftView.ts              # Main view
│   └── rift.contribution.ts     # Browser contributions
├── electron-browser/
│   ├── riftMain.ts              # Main process
│   └── browserView.ts           # BrowserView setup
└── common/
    └── services/
        └── riftService.ts      # Core service
```

#### 1.2 Core Service Interface
```typescript
// src/vs/workbench/services/rift/common/riftService.ts
export interface IRiftService {
  // Chat functionality
  sendMessage(content: string): Promise<ChatMessage>
  
  // Browser functionality  
  openBrowser(url?: string): void
  navigateBrowser(url: string): void
  
  // Session management
  createSession(options?: SessionOptions): Promise<Session>
  listSessions(): Session[]
  
  // Model configuration
  setModel(modelId: string): void
  getAvailableModels(): AIModel[]
}
```

#### 1.3 Contribution Points
- Register `rift` part in workbench
- Add activity bar icon
- Register commands
- Register keybindings

---

### Phase 2: Chat Interface (Week 3-4)

#### 2.1 Chat Panel Component
```
browser/
├── chat/
│   ├── chatPanel.ts            # Main chat container
│   ├── chatInput.ts             # Input component
│   ├── chatMessage.ts           # Message renderer
│   ├── chatHistory.ts           # History manager
│   └── chatSlashCommands.ts     # Command handling
```

#### 2.2 Features
| Feature | Description | Priority |
|---------|------------|----------|
| Message Input | Text input with send button | P0 |
| Message Display | Render AI and user messages | P0 |
| Markdown Rendering | Support code blocks, lists | P0 |
| Code Highlighting | Syntax highlighting in messages | P1 |
| File References | Clickable file links | P1 |
| Copy Code | One-click code copy | P1 |
| Message Streaming | Real-time streaming responses | P2 |

#### 2.3 UI States
```typescript
enum ChatState {
  IDLE = 'idle',           // Ready for input
  LOADING = 'loading',     // Waiting for response
  STREAMING = 'streaming', // Receiving streamed response
  ERROR = 'error',         // Error occurred
  DISCONNECTED = 'disconnected' // Not connected
}
```

---

### Phase 3: Real Browser Integration (Week 5-6)

#### 3.1 Architecture for Real Chromium

```
┌─────────────────────────────────────────────────────────┐
│                   Main Process                          │
│                                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │              RiftBrowserManager                  │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────┐  │   │
│  │  │BrowserView  │  │  WebContents │  │ Session │  │   │
│  │  │  (Chromium) │  │   Manager    │  │ Manager │  │   │
│  │  └─────────────┘  └─────────────┘  └─────────┘  │   │
│  └─────────────────────────────────────────────────┘   │
│                          │                              │
│                    IPC Bridge                           │
│                          │                              │
└──────────────────────────┼──────────────────────────────┘
                           │
┌──────────────────────────┼──────────────────────────────┐
│                   Renderer                              │
│                          │                              │
│  ┌─────────────────────────────────────────────────┐   │
│  │              BrowserPanel (WebView)               │   │
│  │  ┌─────────────────────────────────────────────┐  │   │
│  │  │  [◀] [▶] [↻]  🔒 https://...  [↗]          │  │   │
│  │  ├─────────────────────────────────────────────┤  │   │
│  │  │                                             │  │   │
│  │  │           iframe / BrowserView              │  │   │
│  │  │                                             │  │   │
│  │  └─────────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────┘   │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

#### 3.2 BrowserView Implementation

```typescript
// electron-browser/browserView.ts
export class RiftBrowserView {
  private browserView: Electron.BrowserView | null = null
  
  createBrowserView(mainWindow: BrowserWindow): void {
    this.browserView = new BrowserView({
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        partition: 'persist:riftbrowser'
      }
    })
    
    mainWindow.addBrowserView(this.browserView)
  }
  
  setBounds(bounds: { x: number; y: number; width: number; height: number }): void {
    this.browserView?.setBounds(bounds)
  }
  
  loadURL(url: string): void {
    this.browserView?.webContents.loadURL(url)
  }
}
```

#### 3.3 Browser Features

| Feature | Status | Description |
|---------|--------|-------------|
| Navigation | P0 | Back, Forward, Refresh |
| URL Bar | P0 | Direct URL entry |
| Security Indicator | P1 | HTTPS badge |
| DevTools | P2 | Chrome DevTools panel |
| Bookmarks | P3 | Save favorite URLs |
| Tabs | P4 | Multiple browser tabs |

---

### Phase 4: Agent Runtime (Week 7-8)

#### 4.1 Agent Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Agent Runtime                           │
│                                                              │
│  ┌───────────────┐    ┌───────────────┐    ┌─────────────┐ │
│  │   Planner    │───▶│   Executor    │───▶│   Tool      │ │
│  │  (Thinking)  │    │  (Actions)    │    │  (API Calls)│ │
│  └───────────────┘    └───────────────┘    └─────────────┘ │
│         │                   │                   │          │
│         └───────────────────┼───────────────────┘          │
│                             ▼                              │
│                   ┌───────────────┐                       │
│                   │    Memory     │                       │
│                   │  (Context)    │                       │
│                   └───────────────┘                       │
└─────────────────────────────────────────────────────────────┘
```

#### 4.2 Tool Registry

```typescript
// platform/ai/common/toolRegistry.ts
export interface Tool {
  id: string
  name: string
  description: string
  parameters: ParameterSchema
  execute(params: any): Promise<ToolResult>
}

// Built-in tools
const builtInTools: Tool[] = [
  {
    id: 'file.read',
    name: 'Read File',
    description: 'Read contents of a file',
    parameters: { path: 'string' },
    execute: async ({ path }) => { ... }
  },
  {
    id: 'file.write',
    name: 'Write File', 
    description: 'Write content to a file',
    parameters: { path: 'string', content: 'string' },
    execute: async ({ path, content }) => { ... }
  },
  {
    id: 'terminal.run',
    name: 'Run Terminal Command',
    description: 'Execute a terminal command',
    parameters: { command: 'string', cwd?: 'string' },
    execute: async ({ command, cwd }) => { ... }
  },
  {
    id: 'git.status',
    name: 'Git Status',
    description: 'Get current git status',
    execute: async () => { ... }
  },
  {
    id: 'search.find',
    name: 'Search Files',
    description: 'Search for text in files',
    parameters: { query: 'string', path?: 'string' },
    execute: async ({ query, path }) => { ... }
  },
  {
    id: 'browser.navigate',
    name: 'Browser Navigate',
    description: 'Navigate browser to URL',
    parameters: { url: 'string' },
    execute: async ({ url }) => { ... }
  }
]
```

#### 4.3 MCP Integration

```typescript
// services/mcp/mcpRegistry.ts
export interface MCPServer {
  id: string
  name: string
  command: string[]
  env?: Record<string, string>
  status: 'connected' | 'disconnected' | 'error'
}

// MCP protocol support
export interface MCPMessage {
  jsonrpc: '2.0'
  id: string | number
  method: string
  params?: any
}
```

---

### Phase 5: Model Integration (Week 9-10)

#### 5.1 Supported Models

| Provider | Models | Status |
|----------|--------|--------|
| OpenAI | GPT-4o, GPT-4o-mini, o1 | P0 |
| Anthropic | Claude 3.5 Sonnet, Opus | P0 |
| Google | Gemini 2.0 Flash | P1 |
| Groq | Llama variants | P2 |
| Local | Ollama support | P3 |

#### 5.2 Model Service Interface

```typescript
// services/model/modelService.ts
export interface IModelService {
  // Model management
  listModels(): AIModel[]
  setModel(modelId: string): void
  getCurrentModel(): AIModel
  
  // API configuration
  setApiKey(provider: string, key: string): void
  configureEndpoint(provider: string, endpoint: string): void
  
  // Chat completion
  complete(messages: ChatMessage[]): Promise<ChatResponse>
  streamComplete(messages: ChatMessage[], onChunk: (chunk: string) => void): void
}
```

---

### Phase 6: UI Polish & Integration (Week 11-12)

#### 6.1 Activity Bar Integration

```
┌────┐
│ 🏠 │  Explorer
│ 🔍 │  Search
│ 🧩 │  Extensions
│ ─── │  -------
│ 🤖 │  RiftAI     ← New AI icon
│ 🌐 │  Browser    ← New browser icon
│ ─── │  -------
│ ⚙️ │  Settings
└────┘
```

#### 6.2 Sidebar Views

| View | Icon | Description |
|------|------|-------------|
| Rift Chat | `$(chat)` | Main AI chat interface |
| Rift Browser | `$(globe)` | Full browser panel |
| Sessions | `$(layers)` | Session management |

#### 6.3 Keybindings

| Shortcut | Action | Category |
|----------|--------|----------|
| `Ctrl+Shift+R` | Open RiftAI | Rift |
| `Ctrl+Shift+B` | Open Browser | Rift |
| `Ctrl+L` | Quick chat (inline) | Chat |
| `Ctrl+Shift+G` | Git with AI | Git |

---

## 📊 Feature Priority Matrix

| Feature | Complexity | Value | Priority | Phase |
|---------|------------|-------|----------|-------|
| Chat Interface | Medium | High | P0 | 2 |
| Real Browser | High | High | P0 | 3 |
| Agent Runtime | High | Critical | P0 | 4 |
| Model Support | Medium | High | P0 | 5 |
| Terminal Tools | Low | High | P0 | 4 |
| File Tools | Low | High | P0 | 4 |
| Git Tools | Medium | Medium | P1 | 4 |
| Search Tools | Medium | Medium | P1 | 4 |
| Code Completion | High | High | P1 | 5 |
| MCP Server | High | Medium | P2 | 4 |
| Session History | Medium | Medium | P2 | 2 |
| Settings UI | Medium | Medium | P2 | 5 |

---

## 🧪 Testing Strategy

### Unit Tests
- Service methods
- Tool execution
- Message parsing
- State management

### Integration Tests
- Chat → Model communication
- Browser → IPC bridge
- Agent → Tool execution

### E2E Tests
- Full chat flow
- Browser navigation
- Multi-session management

---

## 📝 Implementation Checklist

### Week 1: Foundation
- [ ] Create `src/vs/workbench/contrib/rift/` directory
- [ ] Create `src/vs/workbench/services/rift/` directory
- [ ] Create `rift.contribution.ts` registration file
- [ ] Set up basic part structure (riftPart.ts)
- [ ] Register activity bar icon

### Week 2: Core Service
- [ ] Implement `IRiftService` interface
- [ ] Create session management
- [ ] Set up IPC bridge
- [ ] Add basic commands

### Week 3: Chat UI
- [ ] Create chatPanel component
- [ ] Implement message rendering
- [ ] Add input component
- [ ] Connect to service

### Week 4: Chat Polish
- [ ] Add markdown rendering
- [ ] Implement code highlighting
- [ ] Add streaming support
- [ ] Polish UI styles

### Week 5: Browser Setup
- [ ] Create BrowserView manager
- [ ] Set up IPC communication
- [ ] Implement basic navigation

### Week 6: Browser Features
- [ ] Add back/forward navigation
- [ ] Implement URL bar
- [ ] Add security indicators
- [ ] Polish browser UI

### Week 7: Agent Runtime
- [ ] Create agent executor
- [ ] Implement tool registry
- [ ] Add built-in tools
- [ ] Set up tool execution

### Week 8: MCP Support
- [ ] Create MCP registry
- [ ] Implement MCP protocol
- [ ] Add MCP server management
- [ ] Test MCP tools

### Week 9: Model Integration
- [ ] Create model service
- [ ] Add OpenAI support
- [ ] Add Anthropic support
- [ ] Implement streaming

### Week 10: Model Polish
- [ ] Add model selector UI
- [ ] Implement API key management
- [ ] Add error handling
- [ ] Polish model UX

### Week 11: Integration
- [ ] Connect chat to agent
- [ ] Connect browser to agent
- [ ] Test tool execution
- [ ] Fix integration issues

### Week 12: Polish & Release
- [ ] UI polish
- [ ] Performance optimization
- [ ] Documentation
- [ ] Beta testing

---

## 🎯 Success Criteria

| Metric | Target |
|--------|--------|
| Chat Response Time | < 2 seconds |
| Browser Load Time | < 1 second |
| Memory Usage | < 500MB baseline |
| Tool Execution | < 500ms |
| UI Responsiveness | 60fps |

---

## 📚 References

- VS Code Workbench Architecture: `src/vs/workbench/`
- Chat Contribution Example: `src/vs/workbench/contrib/chat/`
- Terminal Service: `src/vs/workbench/contrib/terminal/`
- BrowserView API: Electron docs

---

*Document Version: 1.0*  
*Last Updated: 2026-05-29*  
*Author: RiftCode AI Team*