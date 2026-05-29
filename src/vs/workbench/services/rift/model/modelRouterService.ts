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

// Built-in models
export const BUILT_IN_MODELS: AIModel[] = [
  // OpenAI
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
    id: 'o1-preview',
    name: 'o1 Preview',
    provider: 'openai',
    capabilities: ['chat', 'completion', 'reasoning'],
    contextWindow: 128000,
    costPer1KTokens: 0.015,
    latency: 'slow',
    strength: ['complex reasoning', 'problem solving', 'math'],
    weakness: ['speed', 'no streaming']
  },
  // Anthropic
  {
    id: 'claude-3-5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'anthropic',
    capabilities: ['chat', 'completion', 'streaming', 'vision', 'functionCalling'],
    contextWindow: 200000,
    costPer1KTokens: 0.003,
    latency: 'medium',
    strength: ['coding', 'analysis', 'long context'],
    weakness: ['cost']
  },
  {
    id: 'claude-3-5-opus',
    name: 'Claude 3.5 Opus',
    provider: 'anthropic',
    capabilities: ['chat', 'completion', 'streaming', 'vision', 'functionCalling'],
    contextWindow: 200000,
    costPer1KTokens: 0.015,
    latency: 'slow',
    strength: ['complex reasoning', 'coding', 'analysis'],
    weakness: ['speed', 'cost']
  },
  // Google
  {
    id: 'gemini-2-flash',
    name: 'Gemini 2.0 Flash',
    provider: 'google',
    capabilities: ['chat', 'completion', 'streaming', 'vision'],
    contextWindow: 1000000,
    costPer1KTokens: 0.000075,
    latency: 'fast',
    strength: ['long context', 'fast', 'cheap', 'web search'],
    weakness: ['coding accuracy']
  },
  // Groq
  {
    id: 'llama-3-1-70b',
    name: 'Llama 3.1 70B',
    provider: 'groq',
    capabilities: ['chat', 'completion', 'streaming'],
    contextWindow: 128000,
    costPer1KTokens: 0.00059,
    latency: 'fast',
    strength: ['fast', 'open weights'],
    weakness: ['reasoning', 'coding']
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