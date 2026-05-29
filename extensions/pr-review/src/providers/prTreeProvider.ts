/*---------------------------------------------------------------------------------------------
 *  PR Tree Provider - Shows PRs in Explorer view
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode'

interface PullRequest {
  id: string
  number: number
  title: string
  author: string
  state: 'open' | 'closed' | 'merged'
  labels: string[]
}

export class PRTreeProvider implements vscode.TreeDataProvider<TreeItem> {
  private context: vscode.ExtensionContext
  private pullRequests: PullRequest[] = []
  private onDidChangeTreeDataEmitter = new vscode.EventEmitter<void>()
  readonly onDidChangeTreeData = this.onDidChangeTreeDataEmitter.event

  constructor(context: vscode.ExtensionContext) {
    this.context = context
  }

  /**
   * Refresh the tree with new PRs
   */
  refresh(prs: PullRequest[]): void {
    this.pullRequests = prs
    this.onDidChangeTreeDataEmitter.fire()
  }

  /**
   * Get tree item
   */
  getTreeItem(element: TreeItem): vscode.TreeItem {
    return element
  }

  /**
   * Get children of element
   */
  getChildren(element?: TreeItem): Thenable<TreeItem[]> {
    if (!element) {
      // Root level - show PRs grouped by state
      const open = this.pullRequests.filter(pr => pr.state === 'open')
      const closed = this.pullRequests.filter(pr => pr.state === 'closed' || pr.state === 'merged')

      const items: TreeItem[] = []

      if (open.length > 0) {
        items.push(new TreeItem(`Open (${open.length})`, vscode.TreeItemCollapsibleState.Expanded, 'open'))
      }
      if (closed.length > 0) {
        items.push(new TreeItem(`Closed (${closed.length})`, vscode.TreeItemCollapsibleState.Collapsed, 'closed'))
      }

      return Promise.resolve(items)
    }

    if (element.contextValue === 'open' || element.contextValue === 'closed') {
      const filtered = element.contextValue === 'open'
        ? this.pullRequests.filter(pr => pr.state === 'open')
        : this.pullRequests.filter(pr => pr.state === 'closed' || pr.state === 'merged')

      return Promise.resolve(filtered.map(pr => new TreeItem(
        `#${pr.number} ${pr.title}`,
        vscode.TreeItemCollapsibleState.None,
        'pr',
        {
          command: 'pr-review.openDiff',
          title: 'Open PR',
          arguments: [pr]
        }
      )))
    }

    return Promise.resolve([])
  }
}

/**
 * Tree item for PRs
 */
export class TreeItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly contextValue: string,
    public readonly command?: vscode.Command
  ) {
    super(label, collapsibleState)
    this.contextValue = contextValue

    // Set icon based on context
    if (contextValue === 'open') {
      this.iconPath = new vscode.ThemeIcon('git-pull-request')
    } else if (contextValue === 'closed') {
      this.iconPath = new vscode.ThemeIcon('git-pull-request-closed')
    } else if (contextValue === 'pr') {
      this.iconPath = new vscode.ThemeIcon('diff')
    }
  }
}