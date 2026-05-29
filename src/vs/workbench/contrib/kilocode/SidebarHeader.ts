/*---------------------------------------------------------------------------------------------
 *  SidebarHeader - Header component for RiftAI sidebar with AI chat and browser buttons
 *  Provides the toolbar with globe icon for browser and chat icon for AI
 *--------------------------------------------------------------------------------------------*/

import * as vscode from "vscode"
import { RiftBrowserService } from "../services/RiftBrowserService"

export interface SidebarHeaderOptions {
  extensionUri: vscode.Uri
  browserService: RiftBrowserService
}

export class SidebarHeader implements vscode.Disposable {
  private disposables: vscode.Disposable[] = []

  constructor(
    private readonly extensionUri: vscode.Uri,
    private readonly browserService: RiftBrowserService
  ) {
    this.registerCommands()
  }

  /**
   * Register commands for the sidebar header buttons
   */
  private registerCommands(): void {
    // Open AI chat (default behavior)
    const openChat = vscode.commands.registerCommand("riftcode.sidebar.openChat", () => {
      vscode.commands.executeCommand("workbench.view.extension.rift-ai-ActivityBar")
    })
    this.disposables.push(openChat)

    // Toggle between chat and browser views
    const toggleView = vscode.commands.registerCommand("riftcode.sidebar.toggleView", async () => {
      // Check if RiftAI sidebar is active, if not activate it
      const currentView = vscode.window.activeColorTheme.kind === vscode.ColorThemeKind.Dark ? "dark" : "light"
      
      // Show the sidebar first
      await vscode.commands.executeCommand("workbench.view.extension.rift-ai-ActivityBar")
    })
    this.disposables.push(toggleView)
  }

  /**
   * Get the header items for the sidebar title menu
   */
  public static getHeaderItems(): Array<{
    id: string
    label: string
    icon: string
    command: string
  }> {
    return [
      {
        id: "chat",
        label: "RiftAI Chat",
        icon: "$(chat)",
        command: "riftcode.sidebar.openChat",
      },
      {
        id: "browser",
        label: "RiftBrowser",
        icon: "$(globe)",
        command: "riftcode.browser.open",
      },
    ]
  }

  /**
   * Open the browser from the sidebar header
   */
  public openBrowser(): void {
    this.browserService.openBrowser()
  }

  dispose(): void {
    for (const d of this.disposables) {
      d.dispose()
    }
    this.disposables = []
  }
}

/**
 * Create a composite bar action for the browser button
 * This can be added to the activity bar next to the RiftAI icon
 */
export function createBrowserAction(): vscode.Action {
  const action = new vscode.Action(
    "riftcode.browser",
    "RiftBrowser",
    "$(globe)",
    true
  )
  action.tooltip = "Open RiftBrowser - Built-in Chromium Browser"
  action.description = "Opens the built-in browser powered by Chromium"
  
  action.onClick(() => {
    vscode.commands.executeCommand("riftcode.browser.open")
  })

  return action
}

/**
 * Register the browser as a ViewContainer in the sidebar
 */
export function registerBrowserViewContainer(context: vscode.ExtensionContext): void {
  // The browser is a panel, not a sidebar view
  // This function is here for potential future expansion
  const browserService = new RiftBrowserService(context.extensionUri)
  context.subscriptions.push(browserService)
}