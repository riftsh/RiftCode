/*---------------------------------------------------------------------------------------------
 *  Model Ensemble Router - Intelligently routes tasks to optimal AI models
 *--------------------------------------------------------------------------------------------*/

import { Event } from '../../../base/common/event.js'
import { createDecorator } from '../../../platform/instantiation/common/instantiation.js'
import type { 
  AIModel, AIProvider, TaskType, RoutingDecision, ModelRoute, 
  ChatMessage, ChatResponse, ModelCapability 
} from '../../../platform/ai/common/types.js'

export const IModelRouterService = createDecorator<IModelRouterService>('modelRouterService')

export interface IModelRouterService {
  readonly _serviceBrand: undefined
  
  // Model management
  registerModel(model: AIModel): void
  unregisterModel(modelId: string): void
  getModels(): AIModel[]
  getModel(modelId: string): AIModel | undefined
  
  // Routing
  route(taskType: TaskType, context?: RoutingContext): RoutingDecision
  complete(messages: ChatMessage[], taskType: TaskType): Promise<ChatResponse>
  streamComplete(
    messages: ChatMessage[], 
    taskType: TaskType, 
    onChunk: (chunk: string) => void
  ): Promise<void>
  
  // Configuration
  setDefaultModel(provider: AIProvider): void
  getDefaultModel(): AIModel
  configureModel(modelId: string, config: ModelConfig): void
  
  // Events
  readonly onModelRegistered: Event<AIModel>
  readonly onModelUnregistered: Event<string>
  readonly onRoutingDecision: Event<RoutingDecision>
}

export interface RoutingContext {
  fileTypes?: string[]
  taskComplexity?: 'low' | 'medium' | 'high'
  urgency?: 'low' | 'medium' | 'high'
  preferredProviders?: AIProvider[]
  budget?: 'low' | 'medium' | 'high'
}

export interface ModelConfig {
  apiKey?: string
  endpoint?: string
  maxTokens?: number
  temperature?: number
  enabled?: boolean
}

