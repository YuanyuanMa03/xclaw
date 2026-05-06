import type { LocalCommandCall } from '../../types/command.js'
import { setCurrentMode } from '../../modes/store.js'

export const call: LocalCommandCall = async () => {
  setCurrentMode('sharp')
  return {
    type: 'text',
    value:
      '🔍 Dr. Sharp 模式已激活 — 绝对精准、锋利的心理手术刀。\n' +
      '三阶段工作流: 深度诊断 → 行动策略 → 镜像自我',
  }
}
