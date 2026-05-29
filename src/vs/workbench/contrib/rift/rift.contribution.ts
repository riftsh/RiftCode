/*---------------------------------------------------------------------------------------------
 *  Rift AI Contribution - Main entry point for built-in AI
 *  This registers the AI system into VS Code's workbench
 *--------------------------------------------------------------------------------------------*/

import { registerAction2 } from '../../../../platform/actions/common/actions.js'
import { Registry } from '../../../../platform/registry/common/platform.js'
import { PanelRegistry } from '../../../browser/panel/panelRegistry.js'
import { ActivityBarActivityRegistry } from '../../../browser/activitybar/activitybarActivityRegistry.js'
import { CommandsRegistry } from '../../../../platform/commands/common/commandsRegistry.js'
import { KeybindingsRegistry } from '../../../../platform/keybindings/common/keybindingsRegistry.js'
import { KeyChord, KeyMod, KeyCode } from '../../../../base/common/keyCodes.js'
import { Weight } from '../../../../platform/commands/common/commands.js'
import { Action2 } from '../../../../platform/actions/common/action.js'
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js'
import { ILayoutService } from '../../../services/layout/common/layoutService.js'
import { IDisposable, Disposable } from '../../../../base/common/lifecycle.js'
import { IWorkbenchContribution, LifecyclePhase } from '../../../common/lifecycle.js'

// Workbench contributions
import './riftPart.js'
import './riftView.js'
import './riftStatusBar.js'
import './browser/riftBrowserViewPane.js'

// Services
import '../../services/rift/model/modelRouterService.js'
import '../../services/rift/tool/toolRegistryService.js'
import '../../services/rift/agent/agentOrchestratorService.js'
import '../../services/rift/browser/aiBrowserService.js'
import '../../services/rift/context/contextEngineService.js'
import '../../services/rift/mcp/mcpService.js'

// Views registration
import { IViewsRegistry, ViewContainerLocation } from '../../common/views.js'
import { Extensions as ViewExtensions } from '../../common/viewContainer.js'
import { SyncDescriptor } from '../../../../platform/instantiation/common/instantiation.js'
import { RiftBrowserViewPane, RIFT_BROWSER_VIEW_ID } from './browser/riftBrowserViewPane.js'

// Workbench contribution
const workbenchRegistry = Registry.as<WorkbenchExtensions.WorkbenchContributionRegistry>(WorkbenchExtensions.WorkbenchContributions)
workbenchRegistry.registerWorkbenchContribution(RiftWorkbenchContribution, LifecyclePhase.Starting)

// Activity bar icons
// RiftAI button (robot icon)
ActivityBarActivityRegistry.registerActivity({
  id: 'rift.activity',
  label: 'RiftAI',
  iconClass: 'codicon codicon-robot',
  componentId: 'rift.view',
  order: 5,
  when: ContextKeyExpr.and(
    ContextKeyExpr.equals('config.rift.enabled', true)
  )
})

// RiftBrowser button (globe icon) - SEPARATE button in activity bar
ActivityBarActivityRegistry.registerActivity({
  id: 'rift.browser.activity',
  label: 'RiftBrowser',
  iconClass: 'codicon codicon-globe',
  componentId: 'rift.browser.view',
  order: 6,
  when: ContextKeyExpr.and(
    ContextKeyExpr.equals('config.rift.enabled', true),
    ContextKeyExpr.equals('config.rift.browserEnabled', true)
  )
})

// Register browser view in sidebar
Registry.as<IViewsRegistry>(ViewExtensions.ViewsRegistry).registerViews([{
  id: RIFT_BROWSER_VIEW_ID,
  name: 'RiftBrowser',
  containerIcon: 'codicon codicon-globe',
  ctorDescriptor: new SyncDescriptor(RiftBrowserViewPane),
  canToggleVisibility: false,
  canMoveView: true,
  order: 6
}], { id: 'rift.browser.view', title: 'RiftBrowser' })

// Panel registration
Registry.as<PanelRegistry>(PanelExtensions.Panels).registerPanel({
  id: 'rift.panel',
  title: 'RiftAI',
  icon: 'codicon codicon-robot',
  componentId: 'rift.view',
  position: PanelPosition.BOTTOM,
  when: ContextKeyExpr.equals('rift.isOpen', true)
})

// Commands
CommandsRegistry.registerCommand('rift.open', () => {
  // Open Rift panel
})

