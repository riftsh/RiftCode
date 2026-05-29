/*---------------------------------------------------------------------------------------------
 *  RiftBrowserViewPane - Browser view in the sidebar
 *  Provides a full browser with AI synchronization capabilities
 *--------------------------------------------------------------------------------------------*/

import { Component } from '../../../common/component.js'
import { $ } from '../../../base/browser/dom.js'
import { Scrollable } from '../../../base/common/scrollable.js'
import { IAction } from '../../../base/common/actions.js'
import { Event } from '../../../base/common/event.js'

import { IInstantiationService } from '../../../platform/instantiation/common/instantiation.js'
import { IThemeService } from '../../../platform/theme/common/themeService.js'
import { IStorageService } from '../../../platform/storage/common/storage.js'
import { IConfigurationService } from '../../../platform/configuration/common/configuration.js'
import { IContextKeyService } from '../../../platform/contextkey/common/contextKey.js'

import { ViewPane } from '../viewPane.js'
import { ViewPaneContainer } from '../viewPaneContainer.js'

import { IAIBrowserService } from '../../services/rift/browser/aiBrowserService.js'

import './riftBrowser.css'

export const RIFT_BROWSER_VIEW_ID = 'rift.browser.view'

export class RiftBrowserViewPane extends ViewPane {
  
  private browserContainer: HTMLElement | undefined
  private toolbar: HTMLElement | undefined
  private urlBar: HTMLInputElement | undefined
  private iframe: HTMLIFrameElement | undefined
  private aiActivityLog: HTMLElement | undefined
  
  private isNavigating: boolean = false
  
  constructor(
    options: { id: string; title: string; iconClass?: string },
    @IInstantiationService instantiationService: IInstantiationService,
    @IThemeService themeService: IThemeService,
    @IStorageService storageService: IStorageService,
    @IConfigurationService configurationService: IConfigurationService,
    @IContextKeyService contextKeyService: IContextKeyService
  ) {
    super(options, instantiationService, themeService, storageService, configurationService, contextKeyService)
  }
  
  /**
   * Override to not show the header (we have our own toolbar)
   */
  protected override renderHeader(container: HTMLElement): void {
    // Custom header with browser controls
    const header = append(container, $('div.rift-browser-header'))
    
    // Title
    const title = append(header, $('div.rift-browser-title'))
    title.textContent = 'RiftBrowser'
    
    // Action buttons
    const actions = append(header, $('div.rift-browser-actions'))
    actions.innerHTML = `
      <button class="rift-browser-btn" data-action="back" title="Back" disabled>◀</button>
      <button class="rift-browser-btn" data-action="forward" title="Forward" disabled>▶</button>
      <button class="rift-browser-btn" data-action="refresh" title="Reload">↻</button>
      <button class="rift-browser-btn" data-action="ai-control" title="AI Control">🤖</button>
    `
  }
  
