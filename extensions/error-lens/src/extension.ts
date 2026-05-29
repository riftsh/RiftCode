/*---------------------------------------------------------------------------------------------
 *  Error Lens Extension - Inline error highlighting with AI integration
 *  Works with RiftAI for error explanation and fixing
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode'
import * as fs from 'fs'
import * as path from 'path'

// ============================================================================
// Types
// ============================================================================

interface ErrorInfo {
  file: string
  line: number
  column: number
  endLine: number
  endColumn: number
  severity: vscode.DiagnosticSeverity
  message: string
  source: string
  code?: string | number
}

interface DecorationOptions {
  hoverMessage: string
  errorInfo: ErrorInfo
}

// ============================================================================
// Constants
// ============================================================================

const DECORATION_TYPE_ERROR = 'errorLensErrorDecoration'
const DECORATION_TYPE_WARNING = 'errorLensWarningDecoration'
const DECORATION_TYPE_INFO = 'errorLensInfoDecoration'
const DECORATION_TYPE_HINT = 'errorLensHintDecoration'

// ============================================================================
// Error Lens Extension
// ============================================================================

export function activate(context: vscode.ExtensionContext) {
  console.log('[ErrorLens] Extension activated')

  const config = vscode.workspace.getConfiguration('errorLens')
  const diagnostics = vscode.languages.createDiagnosticCollection('errorLens')

  // Create decoration types
  const errorDecorationType = vscode.window.createTextEditorDecorationType({
    overviewRulerColor: new vscode.ThemeColor('editorError.foreground'),
    overviewRulerLane: vscode.OverviewRulerLane.Full,
    light: {
      border: 'rgba(255, 85, 85, 0.4)',
      backgroundColor: 'rgba(255, 85, 85, 0.1)'
    },
    dark: {
      border: 'rgba(255, 85, 85, 0.4)',
      backgroundColor: 'rgba(255, 85, 85, 0.1)'
    }
  })

  const warningDecorationType = vscode.window.createTextEditorDecorationType({
    overviewRulerColor: new vscode.ThemeColor('editorWarning.foreground'),
    overviewRulerLane: vscode.OverviewRulerLane.Center,
    light: {
      border: 'rgba(255, 189, 46, 0.4)',
      backgroundColor: 'rgba(255, 189, 46, 0.1)'
    },
    dark: {
      border: 'rgba(255, 189, 46, 0.4)',
      backgroundColor: 'rgba(255, 189, 46, 0.1)'
    }
  })

  const infoDecorationType = vscode.window.createTextEditorDecorationType({
    overviewRulerColor: new vscode.ThemeColor('editorInfo.foreground'),
    overviewRulerLane: vscode.OverviewRulerLane.Right,
    light: {
      border: 'rgba(0, 151, 255, 0.4)',
      backgroundColor: 'rgba(0, 151, 255, 0.1)'
    },
    dark: {
      border: 'rgba(0, 151, 255, 0.4)',
      backgroundColor: 'rgba(0, 151, 255, 0.1)'
    }
  })

  const hintDecorationType = vscode.window.createTextEditorDecorationType({
    overviewRulerColor: new vscode.ThemeColor('editorHint.foreground'),
    overviewRulerLane: vscode.OverviewRulerLane.Left,
    light: {
      border: 'rgba(200, 200, 200, 0.4)',
      backgroundColor: 'rgba(200, 200, 200, 0.1)'
    },
    dark: {
      border: 'rgba(200, 200, 200, 0.4)',
      backgroundColor: 'rgba(200, 200, 200, 0.1)'
    }
  })

  // Store decoration types for cleanup
  const decorationTypes = {
    error: errorDecorationType,
    warning: warningDecorationType,
    info: infoDecorationType,
    hint: hintDecorationType
  }

  // ============================================================================
  // Core Functions
  // ============================================================================

  /**
   * Update decorations for the active editor
   */
  function updateDecorations(editor: vscode.TextEditor) {
    const doc = editor.document
    const fileDiagnostics = diagnostics.get(doc.uri)

    if (!fileDiagnostics || fileDiagnostics.length === 0) {
      editor.setDecorations(errorDecorationType, [])
      editor.setDecorations(warningDecorationType, [])
      editor.setDecorations(infoDecorationType, [])
      editor.setDecorations(hintDecorationType, [])
      return
    }

    const errorRanges: vscode.DecorationOptions[] = []
    const warningRanges: vscode.DecorationOptions[] = []
    const infoRanges: vscode.DecorationOptions[] = []
    const hintRanges: vscode.DecorationOptions[] = []

    for (const diagnostic of fileDiagnostics) {
      const range = diagnostic.range
      const errorInfo: ErrorInfo = {
        file: doc.uri.fsPath,
        line: range.start.line + 1,
        column: range.start.character + 1,
        endLine: range.end.line + 1,
        endColumn: range.end.character + 1,
        severity: diagnostic.severity,
        message: diagnostic.message,
        source: diagnostic.source || 'Error Lens',
        code: diagnostic.code as string | number | undefined
      }

      const decorationOptions: vscode.DecorationOptions = {
        range: range,
        hoverMessage: createHoverMessage(errorInfo),
        renderOptions: {
          after: {
            contentText: ` ‣ ${truncateMessage(diagnostic.message, 50)}`,
            color: getSeverityColor(diagnostic.severity),
            fontWeight: 'bold'
          }
        }
      }

      switch (diagnostic.severity) {
        case vscode.DiagnosticSeverity.Error:
          errorRanges.push(decorationOptions)
          break
        case vscode.DiagnosticSeverity.Warning:
          if (config.get('includeWarnings', true)) {
            warningRanges.push(decorationOptions)
          }
          break
        case vscode.DiagnosticSeverity.Information:
          if (config.get('includeInfo', false)) {
            infoRanges.push(decorationOptions)
          }
          break
        case vscode.DiagnosticSeverity.Hint:
          hintRanges.push(decorationOptions)
          break
      }
    }

    // Apply decorations
    if (config.get('enabled', true)) {
      editor.setDecorations(errorDecorationType, errorRanges)
      editor.setDecorations(warningDecorationType, warningRanges)
      editor.setDecorations(infoDecorationType, infoRanges)
      editor.setDecorations(hintDecorationType, hintRanges)
    }
  }

  /**
   * Create hover message with error details and AI actions
   */
  function createHoverMessage(error: ErrorInfo): string {
    const severityIcon = getSeverityIcon(error.severity)
    const source = error.source || 'Error Lens'
    const code = error.code ? ` [${error.code}]` : ''

    let message = `${severityIcon} **${getSeverityName(error.severity)}**\n\n`
    message += `**File:** ${path.basename(error.file)}\n`
    message += `**Line:** ${error.line}, **Column:** ${error.column}\n\n`
    message += `**Message:** ${error.message}${code}\n\n`
    message += `**Source:** ${source}\n\n`
    
    if (config.get('aiIntegration', true)) {
      message += `---\n\n`
      message += `**[🤖 Ask RiftAI](command:error-lens.explainWithAI)**\n`
      message += `**[🔧 Fix with RiftAI](command:error-lens.fixWithAI)**\n`
      message += `**[🌐 Search Online](command:error-lens.searchOnline)**`
    }

    return message
  }

  /**
   * Get current error at cursor position
   */
  function getCurrentError(): ErrorInfo | null {
    const editor = vscode.window.activeTextEditor
    if (!editor) return null

    const position = editor.selection.active
    const doc = editor.document
    const fileDiagnostics = diagnostics.get(doc.uri)

    if (!fileDiagnostics) return null

    for (const diagnostic of fileDiagnostics) {
      if (diagnostic.range.contains(position)) {
        return {
          file: doc.uri.fsPath,
          line: position.line + 1,
          column: position.character + 1,
          endLine: diagnostic.range.end.line + 1,
          endColumn: diagnostic.range.end.character + 1,
          severity: diagnostic.severity,
          message: diagnostic.message,
          source: diagnostic.source || 'Error Lens',
          code: diagnostic.code as string | number | undefined
        }
      }
    }

    return null
  }

  // ============================================================================
  // Commands
  // ============================================================================

  // Show all errors command
  const showErrorsCmd = vscode.commands.registerCommand('error-lens.showErrors', () => {
    const editor = vscode.window.activeTextEditor
    if (!editor) return

    const doc = editor.document
    const fileDiagnostics = diagnostics.get(doc.uri)

    if (!fileDiagnostics || fileDiagnostics.length === 0) {
      vscode.window.showInformationMessage('No errors found in current file')
      return
    }

    const errorCount = fileDiagnostics.filter(d => d.severity === vscode.DiagnosticSeverity.Error).length
    const warningCount = fileDiagnostics.filter(d => d.severity === vscode.DiagnosticSeverity.Warning).length

    vscode.window.showInformationMessage(
      `Found ${errorCount} error(s), ${warningCount} warning(s)`
    )
  })

  // Next error command
  const nextErrorCmd = vscode.commands.registerCommand('error-lens.nextError', () => {
    navigateToError(1)
  })

  // Previous error command
  const previousErrorCmd = vscode.commands.registerCommand('error-lens.previousError', () => {
    navigateToError(-1)
  })

  // Explain with RiftAI command
  const explainWithAICmd = vscode.commands.registerCommand('error-lens.explainWithAI', async () => {
    const error = getCurrentError()
    if (!error) {
      vscode.window.showInformationMessage('No error at cursor position')
      return
    }

    // Check if RiftAI extension is available
    const riftAIExtension = vscode.extensions.getExtension('riftcode.rift-ai')
    if (!riftAIExtension) {
      // Fallback: show error details if RiftAI not available
      showErrorDetails(error)
      vscode.window.showInformationMessage('RiftAI extension not found. Showing error details instead.')
      return
    }

    // Build the error context for AI
    const errorContext = `**File:** ${error.file}\n**Line:** ${error.line}\n**Error:** ${error.message}\n**Source:** ${error.source}`

    // Try to use RiftAI - open chat and send message
    try {
      // RiftAI uses rift-ai.new.sidebarTitle.plusButtonClicked to open chat
      await vscode.commands.executeCommand('rift-ai.new.plusButtonClicked')

      // Give time for chat to open, then we could paste the context
      // Note: Direct message injection requires the rift-ai API
      vscode.window.showInformationMessage('Opening RiftAI to explain error...')

      // As fallback, open document to show error
      const doc = await vscode.workspace.openTextDocument(error.file)
      await vscode.window.showTextDocument(doc, { selection: new vscode.Range(
        new vscode.Position(error.line - 1, 0),
        new vscode.Position(error.line - 1, 100)
      )})
    } catch (e) {
      // If RiftAI not available, show error details
      showErrorDetails(error)
    }
  })

  // Fix with RiftAI command
  const fixWithAICmd = vscode.commands.registerCommand('error-lens.fixWithAI', async () => {
    const error = getCurrentError()
    if (!error) {
      vscode.window.showInformationMessage('No error at cursor position')
      return
    }

    // Check if RiftAI extension is available
    const riftAIExtension = vscode.extensions.getExtension('riftcode.rift-ai')
    if (!riftAIExtension) {
      showErrorDetails(error)
      vscode.window.showInformationMessage('RiftAI extension not found. Showing error details instead.')
      return
    }

    try {
      // Open RiftAI chat
      await vscode.commands.executeCommand('rift-ai.new.plusButtonClicked')

      vscode.window.showInformationMessage('Opening RiftAI to fix error...')

      // Open the file and highlight the error line
      const doc = await vscode.workspace.openTextDocument(error.file)
      await vscode.window.showTextDocument(doc, { selection: new vscode.Range(
        new vscode.Position(error.line - 1, 0),
        new vscode.Position(error.line - 1, 100)
      )})
    } catch (e) {
      showErrorDetails(error)
    }
  })

  // Search online command
  const searchOnlineCmd = vscode.commands.registerCommand('error-lens.searchOnline', async () => {
    const error = getCurrentError()
    if (!error) {
      vscode.window.showInformationMessage('No error at cursor position')
      return
    }

    const searchQuery = encodeURIComponent(`${error.message} ${error.source}`)
    const url = `https://www.google.com/search?q=${searchQuery}`

    // Open in RiftBrowser or default browser
    try {
      await vscode.commands.executeCommand('riftcode.browser.navigate', url)
    } catch {
      // Fallback: open in default browser
      await vscode.env.openExternal(vscode.Uri.parse(url))
    }
  })

  // Toggle highlights command
  const toggleHighlightsCmd = vscode.commands.registerCommand('error-lens.toggleHighlights', () => {
    const currentEnabled = config.get('enabled', true)
    config.update('enabled', !currentEnabled, true)
    vscode.window.showInformationMessage(
      `Error Lens ${!currentEnabled ? 'enabled' : 'disabled'}`
    )
  })

  // Clear all decorations command
  const clearAllCmd = vscode.commands.registerCommand('error-lens.clearAll', () => {
    for (const editor of vscode.window.textEditors) {
      editor.setDecorations(errorDecorationType, [])
      editor.setDecorations(warningDecorationType, [])
      editor.setDecorations(infoDecorationType, [])
      editor.setDecorations(hintDecorationType, [])
    }
    vscode.window.showInformationMessage('Cleared all Error Lens decorations')
  })

  // ============================================================================
  // Helper Functions
  // ============================================================================

  function navigateToError(direction: number) {
    const editor = vscode.window.activeTextEditor
    if (!editor) return

    const doc = editor.document
    const fileDiagnostics = diagnostics.get(doc.uri)
    if (!fileDiagnostics || fileDiagnostics.length === 0) {
      vscode.window.showInformationMessage('No errors found')
      return
    }

    const position = editor.selection.active
    const sortedDiagnostics = fileDiagnostics.sort((a, b) => 
      a.range.start.line - b.range.start.line
    )

    let nextDiagnostic: vscode.Diagnostic | undefined
    for (let i = 0; i < sortedDiagnostics.length; i++) {
      const diag = sortedDiagnostics[i]
      if (direction > 0 && diag.range.start.line > position.line) {
        nextDiagnostic = diag
        break
      } else if (direction < 0 && diag.range.start.line < position.line) {
        nextDiagnostic = diag
      }
    }

    if (!nextDiagnostic && direction > 0) {
      nextDiagnostic = sortedDiagnostics[0]
    }

    if (nextDiagnostic) {
      editor.selection = new vscode.Selection(nextDiagnostic.range.start, nextDiagnostic.range.end)
      editor.revealRange(nextDiagnostic.range, vscode.TextEditorRevealType.InCenter)
    }
  }

  function showErrorDetails(error: ErrorInfo) {
    const msg = [
      `**${getSeverityIcon(error.severity)} ${getSeverityName(error.severity)}**`,
      '',
      `**File:** ${error.file}`,
      `**Line:** ${error.line}, Column: ${error.column}`,
      '',
      `**Message:** ${error.message}`,
      error.source ? `**Source:** ${error.source}` : ''
    ].filter(Boolean).join('\n')

    vscode.window.showInformationMessage(msg, { modal: true })
  }

  function getErrorCodeContext(error: ErrorInfo): string {
    const editor = vscode.window.activeTextEditor
    if (!editor) return ''

    const doc = editor.document
    const startLine = Math.max(0, error.line - 2)
    const endLine = Math.min(doc.lineCount, error.line + 5)
    
    let code = ''
    for (let i = startLine; i < endLine; i++) {
      const lineNum = i + 1
      const prefix = lineNum === error.line ? '>>> ' : '    '
      code += `${prefix}${doc.lineAt(i).text}\n`
    }
    
    return code
  }

  // ============================================================================
  // Event Handlers
  // ============================================================================

  // Update decorations when document changes
  const documentChangeHandler = vscode.workspace.onDidChangeTextDocument(e => {
    const editor = vscode.window.activeTextEditor
    if (editor && e.document === editor.document) {
      const config = vscode.workspace.getConfiguration('errorLens')
      const delay = config.get('delay', 0)
      
      if (delay > 0) {
        setTimeout(() => updateDecorations(editor), delay)
      } else {
        updateDecorations(editor)
      }
    }
  })

  // Update decorations when editor becomes active
  const activeEditorChangeHandler = vscode.window.onDidChangeActiveTextEditor(editor => {
    if (editor) {
      updateDecorations(editor)
    }
  })

  // Update decorations when diagnostics change
  const diagnosticsChangeHandler = vscode.languages.onDidChangeDiagnostics(e => {
    const editor = vscode.window.activeTextEditor
    if (editor && e.uris.some(uri => uri.fsPath === editor.document.uri.fsPath)) {
      updateDecorations(editor)
    }
  })

  // ============================================================================
  // Initialize
  // ============================================================================

  // Update decorations for initial active editor
  if (vscode.window.activeTextEditor) {
    updateDecorations(vscode.window.activeTextEditor)
  }

  // Status bar item
  const statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    100
  )
  statusBarItem.text = '$(error) Error Lens'
  statusBarItem.command = 'error-lens.showErrors'
  statusBarItem.tooltip = 'Click to see error summary'
  statusBarItem.show()

  // ============================================================================
  // Cleanup
  // ============================================================================

  context.subscriptions.push(
    showErrorsCmd,
    nextErrorCmd,
    previousErrorCmd,
    explainWithAICmd,
    fixWithAICmd,
    searchOnlineCmd,
    toggleHighlightsCmd,
    clearAllCmd,
    documentChangeHandler,
    activeEditorChangeHandler,
    diagnosticsChangeHandler,
    statusBarItem,
    errorDecorationType,
    warningDecorationType,
    infoDecorationType,
    hintDecorationType
  )

  console.log('[ErrorLens] Extension fully initialized')
}

