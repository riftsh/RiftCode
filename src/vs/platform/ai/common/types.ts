/*---------------------------------------------------------------------------------------------
 *  RiftCode AI Platform - Core Types and Interfaces
 *--------------------------------------------------------------------------------------------*/

// Model Types
export interface AIModel {
  id: string
  name: string
  provider: AIProvider
  capabilities: ModelCapability[]
  contextWindow: number
  costPer1KTokens: number
  latency: 'fast' | 'medium' | 'slow'
  strength: string[]
  weakness: string[]
}

export type AIProvider = 'openai' | 'anthropic' | 'google' | 'groq' | 'ollama' | 'custom'

export type ModelCapability = 
  | 'chat'
  | 'completion'
  | 'streaming'
  | 'vision'
  | 'functionCalling'
  | 'jsonMode'
  | 'reasoning'

export enum TaskType {
  FAST_COMPLETION = 'fast_completion',
  COMPLEX_REASONING = 'complex_reasoning',
  CODE_GENERATION = 'code_generation',
  SEARCH_BROWSE = 'search_browse',
  FILE_EDITING = 'file_editing',
  REFACTORING = 'refactoring',
  DEBUG = 'debug',
  EXPLAIN = 'explain',
  REVIEW = 'review'
}

// Tool Types
export interface Tool {
  id: string
  name: string
  description: string
  category: ToolCategory
  parameters: ToolParameter[]
  execute(params: ToolParameters): Promise<ToolResult>
  requiresConfirmation: boolean
  rateLimit?: number // calls per minute
}

export type ToolCategory = 
  | 'core'      // File, search, git
  | 'execution' // Terminal, process
  | 'navigation' // Go-to, find references
  | 'network'   // HTTP, API
  | 'database'  // Query, schema
  | 'browser'   // Browser actions
  | 'external'  // Extension APIs

export interface ToolParameter {
  name: string
  type: 'string' | 'number' | 'boolean' | 'object' | 'array'
  description: string
  required: boolean
  default?: any
  enum?: string[]
}

export type ToolParameters = Record<string, any>

export interface ToolResult {
  success: boolean
  data?: any
  error?: string
  metadata?: {
    duration: number
    tokens?: number
    model?: string
  }
}

// Agent Types
export interface Agent {
  id: string
  name: string
  role: AgentRole
  model: AIModel
  tools: Tool[]
  instructions: string
  state: AgentState
  context: AgentContext
}

export type AgentRole = 
  | 'planner'      // Breaks down tasks
  | 'coder'        // Writes code
  | 'reviewer'     // Reviews code
  | 'tester'       // Writes tests
  | 'documenter'   // Writes docs
  | 'researcher'   // Gathers info

export type AgentState = 
  | 'idle'
  | 'planning'
  | 'executing'
  | 'waiting'
  | 'error'
  | 'completed'

export interface AgentContext {
  workspace: string
  files: string[]
  currentTask: string
  history: AgentAction[]
}

export interface AgentAction {
  type: string
  timestamp: number
  input: any
  output: any
  success: boolean
}

// Message Types
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system' | 'tool'
  content: string
  attachments?: Attachment[]
  toolCalls?: ToolCall[]
  toolResults?: ToolResult[]
  timestamp: number
  metadata?: MessageMetadata
}

export interface Attachment {
  type: 'file' | 'image' | 'url'
  path?: string
  url?: string
  mimeType?: string
}

export interface ToolCall {
  id: string
  toolId: string
  parameters: ToolParameters
}

export interface MessageMetadata {
  model?: string
  tokens?: number
  latency?: number
  finishReason?: string
}

// Session Types
export interface RiftSession {
  id: string
  name: string
  createdAt: number
  updatedAt: number
  agents: Agent[]
  messages: ChatMessage[]
  context: SessionContext
  state: SessionState
}

export type SessionState = 
  | 'active'
  | 'paused'
  | 'completed'
  | 'error'

export interface SessionContext {
  workspaceRoot: string
  openFiles: string[]
  selectedText?: string
  cursorPosition?: Position
  recentChanges: FileChange[]
}

export interface Position {
  line: number
  column: number
}

export interface FileChange {
  path: string
  type: 'create' | 'modify' | 'delete'
  timestamp: number
}

// MCP Types
export interface MCPServer {
  id: string
  name: string
  command: string[]
  env?: Record<string, string>
  status: 'connected' | 'disconnected' | 'error'
  tools: Tool[]
}

export interface MCPMessage {
  jsonrpc: '2.0'
  id: string | number
  method: string
  params?: any
}

// Browser Types
export interface BrowserState {
  url: string
  title: string
  canGoBack: boolean
  canGoForward: boolean
  isLoading: boolean
  screenshot?: string
  domSnapshot?: string
}

export interface BrowserAction {
  type: 'navigate' | 'click' | 'type' | 'scroll' | 'screenshot'
  target?: string
  value?: string
  coordinates?: { x: number; y: number }
}

// Architecture Types
export interface ArchitectureNode {
  id: string
  type: 'module' | 'component' | 'service' | 'file'
  name: string
  path: string
  relationships: string[]
  metadata: Record<string, any>
}

export interface ArchitectureGraph {
  nodes: ArchitectureNode[]
  edges: { from: string; to: string; type: string }[]
  lastUpdated: number
}

// Routing Types
export interface ModelRoute {
  taskType: TaskType
  model: AIModel
  routingReason: string
  estimatedCost: number
}

export interface RoutingDecision {
  model: AIModel
  confidence: number
  alternatives: AIModel[]
  reasoning: string
}