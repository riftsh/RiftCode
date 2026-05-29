# 🎯 PR Review Extension - AI-Powered Code Review in Editor

## Overview

**PR Review** is an extension that brings GitHub/GitLab pull request reviews directly into RiftCode's editor with AI-powered review capabilities. Review PRs without leaving your IDE, and let AI analyze code changes automatically.

---

## 🎯 Features

### 1. PR Overview Panel
- View PR title, description, author, status
- See diff statistics (files changed, additions, deletions)
- View commit history
- Comment threads inline

### 2. Diff Viewer (Side-by-Side)
- Side-by-side diff view with syntax highlighting
- Line-by-line comments
- Approve/Request changes inline
- Navigate between changed files

### 3. AI Code Review
- **Auto Review** - AI reviews PR and highlights issues
- **Suggest Fixes** - AI suggests fixes for problems
- **Security Scan** - AI-powered security vulnerability detection
- **Performance Tips** - AI suggests performance optimizations
- **Style Guide** - AI checks against coding standards

### 4. AI Actions
| Action | Description |
|--------|-------------|
| `pr.ai.review` | Full AI review of PR |
| `pr.ai.explainChanges` | AI explains what changed and why |
| `pr.ai.suggestFixes` | AI suggests fixes for issues |
| `pr.ai.securityScan` | AI security vulnerability scan |
| `pr.ai.summarize` | AI generates PR summary |
| `pr.ai.answerQuestions` | Chat with AI about PR |

### 5. Team Collaboration
- Add inline comments
- Reply to comments
- Resolve/unresolve threads
- Mention team members

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         PR Review Extension                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                     Activity Bar                             │  │
│  │                   ┌────┐ ┌────┐ ┌────┐                        │  │
│  │                   │ 🔀 │ │ 🧩 │ │ 📋 │                        │  │
│  │                   │ PR │ │ AI │ │Rev │                        │  │
│  │                   └────┘ └────┘ └────┘                        │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌─────────────────┐              ┌────────────────────────────┐   │
│  │   PR List       │              │       Diff View           │   │
│  │                 │              │                            │   │
│  │  ┌───────────┐  │              │  ┌─────────┬─────────┐   │   │
│  │  │ PR #123  │  │              │  │ OLD     │ NEW     │   │   │
│  │  │ Fix auth │  │              │  │ Code    │ Code    │   │   │
│  │  │ ✓ Ready │  │──────────────│  │         │         │   │   │
│  │  └───────────┘  │              │  │         │         │   │   │
│  │                 │              │  └─────────┴─────────┘   │   │
│  │  ┌───────────┐  │              │                            │   │
│  │  │ PR #124  │  │              │  [💬 Comment] [✅ Approve]  │   │
│  │  │ Add feat │  │              │  [🔧 Fix with AI]          │   │
│  │  │ ⏳ Review│  │              └────────────────────────────┘   │
│  │  └───────────┘  │                                            │
│  └─────────────────┘                                            │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                      AI Review Panel                          │  │
│  │                                                               │  │
│  │  🤖 AI Analysis Results                                       │  │
│  │                                                               │  │
│  │  ┌─────────────────────────────────────────────────────────┐ │  │
│  │  │ ⚠️ Potential Bug: Line 45                               │ │  │
│  │  │    Null check missing before array access               │ │  │
│  │  │    [Fix with AI] [Ignore] [Learn More]                 │ │  │
│  │  └─────────────────────────────────────────────────────────┘ │  │
│  │                                                               │  │
│  │  ┌─────────────────────────────────────────────────────────┐ │  │
│  │  │ 🔒 Security: SQL injection risk detected                │ │  │
│  │  │    Use parameterized queries instead of string concat   │ │  │
│  │  │    [Fix with AI] [Ignore] [Learn More]                │ │  │
│  │  └─────────────────────────────────────────────────────────┘ │  │
│  │                                                               │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📁 File Structure

```
extensions/pr-review/
├── package.json              # Extension manifest
├── src/
│   ├── extension.ts          # Main entry point
│   ├── commands/
│   │   ├── prCommands.ts     # PR operations
│   │   └── aiCommands.ts     # AI review commands
│   ├── providers/
│   │   ├── prTreeProvider.ts # PR list in explorer
│   │   └── diffProvider.ts   # Diff view provider
│   ├── services/
│   │   ├── githubService.ts # GitHub API
│   │   ├── gitlabService.ts # GitLab API  
│   │   ├── diffService.ts   # Diff parsing
│   │   └── aiReviewService.ts # AI review integration
│   ├── views/
│   │   ├── prListView.ts    # PR list sidebar
│   │   ├── diffView.ts      # Diff editor
│   │   └── aiReviewPanel.ts # AI review panel
│   └── utils/
│       └── helpers.ts       # Utility functions
└── README.md
```

