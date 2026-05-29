/*---------------------------------------------------------------------------------------------
 *  AI Review Service - AI-powered code review integration
 *  Uses RiftAI for intelligent analysis
 *--------------------------------------------------------------------------------------------*/

interface DiffFile {
  filename: string
  status: 'added' | 'modified' | 'deleted' | 'renamed'
  additions: number
  deletions: number
  patch?: string
  content?: string
}

interface AIReviewIssue {
  type: 'bug' | 'security' | 'performance' | 'style' | 'best-practice'
  severity: 'critical' | 'high' | 'medium' | 'low'
  file: string
  line: number
  endLine?: number
  message: string
  suggestion?: string
  code?: string
  snippet?: string
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

interface PullRequest {
  number: number
  title: string
  description: string
  author: string
  base: string
  head: string
}

export class AIReviewService {
  /**
   * Perform comprehensive AI review of PR
   */
  async reviewPR(diffFiles: DiffFile[], pr: PullRequest): Promise<AIReviewResult> {
    const issues: AIReviewIssue[] = []
    let totalAdditions = 0
    let totalDeletions = 0

    // Analyze each file
    for (const file of diffFiles) {
      totalAdditions += file.additions
      totalDeletions += file.deletions

      // Send to AI for analysis
      const fileIssues = await this.analyzeFile(file)
      issues.push(...fileIssues)
    }

    // Generate summary
    const summary = await this.generateSummary(pr, issues, diffFiles.length)

    return {
      summary,
      issues,
      statistics: {
        filesReviewed: diffFiles.length,
        linesAdded: totalAdditions,
        linesDeleted: totalDeletions,
        issuesFound: issues.length,
        critical: issues.filter(i => i.severity === 'critical').length,
        high: issues.filter(i => i.severity === 'high').length,
        medium: issues.filter(i => i.severity === 'medium').length,
        low: issues.filter(i => i.severity === 'low').length
      }
    }
  }

  /**
   * Analyze single file with AI
   */
  private async analyzeFile(file: DiffFile): Promise<AIReviewIssue[]> {
    const issues: AIReviewIssue[] = []

    try {
      // Build prompt for AI analysis
      const prompt = this.buildAnalysisPrompt(file)
      
      // Send to RiftAI (or use fallback)
      const analysis = await this.sendToAI(prompt)
      
      // Parse issues from response
      const parsedIssues = this.parseIssuesFromResponse(analysis, file)
      issues.push(...parsedIssues)
    } catch (error) {
      console.error(`[AI Review] Failed to analyze ${file.filename}:`, error)
    }

    return issues
  }

  /**
   * Build analysis prompt
   */
  private buildAnalysisPrompt(file: DiffFile): string {
    return `Analyze this code change for issues:

File: ${file.filename}
Status: ${file.status}
Additions: ${file.additions}, Deletions: ${file.deletions}

${file.patch || 'No patch available'}

Focus on:
1. Bugs and potential errors
2. Security vulnerabilities
3. Performance issues
4. Best practices violations
5. Code style issues

Return JSON with issues in format:
{
  "issues": [
    {
      "type": "bug|security|performance|style|best-practice",
      "severity": "critical|high|medium|low",
      "line": number,
      "message": "description",
      "suggestion": "how to fix"
    }
  ]
}`
  }

  /**
   * Send to AI and get response
   */
  private async sendToAI(prompt: string): Promise<string> {
    try {
      // Try to use RiftAI for analysis
      const response = await vscode.commands.executeCommand('rift-ai.analyze', {
        prompt: prompt,
        context: 'code-review'
      })
      return response as string
    } catch {
      // Fallback: Use basic pattern matching
      return this.basicAnalysis(prompt)
    }
  }

