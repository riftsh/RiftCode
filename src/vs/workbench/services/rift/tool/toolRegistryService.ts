/*---------------------------------------------------------------------------------------------
 *  Universal Tool Registry - Makes ANY system capability callable by AI agents
 *--------------------------------------------------------------------------------------------*/

import { Event } from '../../../base/common/event.js'
import { createDecorator } from '../../../platform/instantiation/common/instantiation.js'
import type { Tool, ToolCategory, ToolParameter, ToolResult, ToolParameters } from '../../../platform/ai/common/types.js'

export const IToolRegistryService = createDecorator<IToolRegistryService>('toolRegistryService')

export interface IToolRegistryService {
  readonly _serviceBrand: undefined
  
  // Tool registration
  registerTool(tool: Tool): void
  unregisterTool(toolId: string): void
  getTool(toolId: string): Tool | undefined
  getTools(): Tool[]
  getToolsByCategory(category: ToolCategory): Tool[]
  
  // Tool execution
  executeTool(toolId: string, params: ToolParameters): Promise<ToolResult>
  executeTools(toolCalls: { toolId: string; params: ToolParameters }[]): Promise<ToolResult[]>
  
  // Discovery
  discoverTools(): Promise<Tool[]>
  searchTools(query: string): Tool[]
  
  // MCP integration
  registerMCPServer(server: { id: string; name: string; command: string[] }): Promise<void>
  getMCPServers(): { id: string; name: string; status: string }[]
  
  // Events
  readonly onToolRegistered: Event<Tool>
  readonly onToolUnregistered: Event<string>
  readonly onToolExecuted: Event<{ toolId: string; duration: number; success: boolean }>
}