---

## 🔧 Implementation

### Main Entry

```typescript
// extension.ts - Main entry point
export function activate(context: vscode.ExtensionContext) {
    console.log('[PR Review] Extension activated')
    
    // Register commands
    registerPRCommands(context)
    registerAICommands(context)
    
    // Register providers
    registerTreeProviders(context)
    registerEditors(context)
    
    // Register views
    registerViews(context)
    
    // Initialize services
    initializeServices(context)
}
```

### AI Review Service

```typescript
// aiReviewService.ts - AI-powered code review
export class AIReviewService {
    async reviewPR(pullRequest: PullRequest): Promise<AIReviewResult> {
        // Get diff content
        const diff = await this.getDiff(pullRequest)
        
        // Send to AI for analysis
        const prompt = this.buildReviewPrompt(diff)
        const response = await this.sendToAI(prompt)
        
        // Parse and return results
        return this.parseReviewResults(response)
    }
    
    async explainChanges(diff: Diff): Promise<string> {
        // Ask AI to explain what changed
        return this.sendToAI(`Explain these code changes:\n${diff}`)
    }
    
    async suggestFixes(issue: ReviewIssue): Promise<string> {
        // Ask AI to suggest a fix
        return this.sendToAI(`Suggest a fix for:\n${issue.description}\n\nCode:\n${issue.code}`)
    }
    
    async securityScan(diff: Diff): Promise<SecurityIssue[]> {
        // Focused security analysis
        return this.sendToAI(`Scan for security vulnerabilities:\n${diff}`)
    }
}
```

---

## ⌨️ Commands

| Command | Description | Shortcut |
|---------|-------------|----------|
| `pr-review.open` | Open PR list | `Ctrl+Shift+P` → "Open PR Review" |
| `pr-review.list` | List open PRs | `Ctrl+Shift+R` |
| `pr-review.aiReview` | Full AI review | `Ctrl+Shift+Alt+R` |
| `pr-review.aiExplain` | Explain changes | `Ctrl+Shift+Alt+X` |
| `pr-review.aiFix` | Get AI fix suggestion | `Ctrl+Shift+Alt+F` |
| `pr-review.securityScan` | Security scan | `Ctrl+Shift+Alt+S` |
| `pr-review.approve` | Approve PR | - |
| `pr-review.requestChanges` | Request changes | - |

---

## 🌐 Supported Platforms

| Platform | Support | Auth Method |
|----------|---------|-------------|
| GitHub | ✅ Full | OAuth / Personal Token |
| GitLab | ✅ Full | OAuth / Personal Token |
| Bitbucket | 🔜 Coming Soon | - |
| Azure DevOps | 🔜 Planned | - |

---

## 🔗 Integration Points

### With RiftAI
- AI review powered by RiftAI
- AI explains changes in chat
- AI suggests fixes
- AI generates summaries

### With Error Lens
- Inline error highlighting on diff
- Click error → Ask AI to explain

### With GitLens
- View commit history
- See who changed what
- Blame information

---

## 📊 Review Types

| Type | Description | AI-Powered |
|------|-------------|------------|
| **Code Quality** | Style, readability, best practices | ✅ |
| **Bug Detection** | Potential bugs, null checks, edge cases | ✅ |
| **Security** | Vulnerabilities, injection risks | ✅ |
| **Performance** | N+1 queries, inefficient loops | ✅ |
| **Best Practices** | React hooks, TypeScript patterns | ✅ |
| **Documentation** | Missing docs, JSDoc | ✅ |

---

## 🎯 Use Cases

### 1. Quick Code Review
1. Open PR in RiftCode
2. Click "AI Review" 
3. AI highlights all issues
4. Click issue to jump to code
5. Click "Fix with AI" to get fix
6. Apply fix and re-review

### 2. Security Audit
1. Open security-sensitive PR
2. Click "Security Scan"
3. AI scans for vulnerabilities
4. Get detailed report with fixes

### 3. PR Summary
1. Open large PR (100+ files)
2. Click "AI Summary"
3. Get concise summary of changes
4. Ask follow-up questions

---

## 🚀 Roadmap

### Phase 1: MVP
- [x] GitHub PR list view
- [x] Side-by-side diff
- [x] Basic AI review
- [ ] Inline comments
- [ ] Approve/Request changes

### Phase 2: Enhanced
- [ ] GitLab support
- [ ] Advanced AI analysis
- [ ] Security scanning
- [ ] Performance analysis
- [ ] Team collaboration

### Phase 3: Pro
- [ ] Real-time PR monitoring
- [ ] Slack/Teams notifications
- [ ] Custom review rules
- [ ] CI/CD integration
- [ ] Batch reviews

---

*PR Review Extension v1.0.0*  
*For RiftCode - AI-Native Development Environment*