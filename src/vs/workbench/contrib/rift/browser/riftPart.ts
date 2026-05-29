/*---------------------------------------------------------------------------------------------
 *  RiftPart - The main sidebar container for RiftAI
 *  This is the UI component that appears in the activity bar
 *--------------------------------------------------------------------------------------------*/

import { Component } from '../../../common/component.js'
import { Event } from '../../../base/common/event.js'
import { ActionsOrientation, IAction, actionFactory } from '../../../platform/actions/common/actions.js'
import { IInstantiationService } from '../../../platform/instantiation/common/instantiation.js'
import { IThemeService } from '../../../platform/theme/common/themeService.js'
import { IContextKeyService } from '../../../platform/contextkey/common/contextKey.js'
import { IStorageService } from '../../../platform/storage/common/storage.js'
import { IConfigurationService } from '../../../platform/configuration/common/configuration.js'
import { ITelemetryService } from '../../../platform/telemetry/common/telemetry.js'

import { splitView } from '../../../../base/parts/sandbox/electron-sandbox/splitView.js'
import { $, append } from '../../../base/browser/dom.js'
import { ActionBar } from '../../../base/browser/ui/actionbar/actionbar.js'
import { Scrollable, IScrollableOptions } from '../../../base/common/scrollable.js'
import { Severity } from '../../../platform/severity/common/severity.js'

import { IEditorService } from '../../services/editor/common/editorService.js'
import { IWorkspaceContextService } from '../../services/workspace/common/workspaceContext.js'

import './rift.css'

export const IRiftPartService = createDecorator<IRiftPartService>('riftPartService')

export interface IRiftPartService {
  readonly _serviceBrand: undefined
  openChat(): void
  openBrowser(): void
  openSessions(): void
  getActiveView(): 'chat' | 'browser' | 'sessions'
}

export class RiftPart extends Component {
  static readonly ID = 'workbench.parts.rift'
  static readonly TITLE = 'RiftAI'
  
  private element: HTMLElement | undefined
  private headerElement: HTMLElement | undefined
  private contentElement: HTMLElement | undefined
  private actionBar: ActionBar | undefined
  
  private currentView: 'chat' | 'browser' | 'sessions' = 'chat'
  
  // Sub-panels
  private chatPanel: RiftChatPanel | undefined
  private browserPanel: RiftBrowserPanel | undefined
  private sessionsPanel: RiftSessionsPanel | undefined
  
  constructor(
    @IInstantiationService instantiationService: IInstantiationService,
    @IThemeService themeService: IThemeService,
    @IContextKeyService contextKeyService: IContextKeyService,
    @IStorageService storageService: IStorageService,
    @IConfigurationService configurationService: IConfigurationService,
    @ITelemetryService telemetryService: ITelemetryService
  ) {
    super(RiftPart.ID, { quickPickScrollbarSelector: '.rift-content' }, themeService, storageService)
    
    // Register command
    CommandsRegistry.registerCommand('rift.toggle', () => this.toggle())
  }
  
  /**
   * Create the part UI
   */
  createElement(parent: HTMLElement): HTMLElement {
    this.element = parent
    
    // Header
    this.headerElement = append(parent, $('div.rift-header'))
    this.createHeader()
    
    // Content
    this.contentElement = append(parent, $('div.rift-content'))
    this.createContent()
    
    return this.element
  }
  
  /**
   * Create header with navigation tabs
   */
  private createHeader(): void {
    if (!this.headerElement) return
    
    // Title
    const titleElement = append(this.headerElement, $('div.rift-title'))
    titleElement.textContent = 'RiftAI'
    
    // Actions bar
    const actionsElement = append(this.headerElement, $('div.rift-actions'))
    this.actionBar = new ActionBar(actionsElement, {
      orientation: ActionsOrientation.HORIZONTAL,
      context: this._contextKeyService
    })
    
    // Add header actions
    this.actionBar.push([
      new Action('rift.chat', 'Chat', 'codicon codicon-comment', true, () => this.showView('chat')),
      new Action('rift.browser', 'Browser', 'codicon codicon-globe', true, () => this.showView('browser')),
      new Action('rift.sessions', 'Sessions', 'codicon codicon-list-flat', true, () => this.showView('sessions'))
    ])
  }
  