CommandsRegistry.registerCommand('rift.chat', () => {
  // Open chat view
})

CommandsRegistry.registerCommand('rift.browser', () => {
  // Open AI browser
})

// Browser commands
CommandsRegistry.registerCommand('rift.browser.open', () => {
  // Open browser panel
})

CommandsRegistry.registerCommand('rift.browser.navigate', (url: string) => {
  // Navigate browser to URL
})

CommandsRegistry.registerCommand('rift.browser.toggle', () => {
  // Toggle browser visibility
})

// Actions
registerAction2(class RiftOpenAction extends Action2 {
  constructor() {
    super({
      id: 'rift.open',
      title: { value: 'Open RiftAI', original: 'Open RiftAI' },
      category: 'RiftAI',
      icon: 'codicon codicon-robot'
    })
  }
  run(accessor: ServicesAccessor): void {
    accessor.get(ILayoutService).侧边栏打开('rift.view')
  }
})

// Keybindings
KeybindingsRegistry.registerKeybinding({
  id: 'rift.open',
  weight: Weight.WorkbenchContrib,
  when: ContextKeyExpr.editorTextFocus,
  primary: KeyChord(KeyMod.CtrlCmd | KeyMod.Shift, KeyCode.KeyR),
  handler: (accessor) => {
    accessor.get(ILayoutService).侧边栏打开('rift.view')
  }
})

// Browser keybinding (Ctrl+Shift+B)
KeybindingsRegistry.registerKeybinding({
  id: 'rift.browser.open',
  weight: Weight.WorkbenchContrib,
  when: ContextKeyExpr.editorTextFocus,
  primary: KeyChord(KeyMod.CtrlCmd | KeyMod.Shift, KeyCode.KeyB),
  handler: (accessor) => {
    accessor.get(ILayoutService).侧边栏打开('rift.browser.view')
  }
})

// Status bar
StatusBarRegistry.registerEntry({
  id: 'rift.status',
  label: 'RiftAI',
  alignment: StatusBarAlignment.LEFT,
  priority: 100,
  command: 'rift.open',
  when: ContextKeyExpr.equals('rift.isConnected', true)
})

/**
 * Rift workbench contribution - initializes AI system on startup
 */
export class RiftWorkbenchContribution extends Disposable implements IWorkbenchContribution {
  static readonly ID = 'rift.workbench.contrib'
  
  @Inject(ILifecycleService) private lifecycleService: ILifecycleService
  @Inject(IModelRouterService) private modelRouter: IModelRouterService
  @Inject(IToolRegistryService) private toolRegistry: IToolRegistryService
  @Inject(IAgentOrchestratorService) private orchestrator: IAgentOrchestratorService
  @Inject(IContextEngineService) private contextEngine: IContextEngineService
  
  constructor(
    @ILifecycleService lifecycleService: ILifecycleService
  ) {
    super()
    
    // Register lifecycle handler
    lifecycleService.onWillShutdown(() => this.dispose())
    
    // Initialize on startup
    if (lifecycleService.phase === LifecyclePhase.Starting) {
      this.initialize()
    }
  }
  
  private async initialize(): Promise<void> {
    // Register built-in models
    for (const model of BUILT_IN_MODELS) {
      this.modelRouter.registerModel(model)
    }
    
    // Register built-in tools
    for (const tool of BUILT_IN_TOOLS) {
      this.toolRegistry.registerTool(tool)
    }
    
    console.log('[Rift] AI system initialized')
  }
}

// Configuration
ConfigurationRegistry.registerConfiguration({
  id: 'rift',
  title: 'RiftAI',
  properties: {
    'rift.enabled': {
      type: 'boolean',
      default: true,
      description: 'Enable RiftAI assistant'
    },
    'rift.defaultModel': {
      type: 'string',
      default: 'gpt-4o',
      description: 'Default AI model for RiftAI',
      enum: ['gpt-4o', 'gpt-4o-mini', 'claude-3-5-sonnet', 'gemini-2-flash']
    },
    'rift.browserEnabled': {
      type: 'boolean',
      default: true,
      description: 'Enable AI-synchronized browser'
    },
    'rift.multiAgentEnabled': {
      type: 'boolean',
      default: true,
      description: 'Enable multi-agent orchestration'
    }
  }
})

// Export services for external access
export { IModelRouterService, IToolRegistryService, IAgentOrchestratorService, IAIBrowserService, IContextEngineService, IMCPService }