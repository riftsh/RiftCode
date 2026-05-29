/*---------------------------------------------------------------------------------------------
 *  PR List View - Main sidebar view showing pull requests
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode'

interface PullRequest {
  id: string
  number: number
  title: string
  author: string
  state: 'open' | 'closed' | 'merged'
  labels: string[]
  createdAt: string
}

export class PRListView {
  private webview: vscode.WebviewPanel | null = null

  /**
   * Show PR list in webview
   */
  show(pullRequests: PullRequest[]): void {
    if (this.webview) {
      this.webview.reveal(vscode.ViewColumn.One, true)
      this.webview.webview.html = this.generateHTML(pullRequests)
      return
    }

    this.webview = vscode.window.createWebviewPanel(
      'pr-review.list',
      'Pull Requests',
      vscode.ViewColumn.One,
      { enableScripts: true }
    )

    this.webview.webview.html = this.generateHTML(pullRequests)

    this.webview.onDidDispose(() => {
      this.webview = null
    })
  }

  /**
   * Generate HTML for PR list
   */
  private generateHTML(prs: PullRequest[]): string {
    const prItems = prs.map(pr => `
      <div class="pr-item ${pr.state}" onclick="selectPR(${pr.number})">
        <div class="pr-header">
          <span class="pr-number">#${pr.number}</span>
          <span class="pr-state state-${pr.state}">${pr.state}</span>
        </div>
        <div class="pr-title">${pr.title}</div>
        <div class="pr-meta">
          <span class="pr-author">${pr.author}</span>
          <span class="pr-date">${this.formatDate(pr.createdAt)}</span>
        </div>
        ${pr.labels.length > 0 ? `<div class="pr-labels">${pr.labels.map(l => `<span class="label">${l}</span>`).join('')}</div>` : ''}
      </div>
    `).join('')

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: var(--vscode-font-family); padding: 16px; background: var(--vscode-editor-background); color: var(--vscode-foreground); }
          h1 { font-size: 16px; margin-bottom: 16px; }
          .pr-item { padding: 12px; margin-bottom: 8px; border: 1px solid var(--vscode-editorWidget-border); border-radius: 4px; cursor: pointer; }
          .pr-item:hover { background: var(--vscode-toolbar-hoverBackground); }
          .pr-item.open { border-left: 3px solid #28a745; }
          .pr-item.closed, .pr-item.merged { border-left: 3px solid #dc3545; }
          .pr-header { display: flex; justify-content: space-between; margin-bottom: 4px; }
          .pr-number { font-weight: bold; color: var(--vscode-textLink-foreground); }
          .pr-state { font-size: 11px; padding: 2px 6px; border-radius: 3px; }
          .state-open { background: #28a745; color: white; }
          .state-closed, .state-merged { background: #dc3545; color: white; }
          .pr-title { font-size: 14px; margin-bottom: 4px; }
          .pr-meta { font-size: 11px; color: var(--vscode-foreground); opacity: 0.7; }
          .pr-labels { margin-top: 8px; display: flex; gap: 4px; flex-wrap: wrap; }
          .label { font-size: 10px; padding: 2px 6px; background: var(--vscode-badge-background); border-radius: 3px; }
        </style>
      </head>
      <body>
        <h1>🔀 Pull Requests (${prs.length})</h1>
        <div class="pr-list">${prItems}</div>
        <script>
          function selectPR(number) {
            vscode.postMessage({ type: 'selectPR', number });
          }
        </script>
      </body>
      </html>
    `
  }

  private formatDate(dateStr: string): string {
    const date = new Date(dateStr)
    return date.toLocaleDateString()
  }
}