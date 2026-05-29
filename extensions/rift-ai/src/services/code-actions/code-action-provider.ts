import * as vscode from "vscode"

export class RiftCodeActionProvider implements vscode.CodeActionProvider {
  static readonly metadata: vscode.CodeActionProviderMetadata = {
    providedCodeActionKinds: [vscode.CodeActionKind.QuickFix, vscode.CodeActionKind.RefactorRewrite],
  }

  provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range | vscode.Selection,
    context: vscode.CodeActionContext,
  ): vscode.CodeAction[] {
    if (range.isEmpty) return []

    const actions: vscode.CodeAction[] = []

    const add = new vscode.CodeAction("Add to RiftAI", vscode.CodeActionKind.RefactorRewrite)
    add.command = { command: "rift-ai.new.addToContext", title: "Add to RiftAI" }
    actions.push(add)

    const hasDiagnostics = context.diagnostics.length > 0

    if (hasDiagnostics) {
      const fix = new vscode.CodeAction("Fix with RiftAI", vscode.CodeActionKind.QuickFix)
      fix.command = { command: "rift-ai.new.fixCode", title: "Fix with RiftAI" }
      fix.isPreferred = true
      actions.push(fix)
    }

    if (!hasDiagnostics) {
      const explain = new vscode.CodeAction("Explain with RiftAI", vscode.CodeActionKind.RefactorRewrite)
      explain.command = { command: "rift-ai.new.explainCode", title: "Explain with RiftAI" }
      actions.push(explain)

      const improve = new vscode.CodeAction("Improve with RiftAI", vscode.CodeActionKind.RefactorRewrite)
      improve.command = { command: "rift-ai.new.improveCode", title: "Improve with RiftAI" }
      actions.push(improve)
    }

    return actions
  }
}
