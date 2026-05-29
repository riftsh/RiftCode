/*---------------------------------------------------------------------------------------------
 *  AI-Synchronized Browser - Deep BrowserView integration with AI awareness
 *  This is the key differentiator from Cursor/Windsurf
 *--------------------------------------------------------------------------------------------*/

import { Event } from '../../../base/common/event.js'
import { createDecorator } from '../../../platform/instantiation/common/instantiation.js'
import type { BrowserState, BrowserAction } from '../../../platform/ai/common/types.js'

export const IAIBrowserService = createDecorator<IAIBrowserService>('aiBrowserService')

export interface IAIBrowserService {
  readonly _serviceBrand: undefined
  
  // Browser control
  open(url?: string): Promise<void>
  close(): void
  navigate(url: string): Promise<void>
  goBack(): void
  goForward(): void
  reload(): void
  stop(): void
  
  // AI control (AI can autonomously control browser)
  executeAction(action: BrowserAction): Promise<void>
  aiNavigate(url: string, reason: string): Promise<void>
  aiClick(selector: string, reason: string): Promise<void>
  aiFill(selector: string, value: string, reason: string): Promise<void>
  aiExtract(selector?: string, type?: 'text' | 'html' | 'json'): Promise<string>
  aiScreenshot(reason: string): Promise<string>
  
  // State
  getState(): BrowserState
  isOpen(): boolean
  getCurrentUrl(): string
  
  // AI awareness
  getPageContent(): Promise<PageContent>
  getDOMSnapshot(): Promise<DOMNode>
  findElement(selector: string): Promise<ElementInfo | null>
  getPageMetadata(): Promise<PageMetadata>
  
  // Events
  readonly onNavigate: Event<{ url: string; title: string }>
  readonly onLoad: Event<{ url: string; title: string }>
  readonly onAction: Event<{ type: string; target?: string; aiControlled: boolean }>
  readonly onStateChange: Event<BrowserState>
}

export interface PageContent {
  url: string
  title: string
  text: string
  html: string
  links: LinkInfo[]
  forms: FormInfo[]
  images: ImageInfo[]
  metadata: PageMetadata
}

export interface PageMetadata {
  description?: string
  keywords?: string[]
  author?: string
  language?: string
  viewport?: { width: number; height: number }
  scripts: string[]
  styles: string[]
}

export interface LinkInfo {
  href: string
  text: string
  rel?: string
  target?: string
}

export interface FormInfo {
  id?: string
  action: string
  method: string
  inputs: FormInput[]
}

export interface FormInput {
  name: string
  type: string
  id?: string
  placeholder?: string
  value?: string
  required?: boolean
}

export interface ImageInfo {
  src: string
  alt?: string
  width?: number
  height?: number
}

export interface DOMNode {
  tag: string
  attributes: Record<string, string>
  text?: string
  children: DOMNode[]
  selector: string
}

export interface ElementInfo {
  tag: string
  text: string
  attributes: Record<string, string>
  isVisible: boolean
  isClickable: boolean
  boundingBox?: { x: number; y: number; width: number; height: number }
  selector: string
  xpath: string
}

// AI Browser Actions with reasoning
export interface AIAction {
  type: 'ai_navigate' | 'ai_click' | 'ai_fill' | 'ai_screenshot' | 'ai_extract'
  params: Record<string, any>
  reason: string
  timestamp: number
}

// Built-in intelligence for web tasks
export class WebIntelligence {
  /**
   * Auto-detect documentation pages
   */
  static detectDocumentation(content: PageContent): DocumentationInfo | null {
    const indicators = [
      'documentation',
      'docs',
      'api reference',
      'guide',
      'tutorial',
      'wiki',
      'readme'
    ]
    
    const urlLower = content.url.toLowerCase()
    const titleLower = content.title.toLowerCase()
    
    for (const indicator of indicators) {
      if (urlLower.includes(indicator) || titleLower.includes(indicator)) {
        return {
          type: 'documentation',
          url: content.url,
          title: content.title,
          tableOfContents: this.extractTOC(content),
          sections: this.extractSections(content)
        }
      }
    }
    
    return null
  }
  
  /**
   * Extract API examples from documentation
   */
  static extractAPIExamples(content: PageContent): APIExample[] {
    const examples: APIExample[] = []
    const codeBlocks = this.extractCodeBlocks(content.html)
    
    for (const block of codeBlocks) {
      if (block.language) {
        examples.push({
          language: block.language,
          code: block.code,
          context: block.context || ''
        })
      }
    }
    
    return examples
  }
  
  /**
   * Find solutions to error messages
   */
  static searchForSolutions(errorMessage: string): SolutionResult {
    // This would integrate with search
    return {
      error: errorMessage,
      searches: [
        { query: errorMessage, source: 'stackoverflow' },
        { query: errorMessage + ' github', source: 'github' },
        { query: errorMessage + ' fix', source: 'google' }
      ],
      foundSolutions: []
    }
  }
  
