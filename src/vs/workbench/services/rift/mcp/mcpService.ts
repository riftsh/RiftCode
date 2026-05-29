/*---------------------------------------------------------------------------------------------
 *  MCP Registry Service - Model Context Protocol integration
 *  Allows AI to use external tools via MCP servers
 *--------------------------------------------------------------------------------------------*/

import { Event } from '../../../base/common/event.js'
import { createDecorator } from '../../../platform/instantiation/common/instantiation.js'
import type { Tool, MCPServer, MCPMessage } from '../../../platform/ai/common/types.js'

export const IMCPService = createDecorator<IMCPService>('mcpService')

export interface IMCPService {
  readonly _serviceBrand: undefined
  
  // Server management
  registerServer(server: MCPServerConfig): Promise<void>
  unregisterServer(serverId: string): Promise<void>
  getServers(): MCPServerInfo[]
  getServerStatus(serverId: string): 'connected' | 'disconnected' | 'error' | 'connecting'
  
  // Tool management
  getTools(serverId?: string): Tool[]
  refreshTools(serverId?: string): Promise<void>
  
  // Tool execution
  executeTool(serverId: string, toolName: string, params: Record<string, any>): Promise<any>
  
  // Connection
  connect(serverId: string): Promise<void>
  disconnect(serverId: string): Promise<void>
  reconnect(serverId: string): Promise<void>
  
  // Events
  readonly onServerStatusChanged: Event<{ serverId: string; status: string }>
  readonly onToolAdded: Event<{ serverId: string; tool: Tool }>
  readonly onToolRemoved: Event<{ serverId: string; toolId: string }>
  readonly onMessage: Event<{ serverId: string; message: MCPMessage }>
}

export interface MCPServerConfig {
  id: string
  name: string
  command: string[]
  env?: Record<string, string>
  args?: string[]
  autoConnect?: boolean
}

export interface MCPServerInfo {
  id: string
  name: string
  status: 'connected' | 'disconnected' | 'error' | 'connecting'
  toolCount: number
  lastConnected?: number
}

