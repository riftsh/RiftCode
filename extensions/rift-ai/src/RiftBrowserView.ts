/*---------------------------------------------------------------------------------------------
 *  RiftBrowserView - Built-in Chromium browser panel for RiftCode
 *  Provides a full browser experience using VS Code's WebView + iframe
 *--------------------------------------------------------------------------------------------*/

import * as vscode from "vscode"
import { generateUuid } from "./util/uuid"

export interface BrowserShowOptions {
  readonly preserveFocus?: boolean
  readonly viewColumn?: vscode.ViewColumn
}

export class RiftBrowserView extends vscode.Disposable {
  public static readonly viewType = "riftcode.browser.view"
  private static readonly title = "RiftBrowser"

  private static getWebviewOptions(extensionUri: vscode.Uri): vscode.WebviewOptions {
    return {
      enableScripts: true,
      enableForms: true,
      localResourceRoots: [vscode.Uri.joinPath(extensionUri, "media")],
    }
  }

  private readonly _webviewPanel: vscode.WebviewPanel
  private readonly _onDidDispose = this._register(new vscode.EventEmitter<void>())
  public readonly onDispose = this._onDidDispose.event

  private history: string[] = []
  private historyIndex: number = -1

  public static create(
    extensionUri: vscode.Uri,
    url: string = "https://www.google.com",
    showOptions?: BrowserShowOptions
  ): RiftBrowserView {
    const webview = vscode.window.createWebviewPanel(
      RiftBrowserView.viewType,
      RiftBrowserView.title,
      {
        viewColumn: showOptions?.viewColumn ?? vscode.ViewColumn.Two,
        preserveFocus: showOptions?.preserveFocus,
      },
      {
        retainContextWhenHidden: true,
        ...RiftBrowserView.getWebviewOptions(extensionUri),
      }
    )
    return new RiftBrowserView(extensionUri, url, webview)
  }

  public static restore(
    extensionUri: vscode.Uri,
    url: string,
    webviewPanel: vscode.WebviewPanel
  ): RiftBrowserView {
    return new RiftBrowserView(extensionUri, url, webviewPanel)
  }

  private constructor(
    private readonly extensionUri: vscode.Uri,
    url: string,
    webviewPanel: vscode.WebviewPanel
  ) {
    super()

    this._webviewPanel = this._register(webviewPanel)
    this._webviewPanel.webview.options = RiftBrowserView.getWebviewOptions(extensionUri)

    // Handle messages from the webview
    this._register(
      this._webviewPanel.webview.onDidReceiveMessage(async (msg) => {
        switch (msg.type) {
          case "navigate":
            this.navigate(msg.url)
            break
          case "goBack":
            this.goBack()
            break
          case "goForward":
            this.goForward()
            break
          case "reload":
            this.reload()
            break
          case "openExternal":
            try {
              const uri = vscode.Uri.parse(msg.url)
              await vscode.env.openExternal(uri)
            } catch {
              // Invalid URL
            }
            break
          case "urlChanged":
            this.onUrlChanged(msg.url)
            break
        }
      })
    )

    this._register(
      this._webviewPanel.onDidDispose(() => {
        this.dispose()
      })
    )

    // Set up the browser UI
    this.show(url)
  }

  public show(url: string, options?: BrowserShowOptions): void {
    this._webviewPanel.webview.html = this.getHtml(url)
    this._webviewPanel.reveal(options?.viewColumn, options?.preserveFocus)
  }

  public navigate(url: string): void {
    // Add to history
    if (this.historyIndex < this.history.length - 1) {
      // Clear forward history when navigating to new URL
      this.history = this.history.slice(0, this.historyIndex + 1)
    }
    this.history.push(url)
    this.historyIndex = this.history.length - 1
    this.show(url)
  }

  public goBack(): void {
    if (this.historyIndex > 0) {
      this.historyIndex--
      this.show(this.history[this.historyIndex])
    }
  }

