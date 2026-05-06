/**
 * Code accountability tracking — records file modifications made by AI tools.
 *
 * When enabled, intercepts FileEditTool/FileWriteTool results and logs:
 * - file path, line count change, timestamp
 * - optional user annotation (why was this change made?)
 *
 * This is a lightweight audit trail, not a blocking gate.
 */

export interface AccountabilityEntry {
  timestamp: number
  tool: string
  filePath: string
  linesAdded: number
  linesRemoved: number
  annotation?: string
}

let enabled = false
const entries: AccountabilityEntry[] = []

export function isAccountabilityEnabled(): boolean {
  return enabled
}

export function setAccountabilityEnabled(value: boolean): void {
  enabled = value
}

export function addAccountabilityEntry(entry: AccountabilityEntry): void {
  if (!enabled) return
  entries.push(entry)
}

export function getAccountabilityEntries(): readonly AccountabilityEntry[] {
  return entries
}

export function clearAccountabilityEntries(): void {
  entries.length = 0
}

export function formatAccountabilitySummary(): string {
  if (entries.length === 0) return 'No tracked modifications.'
  const lines = entries.map(e => {
    const time = new Date(e.timestamp).toLocaleTimeString()
    const delta = `+${e.linesAdded}/-${e.linesRemoved}`
    return `  ${time}  ${e.tool.padEnd(16)} ${e.filePath}  ${delta}`
  })
  return `Code Accountability (${entries.length} modifications):\n${lines.join('\n')}`
}
