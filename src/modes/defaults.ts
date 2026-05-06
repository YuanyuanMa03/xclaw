import type { XclawMode } from './types.js'
import { DR_SHARP_SYSTEM_PROMPT } from '../personas/sharp.js'

export const DEFAULT_MODES: XclawMode[] = [
  {
    name: '默认',
    slug: 'default',
    description: '平衡模式，适合日常开发',
    icon: '⚡',
    systemPrompt: '',
    ui: {
      accentColor: '#D77757',
      promptPrefix: '',
    },
    companionSpecies: 'duck',
    permissions: {
      defaultMode: 'default',
      memoryExtract: true,
    },
    responseStyle: {
      verbosity: 'normal',
    },
  },
  {
    name: '温柔',
    slug: 'gentle',
    description: '耐心解释，适合学习和探索',
    icon: '🌸',
    companionSpecies: 'cat',
    systemPrompt:
      'You are in gentle learning mode. Explain concepts clearly with examples. ' +
      'When correcting mistakes, be encouraging and explain why. ' +
      'Offer to show alternatives before making changes. ' +
      'Use analogies to help理解 complex concepts.',
    ui: {
      accentColor: '#E8A0BF',
      promptPrefix: '温柔',
    },
    permissions: {
      defaultMode: 'default',
      memoryExtract: true,
    },
    responseStyle: {
      verbosity: 'verbose',
    },
  },
  {
    name: 'Dr. Sharp',
    slug: 'sharp',
    description: '严格审查，专注代码质量',
    icon: '🔍',
    companionSpecies: 'owl',
    systemPrompt: DR_SHARP_SYSTEM_PROMPT,
    ui: {
      accentColor: '#5769F7',
      promptPrefix: 'Sharp',
    },
    permissions: {
      defaultMode: 'default',
      memoryExtract: true,
    },
    responseStyle: {
      verbosity: 'normal',
    },
  },
  {
    name: '苦力',
    slug: 'workhorse',
    description: '自动执行，减少确认',
    icon: '🐴',
    companionSpecies: 'capybara',
    systemPrompt:
      'You are in workhorse mode. Execute tasks efficiently with minimal back-and-forth. ' +
      'Make reasonable assumptions and proceed. ' +
      'Only ask for clarification when truly ambiguous. ' +
      'Batch related changes together.',
    ui: {
      accentColor: '#8B7355',
      promptPrefix: '苦力',
    },
    permissions: {
      defaultMode: 'acceptEdits',
      memoryExtract: false,
    },
    responseStyle: {
      verbosity: 'minimal',
    },
  },
  {
    name: '省token',
    slug: 'token-saver',
    description: '极简回复，节省消耗',
    icon: '💰',
    companionSpecies: 'snail',
    systemPrompt:
      'You are in token-saving mode. ' +
      'Give the shortest correct answer. ' +
      'Skip explanations unless asked. ' +
      'Use code blocks directly without preamble. ' +
      'No pleasantries or filler.',
    ui: {
      accentColor: '#4A7C59',
      promptPrefix: '省',
    },
    permissions: {
      defaultMode: 'acceptEdits',
      memoryExtract: false,
    },
    responseStyle: {
      verbosity: 'minimal',
    },
  },
  {
    name: '超级AI',
    slug: 'super-ai',
    description: '深度思考，全面分析',
    icon: '🧠',
    companionSpecies: 'dragon',
    systemPrompt:
      'You are in super AI mode. Think deeply before responding. ' +
      'Consider multiple approaches and explain trade-offs. ' +
      'Proactively identify related issues and suggest improvements. ' +
      'Use structured analysis for complex problems. ' +
      'Reference relevant best practices and patterns.',
    ui: {
      accentColor: '#9B59B6',
      promptPrefix: '超级',
    },
    permissions: {
      defaultMode: 'default',
      memoryExtract: true,
    },
    responseStyle: {
      verbosity: 'verbose',
    },
  },
]