// ============================================================================
// Utility Functions
// ============================================================================

function getSeverityIcon(severity: vscode.DiagnosticSeverity): string {
  switch (severity) {
    case vscode.DiagnosticSeverity.Error: return '❌'
    case vscode.DiagnosticSeverity.Warning: return '⚠️'
    case vscode.DiagnosticSeverity.Information: return 'ℹ️'
    case vscode.DiagnosticSeverity.Hint: return '💡'
    default: return '❓'
  }
}

function getSeverityName(severity: vscode.DiagnosticSeverity): string {
  switch (severity) {
    case vscode.DiagnosticSeverity.Error: return 'Error'
    case vscode.DiagnosticSeverity.Warning: return 'Warning'
    case vscode.DiagnosticSeverity.Information: return 'Information'
    case vscode.DiagnosticSeverity.Hint: return 'Hint'
    default: return 'Unknown'
  }
}

function getSeverityColor(severity: vscode.DiagnosticSeverity): string {
  switch (severity) {
    case vscode.DiagnosticSeverity.Error: return 'rgba(255, 85, 85, 0.8)'
    case vscode.DiagnosticSeverity.Warning: return 'rgba(255, 189, 46, 0.8)'
    case vscode.DiagnosticSeverity.Information: return 'rgba(0, 151, 255, 0.8)'
    case vscode.DiagnosticSeverity.Hint: return 'rgba(200, 200, 200, 0.8)'
    default: return 'rgba(200, 200, 200, 0.8)'
  }
}

function truncateMessage(message: string, maxLength: number): string {
  if (message.length <= maxLength) return message
  return message.substring(0, maxLength - 3) + '...'
}

// ============================================================================
// Export
// ============================================================================

export function deactivate() {
  console.log('[ErrorLens] Extension deactivated')
}