// MCP Protocol Implementation
export class MCPProtocol {
  /**
   * Create a JSON-RPC request message
   */
  static createRequest(method: string, params?: any, id?: string | number): MCPMessage {
    return {
      jsonrpc: '2.0',
      id: id ?? `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      method,
      params
    }
  }
  
  /**
   * Create a JSON-RPC notification (no response expected)
   */
  static createNotification(method: string, params?: any): Omit<MCPMessage, 'id'> {
    return {
      jsonrpc: '2.0',
      method,
      params
    }
  }
  
  /**
   * Create a JSON-RPC response
   */
  static createResponse(id: string | number, result: any): MCPMessage {
    return {
      jsonrpc: '2.0',
      id,
      method: '', // Response has no method
      params: result
    }
  }
  
  /**
   * Create an error response
   */
  static createErrorResponse(id: string | number, code: number, message: string): MCPMessage {
    return {
      jsonrpc: '2.0',
      id,
      method: 'error',
      params: { code, message }
    }
  }
  
  /**
   * Parse a JSON-RPC message
   */
  static parse(message: string | object): MCPMessage | null {
    try {
      const parsed = typeof message === 'string' ? JSON.parse(message) : message
      
      if (parsed.jsonrpc !== '2.0') {
        return null
      }
      
      return parsed as MCPMessage
    } catch {
      return null
    }
  }
  
  /**
   * Check if message is a request (has id)
   */
  static isRequest(message: MCPMessage): boolean {
    return message.id !== undefined && message.method !== ''
  }
  
  /**
   * Check if message is a response (no method, has result or error)
   */
  static isResponse(message: MCPMessage): boolean {
    return message.id !== undefined && message.method === ''
  }
  
  /**
   * Check if message is a notification (no id)
   */
  static isNotification(message: MCPMessage): boolean {
    return message.id === undefined
  }
}

// MCP Client implementation
export class MCPClient {
  private process: any = null
  private messageHandlers: Map<string, (result: any) => void> = new Map()
  private eventHandlers: Map<string, ((params: any) => void)[]> = new Map()
  
  constructor(private config: MCPServerConfig) {}
  
  /**
   * Start the MCP server process
   */
  async start(): Promise<void> {
    // Spawn the MCP server process
    const { spawn } = await import('child_process')
    
    this.process = spawn(this.config.command[0], [
      ...this.config.command.slice(1),
      ...(this.config.args || [])
    ], {
      env: { ...process.env, ...this.config.env },
      stdio: ['pipe', 'pipe', 'pipe']
    })
    
    // Handle stdout for JSON-RPC messages
    this.process.stdout.on('data', (data: Buffer) => {
      const lines = data.toString().split('\n').filter(l => l.trim())
      for (const line of lines) {
        this.handleMessage(line)
      }
    })
    
    // Handle stderr for errors
    this.process.stderr.on('data', (data: Buffer) => {
      console.error(`[MCP ${this.config.name}] stderr: ${data.toString()}`)
    })
    
    // Handle process exit
    this.process.on('exit', (code: number) => {
      console.log(`[MCP ${this.config.name}] exited with code ${code}`)
    })
  }
  
  /**
   * Stop the MCP server process
   */
  stop(): void {
    if (this.process) {
      this.process.kill()
      this.process = null
    }
  }
  
  /**
   * Send a request and wait for response
   */
  async sendRequest(method: string, params?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const id = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      const message = MCPProtocol.createRequest(method, params, id)
      this.messageHandlers.set(id, resolve)
      
      this.send(message)
      
      // Timeout after 30 seconds
      setTimeout(() => {
        if (this.messageHandlers.has(id)) {
          this.messageHandlers.delete(id)
          reject(new Error(`MCP request ${method} timed out`))
        }
      }, 30000)
    })
  }
  
  /**
   * Send a notification (no response expected)
   */
  sendNotification(method: string, params?: any): void {
    const message = MCPProtocol.createNotification(method, params)
    this.send(message)
  }
  
  /**
   * Handle incoming message
   */
  private handleMessage(data: string): void {
    const message = MCPProtocol.parse(data)
    if (!message) return
    
    if (MCPProtocol.isResponse(message)) {
      const handler = this.messageHandlers.get(message.id as string)
      if (handler) {
        handler(message.params)
        this.messageHandlers.delete(message.id as string)
      }
    } else if (MCPProtocol.isRequest(message) && message.method) {
      this.handleRequest(message)
    }
  }
  
  /**
   * Handle incoming request
   */
  private async handleRequest(message: MCPMessage): Promise<void> {
    if (!message.method) return
    
    const handlers = this.eventHandlers.get(message.method)
    if (handlers && handlers.length > 0) {
      const result = await handlers[0](message.params)
      const response = MCPProtocol.createResponse(message.id as string, result)
      this.send(response)
    }
  }
  
  /**
   * Send a message to the MCP server
   */
  private send(message: MCPMessage): void {
    if (this.process && this.process.stdin) {
      this.process.stdin.write(JSON.stringify(message) + '\n')
    }
  }
  
  /**
   * Register event handler
   */
  on(method: string, handler: (params: any) => void): void {
    if (!this.eventHandlers.has(method)) {
      this.eventHandlers.set(method, [])
    }
    this.eventHandlers.get(method)!.push(handler)
  }
}

// Pre-configured MCP servers
export const BUILT_IN_MCP_SERVERS: MCPServerConfig[] = [
  {
    id: 'riftcode-filesystem',
    name: 'RiftCode File System',
    command: ['npx', '@modelcontextprotocol/server-filesystem', process.cwd()],
    autoConnect: false
  },
  {
    id: 'riftcode-memory',
    name: 'RiftCode Memory',
    command: ['npx', '@modelcontextprotocol/server-memory'],
    autoConnect: false
  },
  {
    id: 'riftcode-playwright',
    name: 'RiftCode Browser Automation',
    command: ['npx', '@playwright/mcp'],
    autoConnect: false
  }
]