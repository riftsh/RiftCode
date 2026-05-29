/*---------------------------------------------------------------------------------------------
 *  RiftView - Main view for RiftAI
 *  Placeholder for the main RiftAI view component
 *--------------------------------------------------------------------------------------------*/

import { Component } from '../../../common/component.js'
import { $ } from '../../../base/browser/dom.js'

import './rift.css'

/**
 * RiftView - The main chat interface for RiftAI
 * This will be implemented with full AI chat capabilities
 */
export class RiftView extends Component {
  
  private chatContainer: HTMLElement | undefined
  private inputArea: HTMLElement | undefined
  
  constructor() {
    super('rift.view')
  }
  
  /**
   * Render the rift view
   */
  render(container: HTMLElement): void {
    // Main container
    const main = append(container, $('div.rift-view'))
    
    // Chat header
    const header = append(main, $('div.rift-view-header'))
    header.innerHTML = `
      <div class="rift-view-title">RiftAI</div>
      <div class="rift-view-actions">
        <button class="rift-action-btn" data-action="new-chat">+ New</button>
        <button class="rift-action-btn" data-action="history">📜</button>
      </div>
    `
    
    // Chat messages area
    const messages = append(main, $('div.rift-messages'))
    messages.innerHTML = `
      <div class="rift-welcome">
        <h2>🤖 Welcome to RiftAI</h2>
        <p>Your intelligent coding assistant. Ask me anything!</p>
        <div class="rift-quick-actions">
          <button class="rift-quick-btn" data-prompt="Explain this code">Explain</button>
          <button class="rift-quick-btn" data-prompt="Fix this bug">Fix Bug</button>
          <button class="rift-quick-btn" data-prompt="Write tests for this">Write Tests</button>
          <button class="rift-quick-btn" data-prompt="Refactor this">Refactor</button>
        </div>
      </div>
    `
    
    // Input area
    this.inputArea = append(main, $('div.rift-input-area'))
    this.inputArea.innerHTML = `
      <textarea class="rift-input" placeholder="Ask RiftAI... (Ctrl+Enter to send)"></textarea>
      <button class="rift-send-btn">Send</button>
    `
    
    // Set up event listeners
    this.setupEventListeners()
  }
  
  /**
   * Set up event listeners
   */
  private setupEventListeners(): void {
    // Send button
    const sendBtn = this.inputArea?.querySelector('.rift-send-btn')
    sendBtn?.addEventListener('click', () => this.sendMessage())
    
    // Quick actions
    const quickBtns = document.querySelectorAll('.rift-quick-btn')
    quickBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const prompt = (btn as HTMLElement).dataset.prompt
        if (prompt) {
          const input = this.inputArea?.querySelector('.rift-input') as HTMLTextAreaElement
          if (input) {
            input.value = prompt
            this.sendMessage()
          }
        }
      })
    })
    
    // Ctrl+Enter to send
    const input = this.inputArea?.querySelector('.rift-input') as HTMLTextAreaElement
    input?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        this.sendMessage()
      }
    })
  }
  
  /**
   * Send message to AI
   */
  private sendMessage(): void {
    const input = this.inputArea?.querySelector('.rift-input') as HTMLTextAreaElement
    if (!input || !input.value.trim()) return
    
    const message = input.value.trim()
    input.value = ''
    
    // Log the message
    console.log('[RiftView] Sending message:', message)
    
    // TODO: Send to AI agent
    // For now, just show a placeholder response
    this.showThinkingIndicator()
    
    setTimeout(() => {
      this.hideThinkingIndicator()
      this.addMessage('assistant', 'This is a placeholder response. The AI will be fully integrated soon!')
    }, 1000)
  }
  
  /**
   * Show thinking indicator
   */
  private showThinkingIndicator(): void {
    const messages = document.querySelector('.rift-messages')
    if (!messages) return
    
    const indicator = document.createElement('div')
    indicator.className = 'rift-thinking'
    indicator.innerHTML = `
      <span class="rift-thinking-dots">
        <span>.</span><span>.</span><span>.</span>
      </span>
      RiftAI is thinking...
    `
    messages.appendChild(indicator)
  }
  
  /**
   * Hide thinking indicator
   */
  private hideThinkingIndicator(): void {
    const indicator = document.querySelector('.rift-thinking')
    indicator?.remove()
  }
  
  /**
   * Add a message to the chat
   */
  addMessage(role: 'user' | 'assistant', content: string): void {
    const messages = document.querySelector('.rift-messages')
    if (!messages) return
    
    const msg = document.createElement('div')
    msg.className = `rift-message rift-message-${role}`
    msg.innerHTML = `
      <div class="rift-message-header">${role === 'user' ? 'You' : '🤖 RiftAI'}</div>
      <div class="rift-message-content">${content}</div>
    `
    messages.appendChild(msg)
    
    // Scroll to bottom
    messages.scrollTop = messages.scrollHeight
  }
}

export const RIFT_VIEW_ID = 'rift.view'