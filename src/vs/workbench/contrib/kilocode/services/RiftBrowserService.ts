/*---------------------------------------------------------------------------------------------
 *  RiftBrowserService - Manages the built-in browser panel for RiftCode
 *  Provides a globe icon button in the sidebar that opens a full browser view
 *--------------------------------------------------------------------------------------------*/

import * as vscode from "vscode"
import { RiftBrowserView } from "../RiftBrowserView"

export class RiftBrowserService implements vscode.Disposable {
  private browserView: RiftBrowserView | undefined
  private disposables: vscode.Disposable[] = []
  private isRegistered: boolean = false

  constructor(private readonly extensionUri: vscode.Uri) {
    this.registerCommands()
    this.registerViewSerializer()
  }

  /**
   * Register VS Code commands for browser functionality
   */
  private registerCommands(): void {
    // Main command to open browser
    const openBrowser = vscode.commands.registerCommand("riftcode.browser.open", (url?: string) => {
      this.openBrowser(url)
    })
    this.disposables.push(openBrowser)

    // Command to navigate to URL
    const navigateTo = vscode.commands.registerCommand("riftcode.browser.navigate", (url: string) => {
      this.navigate(url)
    })
    this.disposables.push(navigateTo)

    // Command to close browser
    const closeBrowser = vscode.commands.registerCommand("riftcode.browser.close", () => {
      this.closeBrowser()
    })
    this.disposables.push(closeBrowser)
  }

  /**
   * Register view serializer to restore browser state
   */
  private registerViewSerializer(): void {
    if (this.isRegistered) return

    // Restore browser panel when VS Code restarts
    vscode.window.registerWebviewPanelSerializer(RiftBrowserView.viewType, {
      async deserializeWebviewPanel(
        panel: vscode.WebviewPanel,
        state: { url?: string }
      ): Promise<void> {
        const url = state?.url || "https://www.google.com"
        this.browserView = RiftBrowserView.restore(this.extensionUri, url, panel)
      },
    })
    this.isRegistered = true
  }

  /**
   * Open the browser view
   */
  public openBrowser(url?: string): void {
    if (this.browserView) {
      // Show existing browser
      if (url) {
        this.browserView.navigate(url)
      } else {
        this.browserView.show(this.browserView.getCurrentUrl())
      }
    } else {
      // Create new browser view
      this.browserView = RiftBrowserView.create(
        this.extensionUri,
        url || "https://www.google.com"
      )

      // Clean up when disposed
      this.browserView.onDispose(() => {
        this.browserView = undefined
      })
    }
  }

  /**
   * Navigate the browser to a specific URL
   */
  public navigate(url: string): void {
    if (!this.browserView) {
      this.openBrowser(url)
    } else {
      this.browserView.navigate(url)
    }
  }

  /**
   * Close the browser view
   */
  public closeBrowser(): void {
    if (this.browserView) {
      this.browserView.dispose()
      this.browserView = undefined
    }
  }

  /**
   * Check if browser is currently open
   */
  public isOpen(): boolean {
    return this.browserView !== undefined
  }

  /**
   * Get current browser URL
   */
  public getCurrentUrl(): string {
    return this.browserView?.getCurrentUrl() || ""
  }

  dispose(): void {
    if (this.browserView) {
      this.browserView.dispose()
      this.browserView = undefined
    }
    for (const d of this.disposables) {
      d.dispose()
    }
    this.disposables = []
  }
}

/**
 * Get the globe icon (codicon-globe) for the browser button
 */
export function getBrowserIcon(): string {
  return "$(globe)"
}

/**
 * Get the browser button configuration
 */
export function getBrowserAction(): vscode.Command {
  return {
    command: "riftcode.browser.open",
    title: "Open Browser",
    icon: "$(globe)",
  }
}