  /**
   * Basic analysis when AI is not available
   */
  private basicAnalysis(prompt: string): string {
    // Simple pattern-based analysis
    const issues: any[] = []

    // Extract diff content
    const patchMatch = prompt.match(/Additions: \d+, Deletions: \d+\n\n([\s\S]+)$/)
    if (!patchMatch) return JSON.stringify({ issues: [] })

    const patch = patchMatch[1]

    // Check for common issues
    if (patch.includes('eval(')) {
      issues.push({
        type: 'security',
        severity: 'critical',
        line: 1,
        message: 'Use of eval() detected - security risk',
        suggestion: 'Avoid using eval() for security reasons'
      })
    }

    if (patch.includes('SQL') && patch.toLowerCase().includes('select') && !patch.includes('?')) {
      issues.push({
        type: 'security',
        severity: 'high',
        line: 1,
        message: 'Potential SQL injection risk - use parameterized queries',
        suggestion: 'Use prepared statements or parameterized queries'
      })
    }

    if (patch.includes('innerHTML') || patch.includes('dangerouslySetInnerHTML')) {
      issues.push({
        type: 'security',
        severity: 'high',
        line: 1,
        message: 'XSS vulnerability - direct HTML injection detected',
        suggestion: 'Use textContent or sanitize HTML properly'
      })
    }

    if (patch.includes('console.log') && patch.includes('TODO') === false) {
      issues.push({
        type: 'style',
        severity: 'low',
        line: 1,
        message: 'Console.log statement found - remove for production',
        suggestion: 'Remove console.log statements or use proper logging'
      })
    }

    return JSON.stringify({ issues })
  }

  /**
   * Parse issues from AI response
   */
  private parseIssuesFromResponse(response: string, file: DiffFile): AIReviewIssue[] {
    const issues: AIReviewIssue[] = []

    try {
      const parsed = JSON.parse(response)
      const issueList = parsed.issues || []

      for (const issue of issueList) {
        issues.push({
          type: issue.type || 'best-practice',
          severity: issue.severity || 'medium',
          file: file.filename,
          line: issue.line || 1,
          message: issue.message || 'Issue detected',
          suggestion: issue.suggestion || '',
          code: issue.code || ''
        })
      }
    } catch {
      // If parsing fails, try to extract basic info
      console.log('[AI Review] Could not parse AI response, using basic analysis')
    }

    return issues
  }

  /**
   * Generate PR summary using AI
   */
  async generateSummary(pr: PullRequest, issues: AIReviewIssue[], fileCount: number): Promise<string> {
    const prompt = `Summarize this pull request:

Title: ${pr.title}
Author: ${pr.author}
Description: ${pr.description || 'No description'}
Files changed: ${fileCount}
Issues found: ${issues.length} (${issues.filter(i => i.severity === 'critical' || i.severity === 'high').length} critical/high)

Provide a concise summary in 2-3 sentences.`

    try {
      const response = await vscode.commands.executeCommand('rift-ai.chat', {
        context: prompt
      })
      return response as string
    } catch {
      return `PR #${pr.number}: ${pr.title} - ${fileCount} files changed, ${issues.length} issues found`
    }
  }

  /**
   * Explain changes using AI
   */
  async explainChanges(diffFiles: DiffFile[], pr: PullRequest): Promise<string> {
    const prompt = `Explain what changed in this PR:

Title: ${pr.title}
Author: ${pr.author}

Files changed:
${diffFiles.map(f => `- ${f.filename} (${f.status})`).join('\n')}

Please explain the purpose and impact of these changes in a clear, concise manner.`

    try {
      const response = await vscode.commands.executeCommand('rift-ai.chat', {
        context: prompt
      })
      return response as string
    } catch {
      return `This PR modifies ${diffFiles.length} files. The changes include ${diffFiles.filter(f => f.status === 'added').length} additions, ${diffFiles.filter(f => f.status === 'modified').length} modifications, and ${diffFiles.filter(f => f.status === 'deleted').length} deletions.`
    }
  }

  /**
   * Suggest fix for code
   */
  async suggestFix(code: string): Promise<string> {
    const prompt = `Suggest improvements for this code:

\`\`\`
${code}
\`\`\`

Provide:
1. Any bugs or issues
2. Suggested fixes
3. Better alternatives if applicable`

    try {
      const response = await vscode.commands.executeCommand('rift-ai.chat', {
        context: prompt
      })
      return response as string
    } catch {
      return 'Could not generate fix suggestion. Please try again.'
    }
  }