  /**
   * Override to show browser content
   */
  protected override renderBody(container: HTMLElement): void {
    // Browser container
    this.browserContainer = append(container, $('div.rift-browser-container'))
    
    // URL bar
    const urlBarContainer = append(this.browserContainer, $('div.rift-url-bar-container'))
    this.urlBar = append(urlBarContainer, $<HTMLInputElement>('input.rift-url-bar'))
    this.urlBar.type = 'text'
    this.urlBar.placeholder = 'Enter URL or search...'
    
    // Handle URL input
    this.urlBar.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.navigate(this.urlBar.value)
      }
    })
    
    // Browser iframe
    const contentArea = append(this.browserContainer, $('div.rift-browser-content'))
    this.iframe = append(contentArea, $<HTMLIFrameElement>('iframe.rift-browser-iframe'))
    this.iframe.sandbox.add('allow-scripts')
    this.iframe.sandbox.add('allow-forms')
    this.iframe.sandbox.add('allow-same-origin')
    this.iframe.sandbox.add('allow-downloads')
    this.iframe.sandbox.add('allow-popups')
    
    // AI activity log
    const activityLogContainer = append(this.browserContainer, $('div.rift-ai-activity-container'))
    const activityLogHeader = append(activityLogContainer, $('div.rift-ai-activity-header'))
    activityLogHeader.textContent = '🤖 AI Activity'
    
    this.aiActivityLog = append(activityLogContainer, $('div.rift-ai-activity-log'))
    
    // Set up event listeners
    this.setupEventListeners()
  }
  
  /**
   * Set up browser event listeners
   */
  private setupEventListeners(): void {
    if (!this.browserContainer) return
    
    // Button clicks
    this.browserContainer.querySelectorAll('.rift-browser-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = (e.target as HTMLElement).dataset.action
        if (!action) return
        
        switch (action) {
          case 'back':
            this.goBack()
            break
          case 'forward':
            this.goForward()
            break
          case 'refresh':
            this.reload()
            break
          case 'ai-control':
            this.toggleAIControl()
            break
        }
      })
    })
    
    // Handle iframe load
    this.iframe?.addEventListener('load', () => {
      this.isNavigating = false
      this.updateURLBar(this.iframe?.src || '')
    })
  }
  
  /**
   * Navigate to URL
   */
  private navigate(url: string): void {
    if (!url) return
    
    // Add protocol if missing
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      if (url.includes('.') && !url.includes(' ')) {
        url = 'https://' + url
      } else {
        // Search query
        url = 'https://www.google.com/search?q=' + encodeURIComponent(url)
      }
    }
    
    this.isNavigating = true
    this.logActivity('Navigating to: ' + url)
    this.iframe!.src = url
  }
  
  /**
   * Go back in history
   */
  private goBack(): void {
    // Use browser history API if available
    try {
      (this.iframe?.contentWindow as any)?.history?.back()
    } catch (e) {
      console.log('[RiftBrowser] Cannot go back:', e)
    }
  }
  
  /**
   * Go forward in history
   */
  private goForward(): void {
    try {
      (this.iframe?.contentWindow as any)?.history?.forward()
    } catch (e) {
      console.log('[RiftBrowser] Cannot go forward:', e)
    }
  }
  
  /**
   * Reload current page
   */
  private reload(): void {
    if (this.iframe) {
      this.iframe.src = this.iframe.src
    }
  }
  
  /**
   * Toggle AI control mode
   */
  private toggleAIControl(): void {
    // Show/hide AI control panel
    const aiControl = this.browserContainer?.querySelector('.rift-ai-control-panel')
    if (aiControl) {
      aiControl.classList.toggle('hidden')
    } else {
      this.showAIControlPanel()
    }
  }
  
  /**
   * Show AI control panel
   */
  private showAIControlPanel(): void {
    if (!this.browserContainer) return
    
    const aiPanel = document.createElement('div')
    aiPanel.className = 'rift-ai-control-panel'
    aiPanel.innerHTML = `
      <div class="rift-ai-control-header">
        <span>🤖 AI Control</span>
        <button class="rift-close-btn">×</button>
      </div>
      <div class="rift-ai-control-content">
        <div class="rift-ai-prompt">
          <textarea placeholder="Tell AI what to do..."></textarea>
          <button class="rift-ai-send-btn">Send</button>
        </div>
        <div class="rift-ai-actions">
          <button data-action="click" title="Click element">🖱️ Click</button>
          <button data-action="fill" title="Fill form">📝 Fill</button>
          <button data-action="screenshot" title="Take screenshot">📷 Screenshot</button>
          <button data-action="extract" title="Extract content">📄 Extract</button>
        </div>
      </div>
    `
    
    // Close button handler
    aiPanel.querySelector('.rift-close-btn')?.addEventListener('click', () => {
      aiPanel.remove()
    })
    
    // Send button handler
    aiPanel.querySelector('.rift-ai-send-btn')?.addEventListener('click', () => {
      const textarea = aiPanel.querySelector('textarea')
      const prompt = textarea?.value
      if (prompt) {
        this.logActivity('🤖 AI: ' + prompt)
        // TODO: Send to AI agent for processing
        textarea.value = ''
      }
    })
    
    this.browserContainer.appendChild(aiPanel)
  }
  
  /**
   * Update URL bar with current URL
   */
  private updateURLBar(url: string): void {
    if (this.urlBar) {
      this.urlBar.value = url
    }
    
    // Update back/forward buttons
    const backBtn = this.browserContainer?.querySelector('[data-action="back"]') as HTMLButtonElement
    const forwardBtn = this.browserContainer?.querySelector('[data-action="forward"]') as HTMLButtonElement
    
    if (backBtn) backBtn.disabled = false // TODO: Check history
    if (forwardBtn) forwardBtn.disabled = false // TODO: Check history
  }
  
  /**
   * Log AI activity
   */
  private logActivity(message: string): void {
    if (!this.aiActivityLog) return
    
    const entry = document.createElement('div')
    entry.className = 'rift-activity-entry'
    entry.textContent = '[' + new Date().toLocaleTimeString() + '] ' + message
    entry.style.color = message.includes('AI') ? '#00ff00' : '#cccccc'
    
    this.aiActivityLog.appendChild(entry)
    
    // Auto-scroll to bottom
    this.aiActivityLog.scrollTop = this.aiActivityLog.scrollHeight
  }
  
  /**
   * Focus the URL bar
   */
  focus(): void {
    this.urlBar?.focus()
  }
  
  /**
   * Get current URL
   */
  getCurrentURL(): string {
    return this.iframe?.src || ''
  }
}

// Export view ID for registration
export const RIFT_BROWSER_VIEW_PANE_ID = RIFT_BROWSER_VIEW_ID