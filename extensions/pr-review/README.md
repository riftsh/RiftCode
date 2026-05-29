# 🔀 PR Review Extension

**AI-Powered Pull Request Review in your editor**

Review GitHub/GitLab pull requests directly in RiftCode with intelligent AI-powered code analysis.

---

## 🌟 Features

### PR Management
- View all open/closed PRs in sidebar
- Side-by-side diff viewer with syntax highlighting
- Inline comments and review threads
- Approve or request changes

### AI-Powered Review
- **Auto Review** - AI analyzes entire PR and reports issues
- **Explain Changes** - AI explains what changed and why
- **Security Scan** - AI-powered vulnerability detection
- **Suggest Fixes** - AI suggests fixes for issues found

### Integration
- GitHub and GitLab support
- Works with RiftAI for intelligent analysis
- Error Lens integration for inline issues

---

## 🚀 Quick Start

1. **Open PR Review**: `Ctrl+Shift+Alt+P` or click the PR icon in activity bar
2. **Select PR**: Choose from the PR list
3. **Review Diff**: View changes in side-by-side viewer
4. **AI Review**: Click "🤖 AI Review" for automated analysis

---

## ⌨️ Commands

| Command | Shortcut | Description |
|---------|----------|-------------|
| `pr-review.open` | `Ctrl+Shift+Alt+P` | Open PR Review |
| `pr-review.listPRs` | - | List all PRs |
| `pr-review.aiReview` | `Ctrl+Shift+Alt+R` | Full AI review |
| `pr-review.aiExplain` | `Ctrl+Shift+Alt+X` | Explain changes |
| `pr-review.aiFix` | - | Suggest fix for code |
| `pr-review.securityScan` | - | Security vulnerability scan |
| `pr-review.summarize` | - | AI-generated PR summary |

---

## 🤖 AI Features

### AI Review Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    AI Code Review Flow                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   1. User clicks "AI Review"                                 │
│         │                                                    │
│         ▼                                                    │
│   2. Extension fetches PR diff                               │
│         │                                                    │
│         ▼                                                    │
│   3. AI analyzes each file                                   │
│      ┌─────────────────────────────────────┐                 │
│      │ • Bug detection                      │                 │
│      │ • Security scanning                  │                 │
│      │ • Performance analysis               │                 │
│      │ • Style checking                     │                 │
│      └─────────────────────────────────────┘                 │
│         │                                                    │
│         ▼                                                    │
│   4. Results displayed in AI Panel                           │
│         │                                                    │
│         ▼                                                    │
│   5. Click issue → Jump to code                             │
│      Click "Fix with AI" → Get fix suggestion                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### AI-Generated Reports

| Issue Type | Description | Severity Levels |
|------------|-------------|-----------------|
| 🐛 Bugs | Potential bugs, null checks, edge cases | Critical, High, Medium, Low |
| 🔒 Security | Vulnerabilities, injection risks | Critical, High |
| ⚡ Performance | N+1 queries, inefficient code | High, Medium |
| 🎨 Style | Code style violations | Low |
| ✨ Best Practice | React hooks, patterns | Medium, Low |

---

## 🔧 Configuration

```json
{
  "prReview.enabled": true,
  "prReview.githubToken": "your-github-token",
  "prReview.gitlabToken": "your-gitlab-token",
  "prReview.aiEnabled": true,
  "prReview.autoReview": false,
  "prReview.includeSecurityScan": true,
  "prReview.includePerformanceScan": true
}
```

---

## 📁 Extension Structure

```
extensions/pr-review/
├── package.json              # Extension manifest
├── tsconfig.json            # TypeScript config
├── src/
│   ├── extension.ts         # Main entry
│   ├── services/
│   │   ├── githubService.ts  # GitHub API
│   │   ├── gitlabService.ts  # GitLab API
│   │   ├── diffService.ts    # Diff parsing
│   │   └── aiReviewService.ts # AI analysis
│   ├── providers/
│   │   └── prTreeProvider.ts # Tree view
│   └── views/
│       ├── prListView.ts    # PR list
│       ├── diffView.ts      # Diff viewer
│       └── aiReviewPanel.ts # AI results
└── README.md
```

---

## 🔗 Works With

- **RiftAI** - AI chat and analysis
- **Error Lens** - Inline error display
- **GitLens** - Git history context

---

## 📊 Comparison

| Feature | GitHub Web | VS Code GitHub | RiftCode PR Review |
|---------|------------|----------------|-------------------|
| Web-based | ✅ | ❌ | ❌ |
| Desktop | ❌ | ✅ | ✅ |
| Side-by-side diff | ✅ | ✅ | ✅ |
| Inline comments | ✅ | ✅ | ✅ |
| AI review | ❌ | ❌ | ✅ |
| Security scan | ❌ | ❌ | ✅ |
| IDE integration | ❌ | Partial | ✅ |

---

## 🗺️ Roadmap

- [ ] Batch PR reviews
- [ ] Slack/Teams notifications
- [ ] Custom review rules
- [ ] Real-time PR monitoring
- [ ] Bitbucket support
- [ ] Azure DevOps support

---

*PR Review v1.0.0 - Part of RiftCode AI Extension Pack*