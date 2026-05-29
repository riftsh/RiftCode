/*---------------------------------------------------------------------------------------------
 *  Diff View - Side-by-side diff viewer for PRs
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode'

interface PullRequest {
  number: number
  title: string
  author: string
  base: string
  head: string
}

export class DiffView {
  private webview: vscode.WebviewPanel | null = null

  constructor(private diff: string, private pr: PullRequest) {
    this.show()
  }

  /**
   * Show diff view
   */
  show(): void {
    this.webview = vscode.window.createWebviewPanel(
      'pr-review.diff',
      `PR #${this.pr.number}: ${this.pr.title}`,
      vscode.ViewColumn.Two,
      { enableScripts: true }
    )

    this.webview.webview.html = this.generateHTML()
  }

  /**
   * Generate diff view HTML
   */
  private generateHTML(): string {
    const files = this.parseDiffFiles()

    const filesHTML = files.map(file => `
      <div class="diff-file">
        <div class="file-header ${file.status}">
          <span class="file-status">${file.status}</span>
          <span class="file-name">${file.filename}</span>
          <span class="file-stats">+${file.additions} -${file.deletions}</span>
        </div>
        <div class="diff-content">
          ${this.generateDiffContent(file)}
        </div>
      </div>
    `).join('')

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: var(--vscode-font-family); padding: 0; margin: 0; background: var(--vscode-editor-background); color: var(--vscode-foreground); }
          .toolbar { display: flex; gap: 8px; padding: 12px; background: var(--vscode-sideBar-background); border-bottom: 1px solid var(--vscode-editorWidget-border); }
          .toolbar button { padding: 6px 12px; background: var(--vscode-button-background); border: none; color: var(--vscode-button-foreground); border-radius: 4px; cursor: pointer; }
          .toolbar button:hover { background: var(--vscode-button-hoverBackground); }
          .diff-file { margin-bottom: 16px; }
          .file-header { display: flex; align-items: center; gap: 8px; padding: 8px 12px; background: var(--vscode-sideBarSectionHeader-background); border-bottom: 1px solid var(--vscode-editorWidget-border); }
          .file-header.added { border-left: 3px solid #28a745; }
          .file-header.modified { border-left: 3px solid #ffc107; }
          .file-header.deleted { border-left: 3px solid #dc3545; }
          .file-status { font-size: 10px; text-transform: uppercase; padding: 2px 6px; border-radius: 3px; background: var(--vscode-badge-background); }
          .file-name { flex: 1; font-weight: 500; }
          .file-stats { font-size: 12px; color: var(--vscode-foreground); opacity: 0.7; }
          .diff-content { font-family: var(--vscode-editor-font-family); font-size: 12px; overflow-x: auto; }
          .diff-line { display: flex; }
          .diff-line.add { background: rgba(40, 167, 69, 0.1); }
          .diff-line.delete { background: rgba(220, 53, 69, 0.1); }
          .line-num { width: 50px; padding: 2px 8px; text-align: right; color: var(--vscode-foreground); opacity: 0.5; user-select: none; background: var(--vscode-editorLineNumber-foreground); background: rgba(0,0,0,0.1); }
          .line-content { flex: 1; padding: 2px 8px; white-space: pre; }
          .add-indicator { color: #28a745; margin-right: 8px; }
          .delete-indicator { color: #dc3545; margin-right: 8px; }
          .ai-actions { display: none; padding: 8px; background: var(--vscode-toolbar-hoverBackground); }
          .ai-actions button { margin-right: 8px; }
        </style>
      </head>
      <body>
        <div class="toolbar">
          <button onclick="aiReview()">🤖 AI Review</button>
          <button onclick="aiExplain()">💡 AI Explain</button>
          <button onclick="securityScan()">🔒 Security Scan</button>
          <button onclick="addComment()">💬 Comment</button>
        </div>
        <div class="diff-files">
          ${filesHTML}
        </div>
        <script>
          const vscode = acquireVsCodeApi();
          function aiReview() { vscode.postMessage({ type: 'aiReview' }); }
          function aiExplain() { vscode.postMessage({ type: 'aiExplain' }); }
          function securityScan() { vscode.postMessage({ type: 'securityScan' }); }
          function addComment() { vscode.postMessage({ type: 'addComment' }); }
        </script>
      </body>
      </html>
    `
  }

  /**
   * Parse diff into file objects
   */
  private parseDiffFiles(): any[] {
    const files: any[] = []
    const chunks = this.diff.split(/^diff --git /m).filter(Boolean)

    for (const chunk of chunks) {
      const lines = chunk.split('\n')
      const headerMatch = lines[0].match(/a\/(.+?) b\/(.+)/)
      if (!headerMatch) continue

      const filename = headerMatch[2]
      let status = 'modified'
      let additions = 0
      let deletions = 0

      if (chunk.includes('new file mode')) status = 'added'
      if (chunk.includes('deleted file mode')) status = 'deleted'

      const statMatch = chunk.match(/(\\d+) insertions?\\(\\+\\)/)
      if (statMatch) additions = parseInt(statMatch[1], 10)

      const delMatch = chunk.match(/(\\d+) deletions?\\(\\-\\)/)
      if (delMatch) deletions = parseInt(delMatch[1], 10)

      files.push({ filename, status, additions, deletions, chunk })
    }

    return files
  }

  /**
   * Generate HTML for diff content
   */
  private generateDiffContent(file: any): string {
    const lines = file.chunk.split('\n')
    let html = ''
    let oldLine = 0
    let newLine = 0

    for (const line of lines) {
      if (line.startsWith('@@')) {
        const match = line.match(/@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/)
        if (match && match.length >= 3) {
          oldLine = parseInt(match[1], 10)
          newLine = parseInt(match[3], 10)
          html += `<div class="diff-line hunk-header"><span class="line-content">${line}</span></div>`
        }
      } else if (line.startsWith('+')) {
        html += `<div class="diff-line add"><span class="line-num">${newLine++}</span><span class="line-content"><span class="add-indicator">+</span>${this.escapeHtml(line.substring(1))}</span></div>`
      } else if (line.startsWith('-')) {
        html += `<div class="diff-line delete"><span class="line-num">${oldLine++}</span><span class="line-content"><span class="delete-indicator">-</span>${this.escapeHtml(line.substring(1))}</span></div>`
      } else if (line.startsWith(' ')) {
        html += `<div class="diff-line"><span class="line-num">${oldLine++}</span><span class="line-num">${newLine++}</span><span class="line-content">${this.escapeHtml(line.substring(1))}</span></div>`
      }
    }

    return html
  }

  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
  }

  /**
   * Dispose
   */
  dispose(): void {
    this.webview?.dispose()
  }
}