  /**
   * Perform security scan
   */
  async securityScan(diffFiles: DiffFile[]): Promise<AIReviewIssue[]> {
    const issues: AIReviewIssue[] = []

    for (const file of diffFiles) {
      const scanResults = await this.scanFileForSecurityIssues(file)
      issues.push(...scanResults)
    }

    return issues
  }

  /**
   * Scan file for security issues
   */
  private async scanFileForSecurityIssues(file: DiffFile): Promise<AIReviewIssue[]> {
    const issues: AIReviewIssue[] = []
    const content = file.patch || ''

    // Pattern-based security scanning
    const securityPatterns = [
      { pattern: /eval\s*\(/, type: 'security' as const, severity: 'critical' as const, message: 'Use of eval() - potential code injection', suggestion: 'Avoid eval(), use safe alternatives' },
      { pattern: /innerHTML\s*=/, type: 'security' as const, severity: 'high' as const, message: 'Direct innerHTML assignment - XSS risk', suggestion: 'Use textContent or sanitize input' },
      { pattern: /dangerouslySetInnerHTML/, type: 'security' as const, severity: 'high' as const, message: 'React dangerouslySetInnerHTML - XSS risk', suggestion: 'Sanitize HTML or use DOMPurify' },
      { pattern: /password\s*=\s*[^"\'null], type: 'security' as const, severity: 'high' as const, message: 'Hardcoded password detected', suggestion: 'Use environment variables' },
      { pattern: /api[_-]?key\s*=\s*[^"\'null], type: 'security' as const, severity: 'high' as const, message: 'Hardcoded API key detected', suggestion: 'Use environment variables or secrets manager' },
      { pattern: /token\s*=\s*[^"\'null], type: 'security' as const, severity: 'medium' as const, message: 'Hardcoded token detected', suggestion: 'Use secure token storage' },
      { pattern: /exec\s*\(/, type: 'security' as const, severity: 'critical' as const, message: 'Shell command execution - injection risk', suggestion: 'Use parameterized commands or safe alternatives' },
      { pattern: /spawn\s*\(/, type: 'security' as const, severity: 'high' as const, message: 'Process spawn with user input - injection risk', suggestion: 'Validate and sanitize all inputs' },
      { pattern: /crypto\.createCipher/, type: 'security' as const, severity: 'high' as const, message: 'Weak crypto algorithm (createCipher deprecated)', suggestion: 'Use crypto.createCipheriv with strong algorithms' },
      { pattern: /md5|sha1/i, type: 'security' as const, severity: 'medium' as const, message: 'Weak hashing algorithm (MD5/SHA1)', suggestion: 'Use SHA-256 or stronger algorithms' }
    ]

    for (const { pattern, type, severity, message, suggestion } of securityPatterns) {
      if (pattern.test(content)) {
        issues.push({
          type,
          severity,
          file: file.filename,
          line: this.findLineNumber(content, pattern),
          message,
          suggestion
        })
      }
    }

    return issues
  }

  /**
   * Find line number of pattern in content
   */
  private findLineNumber(content: string, pattern: RegExp): number {
    const lines = content.split('\n')
    for (let i = 0; i < lines.length; i++) {
      if (pattern.test(lines[i])) {
        return i + 1
      }
    }
    return 1
  }

  /**
   * Summarize PR using AI
   */
  async summarizePR(pr: PullRequest): Promise<string> {
    const prompt = `Write a brief summary of this PR for a code review:

Title: ${pr.title}
Description: ${pr.description || 'No description provided'}
Author: ${pr.author}
Target branch: ${pr.base}
Source branch: ${pr.head}

Format the summary as:
- What changed (1-2 sentences)
- Why it changed (1-2 sentences)
- Key files affected`

    try {
      const response = await vscode.commands.executeCommand('rift-ai.chat', {
        context: prompt
      })
      return response as string
    } catch {
      return `# PR #${pr.number}: ${pr.title}

**Author:** ${pr.author}
**Target:** ${pr.base} ← ${pr.head}

**Summary:**
This PR makes changes to the codebase. Please review the changes for correctness, style, and potential issues.

**Files changed:** See diff view for details.`
    }
  }
}

// Import vscode for command execution
import * as vscode from 'vscode'