  private static extractTOC(content: PageContent): string[] {
    // Extract table of contents from headings
    const headings: string[] = []
    const headingRegex = /<h[1-3][^>]*>(.*?)<\/h[1-3]>/gi
    let match
    
    while ((match = headingRegex.exec(content.html)) !== null) {
      headings.push(match[1].trim())
    }
    
    return headings
  }
  
  private static extractSections(content: PageContent): Section[] {
    // Extract sections from headings
    const sections: Section[] = []
    const headingRegex = /<h[1-3][^>]*id="([^"]*)"[^>]*>(.*?)<\/h[1-3]>/gi
    let match
    
    while ((match = headingRegex.exec(content.html)) !== null) {
      sections.push({
        id: match[1],
        title: match[2].trim()
      })
    }
    
    return sections
  }
  
  private static extractCodeBlocks(html: string): { language: string; code: string; context?: string }[] {
    const blocks: { language: string; code: string; context?: string }[] = []
    const codeBlockRegex = /<pre[^>]*><code[^>]*(?:class="[^"]*language-(\w+)[^"]*")?[^>]*>([\s\S]*?)<\/code><\/pre>/gi
    let match
    
    while ((match = codeBlockRegex.exec(html)) !== null) {
      blocks.push({
        language: match[1] || 'text',
        code: this.decodeHTML(match[2])
      })
    }
    
    return blocks
  }
  
  private static decodeHTML(html: string): string {
    return html
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
  }
}

export interface DocumentationInfo {
  type: 'documentation' | 'blog' | 'reference' | 'guide'
  url: string
  title: string
  tableOfContents: string[]
  sections: Section[]
}

export interface Section {
  id: string
  title: string
}

export interface APIExample {
  language: string
  code: string
  context?: string
}

export interface SolutionResult {
  error: string
  searches: { query: string; source: string }[]
  foundSolutions: Solution[]
}

export interface Solution {
  url: string
  title: string
  accepted: boolean
  votes: number
  preview: string
}

// BrowserView integration for Electron
export class RiftBrowserViewManager {
  private browserView: Electron.BrowserView | null = null
  private mainWindow: Electron.BrowserWindow | null = null
  private actionLog: AIAction[] = []
  
  constructor() {
    this.actionLog = []
  }
  
  /**
   * Create the browser view in the main window
   */
  create(mainWindow: Electron.BrowserWindow): void {
    this.mainWindow = mainWindow
    
    this.browserView = new BrowserView({
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        partition: 'persist:riftbrowser',
        webSecurity: true,
        allowRunningInsecureContent: false
      }
    })
    
    // Set visual bounds
    this.setBounds({ x: 400, y: 0, width: 800, height: 600 })
    
    // Add to main window
    mainWindow.addBrowserView(this.browserView)
    
    // Set up WebContents handlers
    this.setupWebContentsHandlers()
  }
  
  /**
   * Set the visual bounds of the browser view
   */
  setBounds(bounds: { x: number; y: number; width: number; height: number }): void {
    this.browserView?.setBounds(bounds)
  }
  
  /**
   * Navigate to URL
   */
  async loadURL(url: string): Promise<void> {
    if (!this.browserView) return
    await this.browserView.webContents.loadURL(url)
  }
  
  /**
   * Log AI action for user visibility
   */
  logAIAction(action: AIAction): void {
    this.actionLog.push(action)
    
    // Keep only last 100 actions
    if (this.actionLog.length > 100) {
      this.actionLog.shift()
    }
    
    // Emit event for UI
    this.emitAction(action)
  }
  
  /**
   * Get action log for display
   */
  getActionLog(): AIAction[] {
    return [...this.actionLog]
  }
  
  private setupWebContentsHandlers(): void {
    if (!this.browserView) return
    
    this.browserView.webContents.on('did-finish-load', () => {
      this.emitLoad({
        url: this.browserView!.webContents.getURL(),
        title: this.browserView!.webContents.getTitle()
      })
    })
    
    this.browserView.webContents.on('did-navigate', (event, url) => {
      this.emitNavigate({ url, title: '' })
    })
  }
  
  private emitLoad(payload: { url: string; title: string }): void {
    // Emit to subscribers
  }
  
  private emitNavigate(payload: { url: string; title: string }): void {
    // Emit to subscribers
  }
  
  private emitAction(action: AIAction): void {
    // Emit to subscribers
  }
  
  /**
   * Destroy the browser view
   */
  destroy(): void {
    if (this.mainWindow && this.browserView) {
      this.mainWindow.removeBrowserView(this.browserView)
    }
    this.browserView = null
    this.mainWindow = null
  }
}