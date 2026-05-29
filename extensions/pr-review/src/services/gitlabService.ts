/*---------------------------------------------------------------------------------------------
 *  GitLab Service - GitLab API integration
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode'

export class GitLabService {
  private context: vscode.ExtensionContext
  private baseUrl = 'https://gitlab.com'
  private projectId: string | null = null

  constructor(context: vscode.ExtensionContext) {
    this.context = context
  }

  setProject(projectId: string): void {
    this.projectId = projectId
    this.context.globalState.update('gitlab.project', projectId)
  }

  async getMergeRequests(state: 'opened' | 'closed' | 'merged' | 'all' = 'opened'): Promise<any[]> {
    if (!this.projectId) {
      throw new Error('No GitLab project configured')
    }

    const token = this.context.globalState.get<string>('gitlab.token')
    const headers: Record<string, string> = {}
    if (token) {
      headers['PRIVATE-TOKEN'] = token
    }

    const response = await fetch(
      `${this.baseUrl}/api/v4/projects/${this.projectId}/merge_requests?state=${state}`,
      { headers }
    )

    if (!response.ok) {
      throw new Error(`GitLab API error: ${response.status}`)
    }

    return response.json()
  }

  async getMRDiff(mrIid: number): Promise<string | null> {
    if (!this.projectId) return null

    const token = this.context.globalState.get<string>('gitlab.token')
    const headers: Record<string, string> = {}
    if (token) headers['PRIVATE-TOKEN'] = token

    const response = await fetch(
      `${this.baseUrl}/api/v4/projects/${this.projectId}/merge_requests/${mrIid}/changes`,
      { headers }
    )

    if (!response.ok) return null

    const data = await response.json()
    return data.diff || null
  }

  async approveMR(mrIid: number): Promise<boolean> {
    if (!this.projectId) return false

    const token = this.context.globalState.get<string>('gitlab.token')
    const headers: Record<string, string> = {
      'PRIVATE-TOKEN': token || ''
    }

    const response = await fetch(
      `${this.baseUrl}/api/v4/projects/${this.projectId}/merge_requests/${mrIid}/approve`,
      { method: 'POST', headers }
    )

    return response.ok
  }

  async commentMR(mrIid: number, body: string): Promise<boolean> {
    if (!this.projectId) return false

    const token = this.context.globalState.get<string>('gitlab.token')
    const response = await fetch(
      `${this.baseUrl}/api/v4/projects/${this.projectId}/merge_requests/${mrIid}/notes`,
      {
        method: 'POST',
        headers: {
          'PRIVATE-TOKEN': token || '',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ body })
      }
    )

    return response.ok
  }
}