// Built-in models - Updated for 2026
export const BUILT_IN_MODELS: AIModel[] = [
  // ========== OpenAI (2026 Models) ==========
  {
    id: 'gpt-4.5',
    name: 'GPT-4.5',
    provider: 'openai',
    capabilities: ['chat', 'completion', 'streaming', 'vision', 'functionCalling', 'jsonMode', 'deepResearch'],
    contextWindow: 256000,
    costPer1KTokens: 0.01,
    latency: 'medium',
    strength: ['general-purpose', 'vision', 'deep research', 'reasoning'],
    weakness: ['cost']
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    capabilities: ['chat', 'completion', 'streaming', 'vision', 'functionCalling', 'jsonMode'],
    contextWindow: 128000,
    costPer1KTokens: 0.005,
    latency: 'medium',
    strength: ['general-purpose', 'vision', 'function calling'],
    weakness: ['cost', 'speed']
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'openai',
    capabilities: ['chat', 'completion', 'streaming', 'functionCalling', 'jsonMode'],
    contextWindow: 128000,
    costPer1KTokens: 0.00015,
    latency: 'fast',
    strength: ['fast', 'cheap', 'good for simple tasks'],
    weakness: ['complex reasoning']
  },
  {
    id: 'o3-pro',
    name: 'o3 Pro',
    provider: 'openai',
    capabilities: ['chat', 'completion', 'reasoning', 'deepResearch'],
    contextWindow: 200000,
    costPer1KTokens: 0.03,
    latency: 'slow',
    strength: ['complex reasoning', 'problem solving', 'math', 'coding'],
    weakness: ['speed', 'no streaming', 'cost']
  },
  {
    id: 'o3-mini',
    name: 'o3 Mini',
    provider: 'openai',
    capabilities: ['chat', 'completion', 'reasoning'],
    contextWindow: 128000,
    costPer1KTokens: 0.005,
    latency: 'medium',
    strength: ['reasoning', 'coding', 'balanced'],
    weakness: ['no vision']
  },
  // ========== Anthropic (2026 Models) ==========
  {
    id: 'claude-sonnet-4',
    name: 'Claude Sonnet 4',
    provider: 'anthropic',
    capabilities: ['chat', 'completion', 'streaming', 'vision', 'functionCalling', 'computerUse'],
    contextWindow: 200000,
    costPer1KTokens: 0.003,
    latency: 'medium',
    strength: ['coding', 'analysis', 'long context', 'computer use'],
    weakness: ['cost']
  },
  {
    id: 'claude-opus-4',
    name: 'Claude Opus 4',
    provider: 'anthropic',
    capabilities: ['chat', 'completion', 'streaming', 'vision', 'functionCalling', 'computerUse', 'deepResearch'],
    contextWindow: 200000,
    costPer1KTokens: 0.015,
    latency: 'slow',
    strength: ['complex reasoning', 'coding', 'analysis', 'deep research'],
    weakness: ['speed', 'cost']
  },
  {
    id: 'claude-haiku-4',
    name: 'Claude Haiku 4',
    provider: 'anthropic',
    capabilities: ['chat', 'completion', 'streaming'],
    contextWindow: 200000,
    costPer1KTokens: 0.0008,
    latency: 'fast',
    strength: ['fast', 'long context', 'cheap'],
    weakness: ['no vision', 'simpler tasks']
  },
  // ========== Google (2026 Models) ==========
  {
    id: 'gemini-3-flash',
    name: 'Gemini 3.0 Flash',
    provider: 'google',
    capabilities: ['chat', 'completion', 'streaming', 'vision', 'longContext', 'webSearch'],
    contextWindow: 2000000,
    costPer1KTokens: 0.00005,
    latency: 'fast',
    strength: ['ultra long context', 'fast', 'ultra cheap', 'web search'],
    weakness: ['coding accuracy']
  },
  {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    provider: 'google',
    capabilities: ['chat', 'completion', 'streaming', 'vision', 'longContext', 'webSearch', 'thinking'],
    contextWindow: 1000000,
    costPer1KTokens: 0.00125,
    latency: 'medium',
    strength: ['thinking', 'coding', 'analysis', 'web search'],
    weakness: ['cost']
  },
  {
    id: 'gemini-2-flash',
    name: 'Gemini 2.0 Flash',
    provider: 'google',
    capabilities: ['chat', 'completion', 'streaming', 'vision'],
    contextWindow: 1000000,
    costPer1KTokens: 0.000075,
    latency: 'fast',
    strength: ['long context', 'fast', 'cheap'],
    weakness: ['coding accuracy']
  },
  // ========== xAI ==========
  {
    id: 'grok-3',
    name: 'Grok 3',
    provider: 'xai',
    capabilities: ['chat', 'completion', 'streaming', 'webSearch', 'reasoning'],
    contextWindow: 131072,
    costPer1KTokens: 0.002,
    latency: 'medium',
    strength: ['web search', 'real-time info', 'reasoning'],
    weakness: ['limited context']
  },
  // ========== DeepSeek ==========
  {
    id: 'deepseek-v3',
    name: 'DeepSeek V3',
    provider: 'deepseek',
    capabilities: ['chat', 'completion', 'streaming', 'functionCalling'],
    contextWindow: 64000,
    costPer1KTokens: 0.00014,
    latency: 'fast',
    strength: ['coding', 'reasoning', 'ultra cheap'],
    weakness: ['shorter context']
  },
  {
    id: 'deepseek-r1',
    name: 'DeepSeek R1',
    provider: 'deepseek',
    capabilities: ['chat', 'completion', 'reasoning'],
    contextWindow: 64000,
    costPer1KTokens: 0.00055,
    latency: 'medium',
    strength: ['reasoning', 'math', 'coding', 'open weights'],
    weakness: ['no streaming', 'shorter context']
  },
  // ========== Mistral ==========
  {
    id: 'mistral-large-3',
    name: 'Mistral Large 3',
    provider: 'mistral',
    capabilities: ['chat', 'completion', 'streaming', 'vision', 'functionCalling'],
    contextWindow: 128000,
    costPer1KTokens: 0.002,
    latency: 'medium',
    strength: ['coding', 'multilingual', 'function calling'],
    weakness: ['reasoning']
  },
  // ========== Groq (Fast Inference) ==========
  {
    id: 'llama-4-70b',
    name: 'Llama 4 70B',
    provider: 'groq',
    capabilities: ['chat', 'completion', 'streaming'],
    contextWindow: 128000,
    costPer1KTokens: 0.00059,
    latency: 'fast',
    strength: ['fast', 'open weights'],
    weakness: ['reasoning', 'coding']
  },
  {
    id: 'qwen-3-72b',
    name: 'Qwen 3 72B',
    provider: 'groq',
    capabilities: ['chat', 'completion', 'streaming', 'multilingual'],
    contextWindow: 128000,
    costPer1KTokens: 0.0007,
    latency: 'fast',
    strength: ['multilingual', 'fast', 'good reasoning'],
    weakness: ['coding']
  },
  // ========== OpenRouter Aggregated ==========
  {
    id: 'anthropic-sonnet-4-latest',
    name: 'Claude Sonnet 4 (Latest)',
    provider: 'openrouter',
    capabilities: ['chat', 'completion', 'streaming', 'vision', 'functionCalling'],
    contextWindow: 200000,
    costPer1KTokens: 0.003,
    latency: 'medium',
    strength: ['coding', 'analysis', 'reliable'],
    weakness: ['cost']
  }
]

