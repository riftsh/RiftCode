/*---------------------------------------------------------------------------------------------
 *  GitHub Service - GitHub API integration for PR Review
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode'

interface GitHubPR {
  id: number
  number: number
  title: string
  body: string
  state: string
  user: { login: string; avatar_url: string }
  base: { ref: string; sha: string }
  head: { ref: string; sha: string; repo: { full_name: string } }
  html_url: string
  created_at: string
  updated_at: string
  additions?: number
  deletions?: number
  changed_files?: number
  labels: { name: string }[]
  requested_reviewers: { login: string }[]
  comments: number
  review_comments: number
}

interface GitHubConfig {
  owner: string
  repo: string
  token?: string
}

export class GitHubService {
  private context: vscode.ExtensionContext
  private config: GitHubConfig | null = null

  constructor(context: vscode.ExtensionContext) {
    this.context = context
    this.loadConfig()
  }

  private loadConfig(): void {
    // Get repository from git
    const git = this.context.globalState.get<string>('github.repository')
    if (git) {
      const [owner, repo] = git.split('/')
      this.config = { owner, repo }
    }
  }

  /**
   * Set repository configuration
   */
  setRepository(owner: string, repo: string, token?: string): void {
    this.config = { owner, repo, token }
    this.context.globalState.update('github.repository', `${owner}/${repo}`)
    if (token) {
      this.context.globalState.update('github.token', token)
    }
  }

  /**
   * Get repository from current git workspace
   */
  async detectRepository(): Promise<GitHubConfig | null> {
    try {
      // Use VS Code's git extension to get repository info
      const gitExtension = vscode.extensions.getExtension('vscode.git')
      if (!gitExtension) return null

      const git = await gitExtension.activate()
      const repositories = git.repositories

      if (repositories.length > 0) {
        const remotes = repositories[0].state. remotes
        const origin = remotes.find(r => r.name === 'origin')
        
        if (origin && origin.fetchUrl) {
          // Parse GitHub URL
          const match = origin.fetchUrl.match(/github\.com[/:](.+)\/(.+)\.git/)
          if (match) {
            return { owner: match[1], repo: match[2] }
          }
        }
      }
    } catch (error) {
      console.error('[GitHub] Failed to detect repository:', error)
    }
    return null
  }

  /**
   * Get all pull requests
   */
  async getPullRequests(state: 'open' | 'closed' | 'all' = 'open'): Promise<any[]> {
    if (!this.config) {
      this.config = await this.detectRepository()
    }
    if (!this.config) {
      throw new Error('No repository configured')
    }

    const token = this.context.globalState.get<string>('github.token') || 
                  vscode.workspace.getConfiguration('prReview').get('githubToken')

    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json'
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(
      `https://api.github.com/repos/${this.config.owner}/${this.config.repo}/pulls?state=${state}`,
      { headers }
    )

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`)
    }

    const prs = await response.json() as GitHubPR[]
    
    return prs.map(pr => ({
      id: pr.id.toString(),
      number: pr.number,
      title: pr.title,
      description: pr.body || '',
      author: pr.user.login,
      authorAvatar: pr.user.avatar_url,
      state: pr.state as 'open' | 'closed' | 'merged',
      base: pr.base.ref,
      head: pr.head.ref,
      repository: `${this.config!.owner}/${this.config!.repo}`,
      url: pr.html_url,
      createdAt: pr.created_at,
      updatedAt: pr.updated_at,
      additions: pr.additions || 0,
      deletions: pr.deletions || 0,
      changedFiles: pr.changed_files || 0,
      labels: pr.labels.map(l => l.name),
      reviewers: pr.requested_reviewers.map(r => r.login),
      comments: pr.comments + pr.review_comments
    }))
  }

  /**
   * Get single PR details
   */
  async getPullRequest(prNumber: number): Promise<any | null> {
    if (!this.config) return null

    const token = this.context.globalState.get<string>('github.token')
    const headers: Record<string, string> = { 'Accept': 'application/vnd.github.v3+json' }
    if (token) headers['Authorization'] = `Bearer ${token}`

    const response = await fetch(
      `https://api.github.com/repos/${this.config.owner}/${this.config.repo}/pulls/${prNumber}`,
      { headers }
    )

    if (!response.ok) return null

    const pr = await response.json() as GitHubPR
    
    return {
      id: pr.id.toString(),
      number: pr.number,
      title: pr.title,
      description: pr.body || '',
      author: pr.user.login,
      state: pr.state,
      base: pr.base.ref,
      head: pr.head.ref
    }
  }

  /**
   * Get PR diff
   */
  async getPullRequestDiff(prNumber: number): Promise<string | null> {
    if (!this.config) return null

    const token = this.context.globalState.get<string>('github.token')
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3.diff'
    }
    if (token) headers['Authorization'] = `Bearer ${token}`

    const response = await fetch(
      `https://api.github.com/repos/${this.config.owner}/${this.config.repo}/pulls/${prNumber}`,
      { headers }
    )

    if (!response.ok) return null

    return response.text()
  }

  /**
   * Get PR files changed
   */
  async getPullRequestFiles(prNumber: number): Promise<any[]> {
    if (!this.config) return []

    const token = this.context.globalState.get<string>('github.token')
    const headers: Record<string, string> = { 'Accept': 'application/vnd.github.v3+json' }
    if (token) headers['Authorization'] = `Bearer ${token}`

    const response = await fetch(
      `https://api.github.com/repos/${this.config.owner}/${this.config.repo}/pulls/${prNumber}/files`,
      { headers }
    )

    if (!response.ok) return []

    return response.json()
  }

  /**
   * Get file content at PR head
   */
  async getFileContent(path: string, ref: string): Promise<string | null> {
    if (!this.config) return null

    const token = this.context.globalState.get<string>('github.token')
    const headers: Record<string, string> = { 'Accept': 'application/vnd.github.v3.raw' }
    if (token) headers['Authorization'] = `Bearer ${token}`

    const response = await fetch(
      `https://raw.githubusercontent.com/${this.config.owner}/${this.config.repo}/${ref}/${path}`,
      { headers }
    )

    if (!response.ok) return null

    return response.text()
  }

  /**
   * Post review comment
   */
  async postComment(prNumber: number, body: string, commitId: string, path: string, line: number): Promise<boolean> {
    if (!this.config) return false

    const token = this.context.globalState.get<string>('github.token')
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json'
    }
    if (token) headers['Authorization'] = `Bearer ${token}`

    const response = await fetch(
      `https://api.github.com/repos/${this.config.owner}/${this.config.repo}/pulls/${prNumber}/comments`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({
          body,
          commit_id: commitId,
          path,
          line,
          side: 'RIGHT'
        })
      }
    )

    return response.ok
  }

  /**
   * Approve PR
   */
  async approvePullRequest(prNumber: number, body?: string): Promise<boolean> {
    if (!this.config) return false

    const token = this.context.globalState.get<string>('github.token')
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json'
    }
    if (token) headers['Authorization'] = `Bearer ${token}`

    // Get PR commit SHA
    const prResponse = await fetch(
      `https://api.github.com/repos/${this.config.owner}/${this.config.repo}/pulls/${prNumber}`,
      { headers }
    )

    if (!prResponse.ok) return false

    const pr = await prResponse.json() as GitHubPR

    const response = await fetch(
      `https://api.github.com/repos/${this.config.owner}/${this.config.repo}/pulls/${prNumber}/reviews`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({
          event: 'APPROVE',
          body: body || 'LGTM!',
          commit_id: pr.head.sha
        })
      }
    )

    return response.ok
  }

  /**
   * Request changes on PR
   */
  async requestChangesPullRequest(prNumber: number, body: string): Promise<boolean> {
    if (!this.config) return false

    const token = this.context.globalState.get<string>('github.token')
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json'
    }
    if (token) headers['Authorization'] = `Bearer ${token}`

    const prResponse = await fetch(
      `https://api.github.com/repos/${this.config.owner}/${this.config.repo}/pulls/${prNumber}`,
      { headers }
    )

    if (!prResponse.ok) return false

    const pr = await prResponse.json() as GitHubPR

    const response = await fetch(
      `https://api.github.com/repos/${this.config.owner}/${this.config.repo}/pulls/${prNumber}/reviews`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({
          event: 'REQUEST_CHANGES',
          body,
          commit_id: pr.head.sha
        })
      }
    )

    return response.ok
  }
}