// Built-in tools
export const BUILT_IN_TOOLS: Tool[] = [
  // === CORE TOOLS ===
  {
    id: 'file.read',
    name: 'Read File',
    description: 'Read the contents of a file from the filesystem',
    category: 'core',
    parameters: [
      { name: 'path', type: 'string', description: 'Absolute path to the file', required: true },
      { name: 'startLine', type: 'number', description: 'Starting line number (0-indexed)', required: false },
      { name: 'endLine', type: 'number', description: 'Ending line number', required: false }
    ],
    requiresConfirmation: false,
    execute: async ({ path, startLine, endLine }) => {
      // Implementation uses VS Code file system API
      return { success: true, data: { path, content: '...', lines: 0 } }
    }
  },
  {
    id: 'file.write',
    name: 'Write File',
    description: 'Write content to a file, creating it if it doesn\'t exist',
    category: 'core',
    parameters: [
      { name: 'path', type: 'string', description: 'Absolute path to the file', required: true },
      { name: 'content', type: 'string', description: 'Content to write', required: true },
      { name: 'createDirs', type: 'boolean', description: 'Create parent directories if needed', required: false, default: true }
    ],
    requiresConfirmation: true,
    execute: async ({ path, content, createDirs }) => {
      return { success: true, data: { path, bytesWritten: content.length } }
    }
  },
  {
    id: 'file.edit',
    name: 'Edit File',
    description: 'Make targeted edits to specific locations in a file',
    category: 'core',
    parameters: [
      { name: 'path', type: 'string', description: 'Absolute path to the file', required: true },
      { name: 'oldText', type: 'string', description: 'Text to replace (must be exact)', required: true },
      { name: 'newText', type: 'string', description: 'Replacement text', required: true }
    ],
    requiresConfirmation: true,
    execute: async ({ path, oldText, newText }) => {
      return { success: true, data: { path, replacements: 1 } }
    }
  },
  {
    id: 'file.search',
    name: 'Search Files',
    description: 'Search for text across files in a directory',
    category: 'core',
    parameters: [
      { name: 'query', type: 'string', description: 'Text to search for', required: true },
      { name: 'path', type: 'string', description: 'Directory to search in', required: false },
      { name: 'filePattern', type: 'string', description: 'Glob pattern for files (e.g., *.ts)', required: false },
      { name: 'caseSensitive', type: 'boolean', description: 'Case sensitive search', required: false, default: false },
      { name: 'regex', type: 'boolean', description: 'Treat query as regular expression', required: false, default: false }
    ],
    requiresConfirmation: false,
    execute: async ({ query, path, filePattern, caseSensitive, regex }) => {
      return { success: true, data: { matches: [], count: 0 } }
    }
  },
  {
    id: 'file.list',
    name: 'List Directory',
    description: 'List files and directories in a path',
    category: 'core',
    parameters: [
      { name: 'path', type: 'string', description: 'Directory path to list', required: true },
      { name: 'recursive', type: 'boolean', description: 'List recursively', required: false, default: false },
      { name: 'includeHidden', type: 'boolean', description: 'Include hidden files', required: false, default: false }
    ],
    requiresConfirmation: false,
    execute: async ({ path, recursive, includeHidden }) => {
      return { success: true, data: { entries: [], count: 0 } }
    }
  },
  
  // === GIT TOOLS ===
  {
    id: 'git.status',
    name: 'Git Status',
    description: 'Get the current git repository status',
    category: 'core',
    parameters: [
      { name: 'path', type: 'string', description: 'Repository path', required: false }
    ],
    requiresConfirmation: false,
    execute: async ({ path }) => {
      return { success: true, data: { modified: [], staged: [], untracked: [], clean: false } }
    }
  },
  {
    id: 'git.diff',
    name: 'Git Diff',
    description: 'Show changes between commits, working tree, etc.',
    category: 'core',
    parameters: [
      { name: 'path', type: 'string', description: 'File or directory to diff', required: false },
      { name: 'base', type: 'string', description: 'Base commit (default: HEAD)', required: false }
    ],
    requiresConfirmation: false,
    execute: async ({ path, base }) => {
      return { success: true, data: { diff: '', filesChanged: 0 } }
    }
  },
  {
    id: 'git.log',
    name: 'Git Log',
    description: 'Show commit logs',
    category: 'core',
    parameters: [
      { name: 'path', type: 'string', description: 'Repository path', required: false },
      { name: 'count', type: 'number', description: 'Number of commits to show', required: false, default: 20 }
    ],
    requiresConfirmation: false,
    execute: async ({ path, count }) => {
      return { success: true, data: { commits: [], count: 0 } }
    }
  },
  {
    id: 'git.commit',
    name: 'Git Commit',
    description: 'Create a new commit with staged changes',
    category: 'core',
    parameters: [
      { name: 'message', type: 'string', description: 'Commit message', required: true },
      { name: 'all', type: 'boolean', description: 'Stage all modified files', required: false, default: false }
    ],
    requiresConfirmation: true,
    execute: async ({ message, all }) => {
      return { success: true, data: { commitHash: '', message } }
    }
  },
  
  // === TERMINAL TOOLS ===
  {
    id: 'terminal.run',
    name: 'Run Terminal Command',
    description: 'Execute a command in the terminal',
    category: 'execution',
    parameters: [
      { name: 'command', type: 'string', description: 'Command to execute', required: true },
      { name: 'cwd', type: 'string', description: 'Working directory', required: false },
      { name: 'timeout', type: 'number', description: 'Timeout in milliseconds', required: false, default: 60000 }
    ],
    requiresConfirmation: true,
    rateLimit: 30,
    execute: async ({ command, cwd, timeout }) => {
      return { success: true, data: { stdout: '', stderr: '', exitCode: 0, duration: 0 } }
    }
  },
  {
    id: 'terminal.runScript',
    name: 'Run Script File',
    description: 'Execute a script file (.sh, .ps1, .bat)',
    category: 'execution',
    parameters: [
      { name: 'path', type: 'string', description: 'Path to script file', required: true },
      { name: 'args', type: 'array', description: 'Arguments to pass', required: false }
    ],
    requiresConfirmation: true,
    execute: async ({ path, args }) => {
      return { success: true, data: { output: '', exitCode: 0 } }
    }
  },
  
  // === NAVIGATION TOOLS ===
  {
    id: 'goto.definition',
    name: 'Go to Definition',
    description: 'Navigate to the definition of a symbol',
    category: 'navigation',
    parameters: [
      { name: 'symbol', type: 'string', description: 'Symbol name to find', required: true },
      { name: 'file', type: 'string', description: 'File to search in', required: false }
    ],
    requiresConfirmation: false,
    execute: async ({ symbol, file }) => {
      return { success: true, data: { location: { file: '', line: 0, column: 0 } } }
    }
  },
  {
    id: 'goto.references',
    name: 'Find References',
    description: 'Find all references to a symbol',
    category: 'navigation',
    parameters: [
      { name: 'symbol', type: 'string', description: 'Symbol name to find', required: true },
      { name: 'file', type: 'string', description: 'File to search in', required: false }
    ],
    requiresConfirmation: false,
    execute: async ({ symbol, file }) => {
      return { success: true, data: { references: [], count: 0 } }
    }
  },
  {
    id: 'goto.implementations',
    name: 'Find Implementations',
    description: 'Find all implementations of an interface or abstract class',
    category: 'navigation',
    parameters: [
      { name: 'symbol', type: 'string', description: 'Symbol name', required: true }
    ],
    requiresConfirmation: false,
    execute: async ({ symbol }) => {
      return { success: true, data: { implementations: [], count: 0 } }
    }
  },
  
  // === SEARCH TOOLS ===
  {
    id: 'search.symbol',
    name: 'Search Symbol',
    description: 'Search for a symbol (function, class, variable) by name',
    category: 'navigation',
    parameters: [
      { name: 'query', type: 'string', description: 'Symbol name or pattern', required: true },
      { name: 'kind', type: 'string', description: 'Symbol kind (function, class, etc.)', required: false }
    ],
    requiresConfirmation: false,
    execute: async ({ query, kind }) => {
      return { success: true, data: { symbols: [], count: 0 } }
    }
  },
  
  // === BROWSER TOOLS ===
  {
    id: 'browser.navigate',
    name: 'Navigate Browser',
    description: 'Navigate the browser to a URL',
    category: 'browser',
    parameters: [
      { name: 'url', type: 'string', description: 'URL to navigate to', required: true }
    ],
    requiresConfirmation: false,
    execute: async ({ url }) => {
      return { success: true, data: { url, title: '' } }
    }
  },
  {
    id: 'browser.screenshot',
    name: 'Take Screenshot',
    description: 'Take a screenshot of the current browser page',
    category: 'browser',
    parameters: [
      { name: 'fullPage', type: 'boolean', description: 'Capture full page', required: false, default: false }
    ],
    requiresConfirmation: false,
    execute: async ({ fullPage }) => {
      return { success: true, data: { screenshot: '', width: 0, height: 0 } }
    }
  },
  {
    id: 'browser.click',
    name: 'Click Element',
    description: 'Click on an element in the browser by selector or text',
    category: 'browser',
    parameters: [
      { name: 'selector', type: 'string', description: 'CSS selector or text', required: true }
    ],
    requiresConfirmation: false,
    execute: async ({ selector }) => {
      return { success: true, data: { action: 'click', selector } }
    }
  },
  {
    id: 'browser.fill',
    name: 'Fill Form Field',
    description: 'Fill a form input field',
    category: 'browser',
    parameters: [
      { name: 'selector', type: 'string', description: 'Input selector', required: true },
      { name: 'value', type: 'string', description: 'Value to fill', required: true }
    ],
    requiresConfirmation: false,
    execute: async ({ selector, value }) => {
      return { success: true, data: { action: 'fill', selector, value } }
    }
  },
  {
    id: 'browser.extract',
    name: 'Extract Page Content',
    description: 'Extract text or data from the current page',
    category: 'browser',
    parameters: [
      { name: 'selector', type: 'string', description: 'CSS selector to extract', required: false },
      { name: 'type', type: 'string', description: 'Type: text, html, or json', required: false, default: 'text' }
    ],
    requiresConfirmation: false,
    execute: async ({ selector, type }) => {
      return { success: true, data: { content: '', count: 0 } }
    }
  },
  
  // === NETWORK TOOLS ===
  {
    id: 'network.httpRequest',
    name: 'HTTP Request',
    description: 'Make an HTTP request',
    category: 'network',
    parameters: [
      { name: 'url', type: 'string', description: 'URL to request', required: true },
      { name: 'method', type: 'string', description: 'HTTP method', required: false, default: 'GET', enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] },
      { name: 'headers', type: 'object', description: 'Request headers', required: false },
      { name: 'body', type: 'string', description: 'Request body', required: false }
    ],
    requiresConfirmation: true,
    execute: async ({ url, method, headers, body }) => {
      return { success: true, data: { status: 200, headers: {}, body: '' } }
    }
  },
  {
    id: 'network.webSearch',
    name: 'Web Search',
    description: 'Search the web for information',
    category: 'network',
    parameters: [
      { name: 'query', type: 'string', description: 'Search query', required: true },
      { name: 'limit', type: 'number', description: 'Number of results', required: false, default: 10 }
    ],
    requiresConfirmation: false,
    execute: async ({ query, limit }) => {
      return { success: true, data: { results: [], count: 0 } }
    }
  },
  
  // === EDITOR TOOLS ===
  {
    id: 'editor.openFile',
    name: 'Open File',
    description: 'Open a file in the editor',
    category: 'navigation',
    parameters: [
      { name: 'path', type: 'string', description: 'File path to open', required: true },
      { name: 'line', type: 'number', description: 'Line to navigate to', required: false }
    ],
    requiresConfirmation: false,
    execute: async ({ path, line }) => {
      return { success: true, data: { path, line } }
    }
  },
  {
    id: 'editor.getSelection',
    name: 'Get Selection',
    description: 'Get the currently selected text',
    category: 'navigation',
    parameters: [],
    requiresConfirmation: false,
    execute: async () => {
      return { success: true, data: { text: '', start: { line: 0, column: 0 }, end: { line: 0, column: 0 } } }
    }
  },
  {
    id: 'editor.replaceSelection',
    name: 'Replace Selection',
    description: 'Replace the currently selected text',
    category: 'core',
    parameters: [
      { name: 'text', type: 'string', description: 'Replacement text', required: true }
    ],
    requiresConfirmation: true,
    execute: async ({ text }) => {
      return { success: true, data: { replaced: true } }
    }
  },
  
  // === DEBUG TOOLS ===
  {
    id: 'debug.start',
    name: 'Start Debugging',
    description: 'Start a debug session',
    category: 'execution',
    parameters: [
      { name: 'configName', type: 'string', description: 'Debug configuration name', required: false }
    ],
    requiresConfirmation: false,
    execute: async ({ configName }) => {
      return { success: true, data: { sessionId: '', status: 'running' } }
    }
  },
  {
    id: 'debug.breakpoint',
    name: 'Set Breakpoint',
    description: 'Set a breakpoint at a location',
    category: 'execution',
    parameters: [
      { name: 'path', type: 'string', description: 'File path', required: true },
      { name: 'line', type: 'number', description: 'Line number', required: true }
    ],
    requiresConfirmation: false,
    execute: async ({ path, line }) => {
      return { success: true, data: { path, line, id: '' } }
    }
  },
  {
    id: 'debug.stepOver',
    name: 'Step Over',
    description: 'Step over the current line',
    category: 'execution',
    parameters: [],
    requiresConfirmation: false,
    execute: async () => {
      return { success: true, data: { action: 'stepOver' } }
    }
  },
  {
    id: 'debug.stepInto',
    name: 'Step Into',
    description: 'Step into the current function',
    category: 'execution',
    parameters: [],
    requiresConfirmation: false,
    execute: async () => {
      return { success: true, data: { action: 'stepInto' } }
    }
  },
  {
    id: 'debug.continue',
    name: 'Continue',
    description: 'Continue execution until breakpoint',
    category: 'execution',
    parameters: [],
    requiresConfirmation: false,
    execute: async () => {
      return { success: true, data: { action: 'continue' } }
    }
  },
  {
    id: 'debug.evaluate',
    name: 'Evaluate Expression',
    description: 'Evaluate a watch expression',
    category: 'execution',
    parameters: [
      { name: 'expression', type: 'string', description: 'Expression to evaluate', required: true }
    ],
    requiresConfirmation: false,
    execute: async ({ expression }) => {
      return { success: true, data: { result: '', type: '' } }
    }
  }
] as Tool[]