// Routing rules based on task type
const TASK_ROUTING_RULES: Record<TaskType, RoutingRule> = {
  [TaskType.FAST_COMPLETION]: {
    preferredProviders: ['openai', 'groq'],
    preferredLatencies: ['fast'],
    maxCostPer1K: 0.001,
    reasoning: 'Fast completion for autocomplete'
  },
  [TaskType.COMPLEX_REASONING]: {
    preferredProviders: ['anthropic', 'openai'],
    preferredLatencies: ['medium', 'slow'],
    maxCostPer1K: 0.02,
    reasoning: 'Complex reasoning needs strong models'
  },
  [TaskType.CODE_GENERATION]: {
    preferredProviders: ['openai', 'anthropic'],
    preferredLatencies: ['medium'],
    maxCostPer1K: 0.01,
    reasoning: 'Code generation benefits from coding-specialized models'
  },
  [TaskType.SEARCH_BROWSE]: {
    preferredProviders: ['google'],
    preferredLatencies: ['fast'],
    maxCostPer1K: 0.001,
    reasoning: 'Web search is Google\\'s specialty'
  },
  [TaskType.FILE_EDITING]: {
    preferredProviders: ['openai', 'anthropic'],
    preferredLatencies: ['fast', 'medium'],
    maxCostPer1K: 0.005,
    reasoning: 'File editing needs context-aware models'
  },
  [TaskType.REFACTORING]: {
    preferredProviders: ['anthropic', 'openai'],
    preferredLatencies: ['medium'],
    maxCostPer1K: 0.01,
    reasoning: 'Refactoring needs deep code understanding'
  },
  [TaskType.DEBUG]: {
    preferredProviders: ['anthropic', 'openai'],
    preferredLatencies: ['medium'],
    maxCostPer1K: 0.008,
    reasoning: 'Debugging benefits from reasoning models'
  },
  [TaskType.EXPLAIN]: {
    preferredProviders: ['anthropic', 'openai', 'google'],
    preferredLatencies: ['medium'],
    maxCostPer1K: 0.005,
    reasoning: 'Explanation needs clear communication'
  },
  [TaskType.REVIEW]: {
    preferredProviders: ['anthropic'],
    preferredLatencies: ['medium'],
    maxCostPer1K: 0.01,
    reasoning: 'Code review needs analytical models'
  }
}

interface RoutingRule {
  preferredProviders: AIProvider[]
  preferredLatencies: ('fast' | 'medium' | 'slow')[]
  maxCostPer1K: number
  reasoning: string
}

interface ChatResponse {
  content: string
  model: AIModel
  finishReason: string
  usage?: {
    inputTokens: number
    outputTokens: number
    totalTokens: number
  }
  metadata?: Record<string, any>
}