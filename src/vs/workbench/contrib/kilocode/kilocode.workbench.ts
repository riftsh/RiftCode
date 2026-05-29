/*---------------------------------------------------------------------------------------------
 *  KiloCode Workbench Integration - Built-in AI Agent
 *  This integrates KiloCode (RiftAI) directly into the VS Code workbench
 *  as a first-class built-in extension, not an external extension
 *--------------------------------------------------------------------------------------------*/

import { ContextKeyExpr } from '../../../platform/contextkey/common/contextkey.js'
import { IConfigurationService } from '../../../platform/configuration/common/configuration.js'
import { IInstantiationService } from '../../../platform/instantiation/common/instantiation.js'
import { IWorkbenchLayoutService, Parts } from '../../services/layout/common/layoutService.js'
import { Registry } from '../../../platform/registry/common/platform.js'
import { registerAction2, MenuId, Action2 } from '../../../platform/actions/common/actions.js'
import { KeybindingsRegistry, KeybindingWeight } from '../../../platform/keybindings/common/keybindingsRegistry.js'
import { KeyCode, KeyChord, KeyMod } from '../../../base/common/keyCodes.js'
import { ServicesAccessor } from '../../../platform/instantiation/common/instantiation.js'
import { LifecyclePhase, registerWorkbenchContribution2, WorkbenchPhase } from '../../common/lifecycle.js'
import { IActivityBarService } from '../../services/activityBar/common/activityBarService.js'

// KiloCode imports - using the copied source files
// These will be imported after the extension is properly integrated
// import { KiloConnectionService } from './services/cli-backend'
// import { registerAutocompleteProvider } from './services/autocomplete'
// etc.

/**
 * KiloCode Workbench Contribution
 * 
 * This integrates KiloCode directly into VS Code's workbench as a built-in
 * contribution, making it available immediately on startup without requiring
 * an external extension activation.
 */
export class KiloCodeWorkbenchContribution {
  static readonly ID = 'workbench.contrib.kilocode'
  
  constructor(
    @IInstantiationService private readonly instantiationService: IInstantiationService,
    @IWorkbenchLayoutService private readonly layoutService: IWorkbenchLayoutService,
    @IConfigurationService private readonly configurationService: IConfigurationService,
    @IActivityBarService private readonly activityBarService: IActivityBarService
  ) {
    this.initialize()
  }

  private async initialize(): Promise<void> {
    // Register KiloCode as available
    console.log('[KiloCode] Workbench contribution initializing...')
    
    // Initialize KiloCode services here
    // This is where we'd wire up KiloCode's services to VS Code's DI container
  }

  /**
   * Open KiloCode sidebar
   */
  openSidebar(): void {
    this.layoutService.sideBar.setVisible(true)
    // Focus on KiloCode view
  }

  /**
   * Toggle KiloCode sidebar
   */
  toggleSidebar(): void {
    const visible = this.layoutService.isVisible(Parts.SIDEBAR_PART)
    this.layoutService.setPartHidden(visible, Parts.SIDEBAR_PART)
  }
}

// Register as workbench contribution
registerWorkbenchContribution2(
  KiloCodeWorkbenchContribution.ID,
  KiloCodeWorkbenchContribution,
  WorkbenchPhase.AfterRestored
)

// ============================================================================
// Commands
// ============================================================================

// Open KiloCode
registerAction2(class KiloCodeOpenAction extends Action2 {
  constructor() {
    super({
      id: 'kilocode.open',
      title: { value: 'Open KiloCode', original: 'Open KiloCode' },
      category: 'KiloCode',
      icon: '$(kilo-icon)',
      precondition: ContextKeyExpr.equals('config.kilocode.enabled', true)
    })
  }

  run(accessor: ServicesAccessor): void {
    const layoutService = accessor.get(IWorkbenchLayoutService)
    layoutService.sideBar.setVisible(true)
    // Emit event to focus KiloCode view
  }
})

// Toggle KiloCode
registerAction2(class KiloCodeToggleAction extends Action2 {
  constructor() {
    super({
      id: 'kilocode.toggle',
      title: { value: 'Toggle KiloCode', original: 'Toggle KiloCode' },
      category: 'KiloCode',
      icon: '$(kilo-icon)'
    })
  }

  run(accessor: ServicesAccessor): void {
    const layoutService = accessor.get(IWorkbenchLayoutService)
    const visible = layoutService.isVisible(Parts.SIDEBAR_PART)
    layoutService.setPartHidden(visible, Parts.SIDEBAR_PART)
  }
})

// ============================================================================
// Keybindings
// ============================================================================

// Primary: Open KiloCode
KeybindingsRegistry.registerKeybinding({
  id: 'kilocode.open',
  weight: KeybindingWeight.WorkbenchContrib,
  when: ContextKeyExpr.editorTextFocus,
  primary: KeyChord(KeyMod.CtrlCmd | KeyMod.Shift, KeyCode.KeyI)
})

// ============================================================================
// Activity Bar Icon
// ============================================================================

// The KiloCode icon in the activity bar will be registered here
// This replaces the need for an external extension's package.json contribution

// ============================================================================
// Configuration
// ============================================================================

// KiloCode configuration settings
// These will be merged into VS Code's configuration system

export const KILO_CONFIGURATION_ID = 'kilocode'

// Default settings
export const KILO_DEFAULT_SETTINGS = {
  enabled: true,
  defaultProvider: 'anthropic',
  defaultModel: 'claude-sonnet-4',
  autocompleteEnabled: true,
  multiAgentEnabled: true,
  browserEnabled: true,
  telemetryEnabled: true
}

// ============================================================================
// View Container Registration
// ============================================================================

// This replaces extension's package.json viewContainers contribution
// The KiloCode sidebar will be registered as a built-in view container

/*
In workbench.common.main.ts, we would add:

import './contrib/kilocode/kilocode.contribution.js'

// Or in the view container registry:

const kilocodeViewContainer = Registry.as<IViewContainersRegistry>(ViewExtensions.ViewContainersRegistry).registerViewContainer({
  id: 'kilocode.view.container',
  title: localize('kilocode.view.container.title', 'KiloCode'),
  icon: '$(kilo-icon)',
  order: 4,
  ctorDescriptor: new SyncDescriptor(KiloCodeSidebarViewContainer),
  storageId: 'kilocode.sidebar'
}, ViewContainerLocation.Sidebar)

*/

// ============================================================================
// Exports for other workbench components
// ============================================================================

export { KiloCodeWorkbenchContribution }
