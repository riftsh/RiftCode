/*---------------------------------------------------------------------------------------------
 *  Diff Service - Parse and process diff content
 *--------------------------------------------------------------------------------------------*/

interface DiffFile {
  filename: string
  status: 'added' | 'modified' | 'deleted' | 'renamed'
  additions: number
  deletions: number
  patch?: string
  content?: string
  oldContent?: string
  newContent?: string
}

interface DiffLine {
  type: 'add' | 'delete' | 'context'
  content: string
  oldLineNumber?: number
  newLineNumber?: number
}

export class DiffService {
  /**
   * Parse unified diff into structured format
   */
  parseDiff(diff: string): DiffFile[] {
    const files: DiffFile[] = []
    const fileChunks = diff.split(/^diff --git /m).filter(Boolean)

    for (const chunk of fileChunks) {
      const file = this.parseFileChunk(chunk)
      if (file) {
        files.push(file)
      }
    }

    return files
  }

  /**
   * Parse a single file from diff chunk
   */
  private parseFileChunk(chunk: string): DiffFile | null {
    const lines = chunk.split('\n')

    // Parse header
    const headerMatch = lines[0].match(/a\/(.+?) b\/(.+)/)
    if (!headerMatch) return null

    const filename = headerMatch[2]
    let status: 'added' | 'modified' | 'deleted' | 'renamed' = 'modified'
    let additions = 0
    let deletions = 0

    // Parse status from chunk
    if (chunk.includes('new file mode')) {
      status = 'added'
    } else if (chunk.includes('deleted file mode')) {
      status = 'deleted'
    }

    // Parse stats
    const statMatch = chunk.match(/(\d+) insertions?\(\+\)/\)
    if (statMatch) {
      additions = parseInt(statMatch[1], 10)
    }

    const delMatch = chunk.match(/(\d+) deletions?\(\-\)/\)
    if (delMatch) {
      deletions = parseInt(delMatch[1], 10)
    }

    // Extract patch
    const patchStart = chunk.indexOf('@@')
    let patch = ''
    if (patchStart !== -1) {
      patch = chunk.substring(patchStart)
    }

    return {
      filename,
      status,
      additions,
      deletions,
      patch
    }
  }

  /**
   * Parse individual file diff with line details
   */
  parseFileDiff(diff: string): DiffLine[] {
    const lines: DiffLine[] = []
    const diffLines = diff.split('\n')

    let oldLine = 0
    let newLine = 0

    for (const line of diffLines) {
      if (line.startsWith('@@')) {
        // Parse hunk header
        const match = line.match(/@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/)
        if (match && match.length >= 2) {
          oldLine = parseInt(match[1], 10)
          newLine = parseInt(match[2], 10)
        }
      } else if (line.startsWith('+')) {
        lines.push({
          type: 'add',
          content: line.substring(1),
          newLineNumber: newLine++
        })
      } else if (line.startsWith('-')) {
        lines.push({
          type: 'delete',
          content: line.substring(1),
          oldLineNumber: oldLine++
        })
      } else if (line.startsWith(' ')) {
        lines.push({
          type: 'context',
          content: line.substring(1),
          oldLineNumber: oldLine++,
          newLineNumber: newLine++
        })
      }
    }

    return lines
  }

  /**
   * Generate side-by-side diff view
   */
  generateSideBySide(left: string, right: string): { left: string[]; right: string[]; inline: boolean[] } {
    const leftLines = left.split('\n')
    const rightLines = right.split('\n')
    const result = this.alignLines(leftLines, rightLines)

    return {
      left: result.left.map(l => l.content),
      right: result.right.map(l => l.content),
      inline: result.inline
    }
  }

  /**
   * Align lines for side-by-side view
   */
  private alignLines(left: string[], right: string[]): { left: LineInfo[]; right: LineInfo[]; inline: boolean[] } {
    const leftResult: LineInfo[] = []
    const rightResult: LineInfo[] = []
    const inline: boolean[] = []

    // Simple alignment - can be improved with Myers diff algorithm
    let i = 0, j = 0

    while (i < left.length || j < right.length) {
      if (i >= left.length) {
        // Only right has content
        leftResult.push({ content: '', lineNumber: 0 })
        rightResult.push({ content: right[j], lineNumber: j + 1 })
        inline.push(false)
        j++
      } else if (j >= right.length) {
        // Only left has content
        leftResult.push({ content: left[i], lineNumber: i + 1 })
        rightResult.push({ content: '', lineNumber: 0 })
        inline.push(false)
        i++
      } else if (left[i] === right[j]) {
        // Same content
        leftResult.push({ content: left[i], lineNumber: i + 1 })
        rightResult.push({ content: right[j], lineNumber: j + 1 })
        inline.push(true)
        i++
        j++
      } else {
        // Different content - show both
        leftResult.push({ content: left[i], lineNumber: i + 1 })
        rightResult.push({ content: right[j], lineNumber: j + 1 })
        inline.push(false)
        i++
        j++
      }
    }

    return { left: leftResult, right: rightResult, inline }
  }

  /**
   * Get summary of diff
   */
  getDiffSummary(diff: string): { files: number; additions: number; deletions: number } {
    const files = this.parseDiff(diff)

    return {
      files: files.length,
      additions: files.reduce((sum, f) => sum + f.additions, 0),
      deletions: files.reduce((sum, f) => sum + f.deletions, 0)
    }
  }

  /**
   * Extract code context around a line
   */
  getContextAroundLine(diff: string, targetLine: number, contextSize = 3): string[] {
    const lines = diff.split('\n')
    const context: string[] = []
    let currentLine = 0

    for (const line of lines) {
      if (line.startsWith('@@')) {
        const match = line.match(/@@ -(\d+)/)
        if (match && match.length >= 1) {
          currentLine = parseInt(match[1], 10)
        }
      }

      if (line.startsWith('+') || line.startsWith('-') || line.startsWith(' ')) {
        currentLine++
      }

      if (Math.abs(currentLine - targetLine) <= contextSize) {
        context.push(line)
      }
    }

    return context
  }
}

interface LineInfo {
  content: string
  lineNumber: number
}