  public goForward(): void {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++
      this.show(this.history[this.historyIndex])
    }
  }

  public reload(): void {
    if (this.historyIndex >= 0 && this.historyIndex < this.history.length) {
      this.show(this.history[this.historyIndex])
    }
  }

  public canGoBack(): boolean {
    return this.historyIndex > 0
  }

  public canGoForward(): boolean {
    return this.historyIndex < this.history.length - 1
  }

  public getCurrentUrl(): string {
    return this.history[this.historyIndex] || ""
  }

  private onUrlChanged(url: string): void {
    // Update history if the iframe navigated (e.g., via link click)
    if (url !== this.history[this.historyIndex]) {
      if (this.historyIndex < this.history.length - 1) {
        this.history = this.history.slice(0, this.historyIndex + 1)
      }
      this.history.push(url)
      this.historyIndex = this.history.length - 1
    }
  }

  private getHtml(url: string): string {
    const nonce = generateUuid()

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="
    default-src 'none';
    font-src 'self' data:;
    style-src 'self' 'unsafe-inline';
    script-src 'nonce-${nonce}';
    frame-src *;
    img-src * data:;
    connect-src *;
  ">
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    body {
      display: flex;
      flex-direction: column;
      height: 100vh;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #1e1e1e;
      color: #ccc;
    }
    
    .toolbar {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      background: #252526;
      border-bottom: 1px solid #3c3c3c;
    }
    
    .nav-btn {
      width: 32px;
      height: 32px;
      border: none;
      background: transparent;
      color: #ccc;
      border-radius: 4px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
    }
    
    .nav-btn:hover:not(:disabled) {
      background: #3c3c3c;
    }
    
    .nav-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
    
    .url-bar {
      flex: 1;
      display: flex;
      align-items: center;
      background: #3c3c3c;
      border-radius: 4px;
      padding: 0 12px;
      height: 32px;
    }
    
    .url-input {
      flex: 1;
      background: transparent;
      border: none;
      color: #ccc;
      font-size: 13px;
      outline: none;
      font-family: inherit;
    }
    
    .url-input::placeholder {
      color: #6e6e6e;
    }
    
    .security-indicator {
      color: #4ec9b0;
      margin-right: 8px;
      font-size: 12px;
    }
    
    .action-btn {
      padding: 6px 12px;
      border: none;
      background: #0e639c;
      color: white;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
    }
    
    .action-btn:hover {
      background: #1177bb;
    }
    
    .content {
      flex: 1;
      background: white;
    }
    
    iframe {
      width: 100%;
      height: 100%;
      border: none;
    }
    
    .loading {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: #ccc;
    }
  </style>
</head>
<body>
  <div class="toolbar">
    <button class="nav-btn" id="backBtn" title="Back" disabled>◀</button>
    <button class="nav-btn" id="forwardBtn" title="Forward" disabled>▶</button>
    <button class="nav-btn" id="reloadBtn" title="Reload">↻</button>
    <div class="url-bar">
      <span class="security-indicator">🔒</span>
      <input type="text" class="url-input" id="urlInput" placeholder="Enter URL or search..." />
    </div>
    <button class="nav-btn" id="externalBtn" title="Open in external browser">↗</button>
  </div>
  <div class="content">
    <iframe id="browserFrame" sandbox="allow-scripts allow-forms allow-same-origin allow-downloads allow-popups"></iframe>
  </div>

  <script nonce="${nonce}">
    const vscode = acquireVsCodeApi();
    const frame = document.getElementById('browserFrame');
    const urlInput = document.getElementById('urlInput');
    const backBtn = document.getElementById('backBtn');
    const forwardBtn = document.getElementById('forwardBtn');
    const reloadBtn = document.getElementById('reloadBtn');
    const externalBtn = document.getElementById('externalBtn');
    
    let currentUrl = '';
    
    // Navigate to URL
    function navigate(url) {
      if (!url) return;
      
      // Add protocol if missing
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        if (url.includes('.') && !url.includes(' ')) {
          url = 'https://' + url;
        } else {
          url = 'https://www.google.com/search?q=' + encodeURIComponent(url);
        }
      }
      
      currentUrl = url;
      urlInput.value = url;
      frame.src = url;
    }
    
    // Handle URL input submit
    urlInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        navigate(urlInput.value);
      }
    });
    
    // Navigation buttons
    backBtn.addEventListener('click', () => {
      vscode.postMessage({ type: 'goBack' });
    });
    
    forwardBtn.addEventListener('click', () => {
      vscode.postMessage({ type: 'goForward' });
    });
    
    reloadBtn.addEventListener('click', () => {
      vscode.postMessage({ type: 'reload' });
    });
    
    externalBtn.addEventListener('click', () => {
      vscode.postMessage({ type: 'openExternal', url: currentUrl });
    });
    
    // Listen for messages from extension
    window.addEventListener('message', (event) => {
      const msg = event.data;
      if (msg.type === 'navigate') {
        navigate(msg.url);
      } else if (msg.type === 'updateHistory') {
        backBtn.disabled = !msg.canGoBack;
        forwardBtn.disabled = !msg.canGoForward;
      }
    });
    
    // Track URL changes in iframe
    frame.addEventListener('load', () => {
      try {
        const url = frame.contentWindow.location.href;
        if (url !== currentUrl) {
          currentUrl = url;
          urlInput.value = url;
          vscode.postMessage({ type: 'urlChanged', url: url });
        }
      } catch (e) {
        // Cross-origin, can't read URL
      }
      vscode.postMessage({ type: 'updateHistory' });
    });
    
    // Initial navigation
    navigate('${this.escapeJs(url)}');
  </script>
</body>
</html>`
  }

  private escapeJs(str: string): string {
    return str.replace(/\\/g, "\\\\").replace(/'/g, "\\'").replace(/"/g, '\\"')
  }

  public override dispose(): void {
    this._onDidDispose.fire()
    super.dispose()
  }
}