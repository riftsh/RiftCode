/*---------------------------------------------------------------------------------------------
 *  AI Review Panel - Shows AI analysis results
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode'

interface AIReviewIssue {
  type: 'bug' | 'security' | 'performance' | 'style' | 'best-practice'
  severity: 'critical' | 'high' | 'medium' | 'low'
  file: string
  line: number
  message: string
  suggestion?: string
}

interface AIReviewResult {
  summary: string
  issues: AIReviewIssue[]
  statistics: {
    filesReviewed: number
    linesAdded: number
    linesDeleted: number
    issuesFound: number
    critical: number
    high: number
    medium: number
    low: number
  }
}

export class AIReviewPanel {
  private panel: vscode.WebviewPanel | null = null

  /**
   * Show AI review results
   */
  showResults(result: AIReviewResult): void {
    if (this.panel) {
      this.panel.reveal(vcode.ViewColumn.Two, true)
      this.panel.webview.html = this.generateHTML(result)
      return
    }

    this.panel = vscode.window.createWebviewPanel(
      'pr-review.aiReview',
      '🤖 AI Code Review',
      { viewColumn: vscode.ViewColumn.Two, preserveFocus: true },
      { enableScripts: true }
    )

    this.panel.webview.html = this.generateHTML(result)

    this.panel.onDidDispose(() => {
      this.panel = null
    })
  }

  /**
   * Generate HTML for review results
   */
  private generateHTML(result: AIReviewResult): string {
    const severityIcons: Record<string, string> = {
      critical: '🔴',
      high: '🟠',
      medium: '🟡',
      low: '🟢'
    }

    const typeIcons: Record<string, string> = {
      bug: '🐛',
      security: '🔒',
      performance: '⚡',
      style: '🎨',
      'best-practice': '✨'
    }

    const issuesHTML = result.issues.map(issue => `
      <div class="issue ${issue.severity}" onclick="jumpToIssue('${issue.file}', ${issue.line})">
        <div class="issue-header">
          <span class="issue-severity">${severityIcons[issue.severity]} ${issue.severity}</span>
          <span class="issue-type">${typeIcons[issue.type] || '📝'} ${issue.type}</span>
        </div>
        <div class="issue-message">${issue.message}</div>
        <div class="issue-location">${issue.file}:${issue.line}</div>
        ${issue.suggestion ? `<div class="issue-suggestion">💡 ${issue.suggestion}</div>` : ''}
        <div class="issue-actions">
          <button onclick="event.stopPropagation(); aiFix('${this.escapeAttr(issue.message)}')">🔧 Fix with AI</button>
          <button onclick="event.stopPropagation(); ignoreIssue()">✓ Ignore</button>
        </div>
      </div>
    `).join('')

    const statsHTML = `
      <div class="stats">
        <div class="stat">
          <span class="stat-value">${result.statistics.filesReviewed}</span>
          <span class="stat-label">Files</span>
        </div>
        <div class="stat">
          <span class="stat-value add">+${result.statistics.linesAdded}</span>
          <span class="stat-label">Added</span>
        </div>
        <div class="stat">
          <span class="stat-value delete">-${result.statistics.linesDeleted}</span>
          <span class="stat-label">Deleted</span>
        </div>
        <div class="stat">
          <span class="stat-value">${result.statistics.issuesFound}</span>
          <span class="stat-label">Issues</span>
        </div>
      </div>
      <div class="severity-stats">
        <span class="severity-badge critical">🔴 ${result.statistics.critical} Critical</span>
        <span class="severity-badge high">🟠 ${result.statistics.high} High</span>
        <span class="severity-badge medium">🟡 ${result.statistics.medium} Medium</span>
        <span class="severity-badge low">🟢 ${result.statistics.low} Low</span>
      </div>
    `

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: var(--vscode-font-family); padding: 0; margin: 0; background: var(--vscode-editor-background); color: var(--vscode-foreground); }
          .header { padding: 16px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
          .header h1 { margin: 0 0 8px 0; font-size: 18px; }
          .summary { font-size: 13px; opacity: 0.9; line-height: 1.5; }
          .stats { display: flex; gap: 16px; padding: 16px; background: var(--vscode-sideBar-background); border-bottom: 1px solid var(--vscode-editorWidget-border); }
          .stat { text-align: center; }
          .stat-value { display: block; font-size: 24px; font-weight: bold; }
          .stat-value.add { color: #28a745; }
          .stat-value.delete { color: #dc3545; }
          .stat-label { font-size: 11px; opacity: 0.7; }
          .severity-stats { display: flex; gap: 8px; padding: 8px 16px; background: var(--vscode-sideBarSectionHeader-background); flex-wrap: wrap; }
          .severity-badge { font-size: 11px; padding: 4px 8px; border-radius: 4px; background: var(--vscode-badge-background); }
          .severity-badge.critical { color: #dc3545; }
          .severity-badge.high { color: #fd7e14; }
          .severity-badge.medium { color: #ffc107; }
          .severity-badge.low { color: #28a745; }
          .issues-header { padding: 12px 16px; background: var(--vscode-sideBarSectionHeader-background); font-weight: 600; }
          .issues-list { padding: 8px; }
          .issue { padding: 12px; margin-bottom: 8px; border-radius: 6px; cursor: pointer; border: 1px solid var(--vscode-editorWidget-border); background: var(--vscode-sideBar-background); transition: all 0.2s; }
          .issue:hover { background: var(--vscode-toolbar-hoverBackground); transform: translateX(4px); }
          .issue.critical { border-left: 4px solid #dc3545; }
          .issue.high { border-left: 4px solid #fd7e14; }
          .issue.medium { border-left: 4px solid #ffc107; }
          .issue.low { border-left: 4px solid #28a745; }
          .issue-header { display: flex; gap: 8px; margin-bottom: 8px; }
          .issue-severity, .issue-type { font-size: 11px; padding: 2px 6px; border-radius: 3px; background: var(--vscode-badge-background); }
          .issue-message { font-size: 13px; margin-bottom: 4px; }
          .issue-location { font-size: 11px; color: var(--vscode-textLink-foreground); }
          .issue-suggestion { font-size: 12px; margin-top: 8px; padding: 8px; background: rgba(102, 126, 234, 0.1); border-radius: 4px; }
          .issue-actions { display: flex; gap: 8px; margin-top: 8px; }
          .issue-actions button { padding: 4px 8px; font-size: 11px; border: none; border-radius: 4px; cursor: pointer; background: var(--vscode-button-background); color: var(--vscode-button-foreground); }
          .issue-actions button:hover { background: var(--vscode-button-hoverBackground); }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🤖 AI Code Review</h1>
          <div class="summary">${result.summary}</div>
        </div>
        ${statsHTML}
        <div class="issues-header">Issues Found (${result.issues.length})</div>
        <div class="issues-list">
          ${issuesHTML}
        </div>
        <script>
          const vscode = acquireVsCodeApi();
          
          function jumpToIssue(file, line) {
            vscode.postMessage({ type: 'jumpToIssue', file, line });
          }
          
          function aiFix(message) {
            vscode.postMessage({ type: 'aiFix', message });
          }
          
          function ignoreIssue() {
            vscode.postMessage({ type: 'ignoreIssue' });
          }
        </script>
      </body>
      </html>
    `
  }

  private escapeAttr(text: string): string {
    return text.replace(/'/g, "\\'").replace(/"/g, '\\"')
  }

  /**
   * Dispose
   */
  dispose(): void {
    this.panel?.dispose()
  }
}

// Fix: Use vscode, not vcode
import * as vcode from 'vscode'
const vscode = vcode