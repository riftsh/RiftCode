/*---------------------------------------------------------------------------------------------
 *  PR Review Extension - AI-Powered Pull Request Review
 *  Review PRs in your editor with AI-powered analysis
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode'
import { GitHubService } from './services/githubService'
import { GitLabService } from './services/gitlabService'
import { DiffService } from './services/diffService'
import { AIReviewService } from './services/aiReviewService'
import { PRTreeProvider } from './providers/prTreeProvider'
import { PRListView } from './views/prListView'
import { DiffView } from './views/diffView'
import { AIReviewPanel } from './views/aiReviewPanel'

// ============================================================================
// Types
// ============================================================================

interface PullRequest {
  id: string
  number: number
  title: string
  description: string
  author: string
  authorAvatar: string
  state: 'open' | 'closed' | 'merged'
  base: string
  head: string
  repository: string
  url: string
  createdAt: string
  updatedAt: string
  additions: number
  deletions: number
  changedFiles: number
  labels: string[]
  reviewers: string[]
  comments: number
}

interface DiffFile {
  filename: string
  status: 'added' | 'modified' | 'deleted' | 'renamed'
  additions: number
  deletions: number
  patch?: string
  blobUrl: string
  contentsUrl: string
  rawUrl: string
}

interface AIReviewIssue {
  type: 'bug' | 'security' | 'performance' | 'style' | 'best-practice'
  severity: 'critical' | 'high' | 'medium' | 'low'
  file: string
  line: number
  message: string
  suggestion?: string
  code?: string
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

// ============================================================================
// Extension State
// ============================================================================

let githubService: GitHubService | undefined
let gitlabService: GitLabService | undefined
let diffService: DiffService
let aiReviewService: AIReviewService

let prTreeProvider: PRTreeProvider
let prListView: PRListView
let diffView: DiffView
let aiReviewPanel: AIReviewPanel

const pullRequests: Map<string, PullRequest> = new Map()
let currentPR: PullRequest | undefined

// ============================================================================
// Extension Activation
// ============================================================================

export function activate(context: vscode.ExtensionContext) {
  console.log('[PR Review] Extension activated')

  // Initialize services
  initializeServices(context)

  // Register tree provider
  registerProviders(context)

  // Register commands
  registerCommands(context)

  // Register views
  registerViews(context)

  // Register webviews
  registerWebviews(context)

  console.log('[PR Review] Extension fully initialized')
}

// ============================================================================
// Service Initialization
// ============================================================================

function initializeServices(context: vscode.ExtensionContext): void {
  // GitHub service
  githubService = new GitHubService(context)

  // GitLab service
  gitlabService = new GitLabService(context)

  // Diff service for parsing diffs
  diffService = new DiffService()

  // AI review service (integrates with RiftAI)
  aiReviewService = new AIReviewService()
}

// ============================================================================
// Provider Registration
// ============================================================================

function registerProviders(context: vscode.ExtensionContext): void {
  // PR Tree Provider for explorer view
  prTreeProvider = new PRTreeProvider(context)
  vscode.window.registerTreeDataProvider('pr-review.prList', prTreeProvider)
}

// ============================================================================
// Command Registration
// ============================================================================

function registerCommands(context: vscode.ExtensionContext): void {
  // Open PR Review
  const openCommand = vscode.commands.registerCommand('pr-review.open', async () => {
    await showPRList()
  })

  // List Pull Requests
  const listCommand = vscode.commands.registerCommand('pr-review.listPRs', async () => {
    await loadPullRequests()
  })

  // AI Review PR
  const aiReviewCommand = vscode.commands.registerCommand('pr-review.aiReview', async () => {
    if (!currentPR) {
      vscode.window.showInformationMessage('No PR selected. Please select a PR first.')
      return
    }
    await performAIReview(currentPR)
  })

  // AI Explain Changes
  const aiExplainCommand = vscode.commands.registerCommand('pr-review.aiExplain', async () => {
    if (!currentPR) {
      vscode.window.showInformationMessage('No PR selected.')
      return
    }
    await explainChangesWithAI()
  })

  // AI Suggest Fix
  const aiFixCommand = vscode.commands.registerCommand('pr-review.aiFix', async () => {
    const editor = vscode.window.activeTextEditor
    if (!editor) return

    const selection = editor.selection
    const code = editor.document.getText(selection)

    await suggestFixForCode(code)
  })

  // AI Security Scan
  const securityScanCommand = vscode.commands.registerCommand('pr-review.securityScan', async () => {
    if (!currentPR) {
      vscode.window.showInformationMessage('No PR selected.')
      return
    }
    await performSecurityScan()
  })

  // AI Summarize PR
  const summarizeCommand = vscode.commands.registerCommand('pr-review.summarize', async () => {
    if (!currentPR) {
      vscode.window.showInformationMessage('No PR selected.')
      return
    }
    await summarizePR()
  })

  // Open Diff View
  const openDiffCommand = vscode.commands.registerCommand('pr-review.openDiff', async (pr: PullRequest) => {
    await openDiffView(pr)
  })

  // Add Comment
  const addCommentCommand = vscode.commands.registerCommand('pr-review.addComment', async () => {
    await addComment()
  })

  // Approve PR
  const approveCommand = vscode.commands.registerCommand('pr-review.approve', async () => {
    if (!currentPR) return
    await approvePR(currentPR)
  })

  // Request Changes
  const requestChangesCommand = vscode.commands.registerCommand('pr-review.requestChanges', async () => {
    if (!currentPR) return
    await requestChanges(currentPR)
  })

  // Register all disposables
  context.subscriptions.push(
    openCommand,
    listCommand,
    aiReviewCommand,
    aiExplainCommand,
    aiFixCommand,
    securityScanCommand,
    summarizeCommand,
    openDiffCommand,
    addCommentCommand,
    approveCommand,
    requestChangesCommand
  )
}

// ============================================================================
// View Registration
// ============================================================================

function registerViews(context: vscode.ExtensionContext): void {
  // Create status bar item
  const statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    100
  )
  statusBarItem.text = '$(git-pull-request) PR Review'
  statusBarItem.command = 'pr-review.open'
  statusBarItem.tooltip = 'Open PR Review'
  statusBarItem.show()

  context.subscriptions.push(statusBarItem)
}

// ============================================================================
// Webview Registration
// ============================================================================

function registerWebviews(context: vscode.ExtensionContext): void {
  // AI Review Panel
  aiReviewPanel = new AIReviewPanel(context)
}

// ============================================================================
// Command Implementations
// ============================================================================

async function showPRList(): Promise<void> {
  await loadPullRequests()
  vscode.commands.executeCommand('pr-review.prList.focus')
}

async function loadPullRequests(): Promise<void> {
  const config = vscode.workspace.getConfiguration('prReview')
  
  try {
    // Show loading
    vscode.window.withProgress({
      location: vscode.ProgressLocation.Notification,
      title: 'Loading Pull Requests...'
    }, async () => {
      // Fetch from GitHub (or GitLab based on config)
      const prs = await githubService?.getPullRequests() || []
      
      // Store PRs
      pullRequests.clear()
      for (const pr of prs) {
        pullRequests.set(pr.id, pr)
      }
      
      // Update tree provider
      prTreeProvider.refresh(prs)
      
      vscode.window.showInformationMessage(`Loaded ${prs.length} pull requests`)
    })
  } catch (error) {
    vscode.window.showErrorMessage(`Failed to load PRs: ${error}`)
  }
}

async function performAIReview(pr: PullRequest): Promise<void> {
  // Show progress
  await vscode.window.withProgress({
    location: vscode.ProgressLocation.Notification,
    title: 'AI Reviewing PR...',
    cancellable: true
  }, async (progress, token) => {
    try {
      // Get diff
      const diff = await githubService?.getPullRequestDiff(pr.number)
      if (!diff) {
        vscode.window.showErrorMessage('Failed to get PR diff')
        return
      }

      // Parse diff
      const diffFiles = diffService.parseDiff(diff)

      // Perform AI review
      const result = await aiReviewService.reviewPR(diffFiles, pr)

      // Show results in panel
      aiReviewPanel.showResults(result)

      // Add decorations to editor
      addIssueDecorations(result.issues)

      vscode.window.showInformationMessage(
        `AI Review Complete: Found ${result.issues.length} issues (${result.statistics.critical} critical)`
      )
    } catch (error) {
      vscode.window.showErrorMessage(`AI Review failed: ${error}`)
    }
  })
}

async function explainChangesWithAI(): Promise<void> {
  if (!currentPR) return

  try {
    const diff = await githubService?.getPullRequestDiff(currentPR.number)
    if (!diff) return

    const diffFiles = diffService.parseDiff(diff)
    const explanation = await aiReviewService.explainChanges(diffFiles, currentPR)

    // Show in chat panel (integrates with RiftAI)
    try {
      await vscode.commands.executeCommand('rift-ai.chat', {
        context: `Explain this PR:\n\n${currentPR.title}\n\n${explanation}`
      })
    } catch {
      // Show in message if RiftAI not available
      vscode.window.showInformationMessage(explanation, { modal: true })
    }
  } catch (error) {
    vscode.window.showErrorMessage(`Failed to explain changes: ${error}`)
  }
}

async function suggestFixForCode(code: string): Promise<void> {
  try {
    const fix = await aiReviewService.suggestFix(code)

    // Show fix in a document
    const doc = await vscode.workspace.openTextDocument({
      content: `// Suggested Fix\n\n${fix}`,
      language: 'plaintext'
    })
    await vscode.window.showTextDocument(doc)

  } catch (error) {
    vscode.window.showErrorMessage(`Failed to suggest fix: ${error}`)
  }
}

async function performSecurityScan(): Promise<void> {
  if (!currentPR) return

  try {
    const diff = await githubService?.getPullRequestDiff(currentPR.number)
    if (!diff) return

    const diffFiles = diffService.parseDiff(diff)
    const scanResult = await aiReviewService.securityScan(diffFiles)

    // Show security report
    const panel = vscode.window.createWebviewPanel(
      'pr-review.securityReport',
      'Security Scan Results',
      vscode.ViewColumn.One,
      { enableScripts: true }
    )

    panel.webview.html = generateSecurityReportHTML(scanResult)
  } catch (error) {
    vscode.window.showErrorMessage(`Security scan failed: ${error}`)
  }
}

async function summarizePR(): Promise<void> {
  if (!currentPR) return

  try {
    const summary = await aiReviewService.summarizePR(currentPR)

    // Copy to clipboard
    await vscode.env.clipboard.writeText(summary)

    vscode.window.showInformationMessage('PR Summary copied to clipboard!')
  } catch (error) {
    vscode.window.showErrorMessage(`Failed to summarize PR: ${error}`)
  }
}

async function openDiffView(pr: PullRequest): Promise<void> {
  currentPR = pr

  try {
    const diff = await githubService?.getPullRequestDiff(pr.number)
    if (!diff) {
      vscode.window.showErrorMessage('Failed to get PR diff')
      return
    }

    // Create diff view
    diffView = new DiffView(diff, pr)
  } catch (error) {
    vscode.window.showErrorMessage(`Failed to open diff: ${error}`)
  }
}

async function addComment(): Promise<void> {
  const editor = vscode.window.activeTextEditor
  if (!editor) return

  const position = editor.selection.active
  const comment = await vscode.window.showInputBox({
    prompt: 'Enter your comment',
    placeHolder: 'Write your review comment...'
  })

  if (comment) {
    // Get current line info
    const line = position.line + 1
    const file = editor.document.fileName

    vscode.window.showInformationMessage(`Comment added to ${file}:${line}`)

    // Send to GitHub
    if (currentPR && githubService) {
      // Implementation would send to GitHub API
    }
  }
}

async function approvePR(pr: PullRequest): Promise<void> {
  const choice = await vscode.window.showQuickPick(['Approve', 'Request Changes', 'Cancel'], {
    placeHolder: 'Review action'
  })

  if (choice === 'Approve') {
    try {
      await githubService?.approvePullRequest(pr.number)
      vscode.window.showInformationMessage(`PR #${pr.number} approved!`)
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to approve PR: ${error}`)
    }
  }
}

async function requestChanges(pr: PullRequest): Promise<void> {
  const reason = await vscode.window.showInputBox({
    prompt: 'Enter reason for requesting changes',
    placeHolder: 'What changes are needed?'
  })

  if (reason) {
    try {
      await githubService?.requestChangesPullRequest(pr.number, reason)
      vscode.window.showInformationMessage(`Changes requested on PR #${pr.number}`)
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to request changes: ${error}`)
    }
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

function addIssueDecorations(issues: AIReviewIssue[]): void {
  const editor = vscode.window.activeTextEditor
  if (!editor) return

  // Create decorations for each issue
  for (const issue of issues) {
    const uri = vscode.Uri.file(issue.file)
    
    // Open file and add decoration
    vscode.window.showTextDocument(uri).then(doc => {
      const range = new vscode.Range(
        new vscode.Position(issue.line - 1, 0),
        new vscode.Position(issue.line - 1, 100)
      )

      const decoration = vscode.window.createTextEditorDecorationType({
        range: range,
        hoverMessage: `${issue.type.toUpperCase()}: ${issue.message}\n\n${issue.suggestion || ''}`,
        overviewRulerColor: getSeverityColor(issue.severity),
        overviewRulerLane: vscode.OverviewRulerLane.Full
      })

      editor.setDecorations(decoration, [{ range }])
    })
  }
}

function getSeverityColor(severity: string): vscode.Color {
  switch (severity) {
    case 'critical': return new vscode.Color(255, 0, 0, 1)
    case 'high': return new vscode.Color(255, 165, 0, 1)
    case 'medium': return new vscode.Color(255, 255, 0, 1)
    case 'low': return new vscode.Color(0, 128, 0, 1)
    default: return new vscode.Color(128, 128, 128, 1)
  }
}

function generateSecurityReportHTML(issues: AIReviewIssue[]): string {
  const issuesList = issues.map(i => `
    <div class="issue">
      <span class="severity ${i.severity}">${i.severity}</span>
      <h3>${i.message}</h3>
      <p><strong>File:</strong> ${i.file}:${i.line}</p>
      ${i.suggestion ? `<p><strong>Fix:</strong> ${i.suggestion}</p>` : ''}
      ${i.code ? `<pre><code>${i.code}</code></pre>` : ''}
    </div>
  `).join('')

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: var(--vscode-font-family); padding: 20px; }
        .issue { border: 1px solid var(--vscode-editorWidget-border); margin: 10px 0; padding: 15px; border-radius: 4px; }
        .severity { padding: 2px 8px; border-radius: 4px; color: white; }
        .critical { background: #d32f2f; }
        .high { background: #f57c00; }
        .medium { background: #fbc02d; color: black; }
        .low { background: #388e3c; }
        pre { background: var(--vscode-editor-background); padding: 10px; overflow-x: auto; }
      </style>
    </head>
    <body>
      <h1>🔒 Security Scan Results</h1>
      <p>Found ${issues.length} security issues</p>
      ${issuesList}
    </body>
    </html>
  `
}

// ============================================================================
// Export
// ============================================================================

export function deactivate() {
  console.log('[PR Review] Extension deactivated')
}