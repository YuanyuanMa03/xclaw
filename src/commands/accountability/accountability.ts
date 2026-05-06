import type { LocalCommandCall } from '../../types/command.js'
import {
  clearAccountabilityEntries,
  formatAccountabilitySummary,
  isAccountabilityEnabled,
  setAccountabilityEnabled,
} from '../../hooks/useCodeAccountability.js'

export const call: LocalCommandCall = async args => {
  const sub = (args || '').trim().toLowerCase()

  switch (sub) {
    case 'on':
    case 'enable':
      setAccountabilityEnabled(true)
      return {
        type: 'text',
        value:
          'Accountability tracking ON — all file modifications will be logged.',
      }
    case 'off':
    case 'disable':
      setAccountabilityEnabled(false)
      return { type: 'text', value: 'Accountability tracking OFF.' }
    case 'log':
    case 'list':
    case 'status':
      return { type: 'text', value: formatAccountabilitySummary() }
    case 'clear':
      clearAccountabilityEntries()
      return { type: 'text', value: 'Accountability log cleared.' }
    default: {
      const status = isAccountabilityEnabled() ? 'ON' : 'OFF'
      return {
        type: 'text',
        value:
          `Accountability tracking: ${status}\n\n` +
          'Usage: /accountability [on|off|log|clear]\n' +
          '  on/off  — toggle tracking\n' +
          '  log     — show modification history\n' +
          '  clear   — clear the log',
      }
    }
  }
}