  /**
   * Create content area with sub-panels
   */
  private createContent(): void {
    if (!this.contentElement) return
    
    // Create scrollable content
    this.scrollable = this._register(new Scrollable(this.contentElement, {
      vertical: Scrollable.ORIENTATION.VERTICAL,
      horizontal: Scrollable.ORIENTATION.NONE
    }))
    
    // Initialize sub-panels
    this.initializePanels()
    
    // Show default view
    this.showView(this.currentView)
  }
  
  /**
   * Initialize sub-panels
   */
  private initializePanels(): void {
    // Chat panel
    this.chatPanel = this._register(this.instantiationService.createInstance(RiftChatPanel))
    this.chatPanel.render(this.scrollable!.getDomNode())
    this.chatPanel.hide()
    
    // Browser panel
    this.browserPanel = this._register(this.instantiationService.createInstance(RiftBrowserPanel))
    this.browserPanel.render(this.scrollable!.getDomNode())
    this.browserPanel.hide()
    
    // Sessions panel
    this.sessionsPanel = this._register(this.instantiationService.createInstance(RiftSessionsPanel))
    this.sessionsPanel.render(this.scrollable!.getDomNode())
    this.sessionsPanel.hide()
  }
  
  /**
   * Show a specific view
   */
  showView(view: 'chat' | 'browser' | 'sessions'): void {
    this.currentView = view
    
    // Hide all panels
    this.chatPanel?.hide()
    this.browserPanel?.hide()
    this.sessionsPanel?.hide()
    
    // Show selected panel
    switch (view) {
      case 'chat':
        this.chatPanel?.show()
        break
      case 'browser':
        this.browserPanel?.show()
        break
      case 'sessions':
        this.sessionsPanel?.show()
        break
    }
    
    // Update action bar state
    this.actionBar?.setContext(this._contextKeyService)
  }
  
  /**
   * Toggle the rift panel
   */
  toggle(): void {
    const visible = this.isVisible()
    if (visible) {
      this.hide()
    } else {
      this.show()
    }
  }
  
  /**
   * Get layout info
   */
  getLayoutInfo(): PartLayoutInfo {
    return {
      minimumWidth: 320,
      maximumWidth: 600,
      minimumHeight: 400,
      priority: Priority.Normal
    }
  }
}

// Placeholder panels (would be implemented with full UI)
export class RiftChatPanel extends Component {
  render(container: HTMLElement): void {
    const element = append(container, $('div.rift-chat-panel'))
    element.innerHTML = `
      <div class="chat-container">
        <div class="messages"></div>
        <div class="input-area">
          <textarea placeholder="Ask RiftAI..."></textarea>
          <button class="send-btn">Send</button>
        </div>
      </div>
    `
  }
}

export class RiftBrowserPanel extends Component {
  render(container: HTMLElement): void {
    const element = append(container, $('div.rift-browser-panel'))
    element.innerHTML = `
      <div class="browser-container">
        <div class="browser-toolbar">
          <button class="nav-btn back">◀</button>
          <button class="nav-btn forward">▶</button>
          <button class="nav-btn refresh">↻</button>
          <input type="text" class="url-bar" placeholder="Enter URL..." />
          <button class="nav-btn external">↗</button>
        </div>
        <iframe class="browser-content" sandbox="allow-scripts allow-forms allow-same-origin"></iframe>
        <div class="ai-activity-log">
          <h4>AI Activity</h4>
          <div class="log-entries"></div>
        </div>
      </div>
    `
  }
}

export class RiftSessionsPanel extends Component {
  render(container: HTMLElement): void {
    const element = append(container, $('div.rift-sessions-panel'))
    element.innerHTML = `
      <div class="sessions-container">
        <div class="sessions-header">
          <button class="new-session-btn">+ New Session</button>
        </div>
        <div class="sessions-list">
          <!-- Session items will be rendered here -->
        </div>
      </div>
    `
  }
}

// Export CSS styles
const RIFT_CSS = `
.rift-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: var(--vscode-sideBar-background);
  border-bottom: 1px solid var(--vscode-sideBarSectionHeader-border);
}

.rift-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--vscode-foreground);
}

.rift-actions {
  display: flex;
  gap: 4px;
}

.rift-actions .action-item {
  padding: 6px 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}

.rift-actions .action-item:hover {
  background: var(--vscode-toolbar-hoverBackground);
}

.rift-actions .action-item.active {
  background: var(--vscode-toolbar-activeBackground);
}

.rift-content {
  height: calc(100% - 48px);
  overflow: auto;
}

.rift-chat-panel .chat-container,
.rift-browser-panel .browser-container,
.rift-sessions-panel .sessions-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}
`