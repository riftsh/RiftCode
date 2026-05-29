/*---------------------------------------------------------------------------------------------
 *  Rift AI - Built-in Module Exports
 *  Horizon 1: Foundation Features
 *--------------------------------------------------------------------------------------------*/

// Services
export { IModelRouterService, BUILT_IN_MODELS } from '../services/rift/model/modelRouterService.js'
export { IToolRegistryService, BUILT_IN_TOOLS } from '../services/rift/tool/toolRegistryService.js'
export { IAgentOrchestratorService, RiftAgent, TaskDecomposer, ResultSynthesizer } from '../services/rift/agent/agentOrchestratorService.js'
export { IAIBrowserService, WebIntelligence, RiftBrowserViewManager } from '../services/rift/browser/aiBrowserService.js'
export { IContextEngineService, ProjectAnalyzer, ContextOptimizer, ArchitectureDetector } from '../services/rift/context/contextEngineService.js'
export { IMCPService, MCPProtocol, MCPClient, BUILT_IN_MCP_SERVERS } from '../services/rift/mcp/mcpService.js'

// Types (from platform)
export type {
  AIModel,
  AIProvider,
  TaskType,
  Tool,
  ToolCategory,
  ToolParameter,
  ToolParameters,
  ToolResult,
  Agent,
  AgentRole,
  AgentState,
  AgentContext,
  AgentAction,
  ChatMessage,
  MCPServer,
  BrowserState,
  BrowserAction,
  ArchitectureGraph,
  ArchitectureNode
} from '../../platform/ai/common/types.js'

// UI Components
export { RiftPart } from './browser/riftPart.js'

// Configuration
export const RIFT_CONFIG = {
  enabled: true,
  defaultModel: 'gpt-4o',
  maxTokens: 128000,
  streamingEnabled: true,
  multiAgentEnabled: true,
  browserEnabled: true,
  contextWindowOptimization: true,
  mcpEnabled: true
}

// Version info
export const RIFT_VERSION = '1.0.0'
export const RIFT_BUILD = {
  version: '1.0.0',
  codename: 'RiftAI',
  date: '2026-05-29',
  features: [
    'Multi-model ensemble routing',
    'Universal tool execution framework',
    'Intelligent context engine',
    'Multi-agent orchestration',
    'AI-synchronized browser',
    'MCP protocol support'
  ]
}