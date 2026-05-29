/*---------------------------------------------------------------------------------------------
 *  KiloCode Contribution - Entry point for built-in KiloCode
 *  This registers KiloCode as a first-class workbench contribution
 *--------------------------------------------------------------------------------------------*/

import { URI } from '../../../base/common/uri.js'
import { IInstantiationService } from '../../../platform/instantiation/common/instantiation.js'
import { Registry } from '../../../platform/registry/common/platform.js'
import { Extensions, IViewsRegistry, IViewContainersRegistry } from '../../common/viewContainer.js'
import { IViewsService } from '../../services/views/common/viewsService.js'
import { SyncDescriptor } from '../../../platform/instantiation/common/instantiation.js'
import { ContextKeyExpr } from '../../../platform/contextkey/common/contextkey.js'
import { localize2 } from '../../../../nls.js'
import { ViewContainer, ViewContainerLocation, IViewDescriptor } from '../../common/views.js'
import { Disposable } from '../../../base/common/lifecycle.js'

// ============================================================================
// View Container Registration
// ============================================================================

/**
 * KiloCode Sidebar View Container
 * Registers KiloCode as a view container in the sidebar
 */
export const KILO_VIEW_CONTAINER_ID = 'kilocode.sidebar'

export const KiloCodeViewContainer: ViewContainer = {
  id: KILO_VIEW_CONTAINER_ID,
  title: localize2('kilocode.view.container.title', 'KiloCode'),
  icon: undefined, // Will use codicon
  iconClass: 'codicon codicon-robot',
  storageId: KILO_VIEW_CONTAINER_ID,
  hideIfEmpty: true,
  order: 5, // After Explorer, Search, Git
  ctorDescriptor: new SyncDescriptor(KiloCodeSidebarViewContainer),
  canToggleVisibility: true,
  focusCommand: {
    id: 'kilocode.open',
    keybindings: {
      primary: 2048 | 512 | 73 // Ctrl+Shift+I
    }
  }
}

// ============================================================================
// KiloCode Sidebar View Container
// ============================================================================

export class KiloCodeSidebarViewContainer extends Disposable {
  constructor(
    @IInstantiationService private readonly instantiationService: IInstantiationService,
    @IViewsService private readonly viewsService: IViewsService
  ) {
    super()
    this.registerViews()
    this.registerActions()
  }

  private registerViews(): void {
    // Register KiloCode views
    // These would be the chat view, agent manager view, etc.
  }

  private registerActions(): void {
    // Register view-specific actions
  }

  /**
   * Override to return proper layout
   */
  getLayout(): any {
    return {
      minimumWidth: 400,
      maximumWidth: 800,
      minimumHeight: 300,
      priority: 'normal' as const
    }
  }
}

// ============================================================================
// Workbench Common Main Integration
// ============================================================================

/**
 * This file should be imported from workbench.common.main.ts
 * to register KiloCode as a built-in contribution.
 * 
 * Add this line to workbench.common.main.ts:
 * import './contrib/kilocode/kilocode.contribution.js'
 */

// Register view container
Registry.as<IViewContainersRegistry>(Extensions.ViewContainersRegistry).registerViewContainer(
  KiloCodeViewContainer,
  ViewContainerLocation.Sidebar
)

// Register views under the container
Registry.as<IViewsRegistry>(Extensions.ViewsRegistry).registerViews([
  // Main KiloCode chat view
  {
    id: 'kilocode.chat',
    containerIcon: KiloCodeViewContainer.iconClass || 'codicon codicon-robot',
    containerTitle: KiloCodeViewContainer.title.value,
    name: localize2('kilocode.chat.view.title', 'Chat'),
    canToggleVisibility: false,
    canMoveView: true,
    ctorDescriptor: new SyncDescriptor(KiloCodeChatView),
    when: ContextKeyExpr.equals('config.kilocode.enabled', true)
  },
  // Agent Manager view
  {
    id: 'kilocode.agentManager',
    containerIcon: KiloCodeViewContainer.iconClass || 'codicon codicon-robot',
    containerTitle: KiloCodeViewContainer.title.value,
    name: localize2('kilocode.agentManager.view.title', 'Agents'),
    canToggleVisibility: true,
    canMoveView: true,
    ctorDescriptor: new SyncDescriptor(KiloCodeAgentManagerView),
    when: ContextKeyExpr.equals('config.kilocode.agentManagerEnabled', true)
  }
], KiloCodeViewContainer)

// ============================================================================
// View Placeholders (would be implemented with actual KiloCode components)
// ============================================================================

export class KiloCodeChatView {
  // Placeholder for actual KiloCode chat implementation
  // This would be wired up to KiloCode's RiftProvider
}

export class KiloCodeAgentManagerView {
  // Placeholder for actual KiloCode agent manager
  // This would be wired up to KiloCode's AgentManagerProvider
}

// ============================================================================
// Configuration
// ============================================================================

// Register KiloCode settings
Registry.as<any>('IConfigurationRegistry').registerConfiguration({
  id: 'kilocode',
  order: 100,
  properties: {
    'kilocode.enabled': {
      type: 'boolean',
      default: true,
      description: localize('kilocode.enabled', 'Enable KiloCode AI assistant')
    },
    'kilocode.agentManagerEnabled': {
      type: 'boolean',
      default: true,
      description: localize('kilocode.agentManagerEnabled', 'Enable agent manager view')
    },
    'kilocode.autocompleteEnabled': {
      type: 'boolean',
      default: true,
      description: localize('kilocode.autocompleteEnabled', 'Enable AI autocomplete')
    },
    'kilocode.defaultProvider': {
      type: 'string',
      default: 'anthropic',
      description: localize('kilocode.defaultProvider', 'Default AI provider')
    },
    'kilocode.defaultModel': {
      type: 'string',
      default: 'claude-sonnet-4',
      description: localize('kilocode.defaultModel', 'Default AI model')
    }
  }
})
