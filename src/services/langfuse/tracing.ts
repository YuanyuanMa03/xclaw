/**
 * Langfuse tracing — disabled in xclaw.
 * All functions are no-ops. The @langfuse/tracing package is not installed.
 */

export type LangfuseSpan = {
  id: string
  otelSpan: { spanContext: () => unknown; setAttribute: () => void }
  update: (p: Record<string, unknown>) => void
  end: (t?: Date) => void
}

type LangfuseGeneration = LangfuseSpan & {
  update: (p: Record<string, unknown>) => void
}

export function createTrace(_params: {
  sessionId: string
  model: string
  provider: string
  input?: unknown
  name?: string
  querySource?: string
  username?: string
}): LangfuseSpan | null {
  return null
}

export function recordLLMObservation(
  _rootSpan: LangfuseSpan | null,
  _params: {
    model: string
    provider: string
    input: unknown
    output: unknown
    usage: {
      input_tokens: number
      output_tokens: number
      cache_creation_input_tokens?: number
      cache_read_input_tokens?: number
    }
    startTime?: Date
    endTime?: Date
    completionStartTime?: Date
    tools?: unknown
    thinking?: { type: string; budget_tokens?: number; budgetTokens?: number }
  },
): void {}

export function recordToolObservation(
  _rootSpan: LangfuseSpan | null,
  _params: {
    toolName: string
    toolUseId: string
    input: unknown
    output: string
    startTime?: Date
    isError?: boolean
    parentBatchSpan?: LangfuseSpan | null
  },
): void {}

export function createToolBatchSpan(
  _rootSpan: LangfuseSpan | null,
  _params: { toolNames: string[]; batchIndex: number },
): LangfuseSpan | null {
  return null
}

export function endToolBatchSpan(_batchSpan: LangfuseSpan | null): void {}

export function createSubagentTrace(_params: {
  sessionId: string
  agentType: string
  agentId: string
  model: string
  provider: string
  input?: unknown
  username?: string
}): LangfuseSpan | null {
  return null
}

export function createChildSpan(
  _parentSpan: LangfuseSpan | null,
  _params: {
    name: string
    sessionId: string
    model: string
    provider: string
    input?: unknown
    querySource?: string
    username?: string
  },
): LangfuseSpan | null {
  return null
}

export function endTrace(
  _rootSpan: LangfuseSpan | null,
  _output?: unknown,
  _status?: 'interrupted' | 'error',
): void {}
