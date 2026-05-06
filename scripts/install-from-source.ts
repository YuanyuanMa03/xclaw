#!/usr/bin/env bun
import { $ } from 'bun'
import { join } from 'path'
import { existsSync } from 'fs'

const ROOT = join(import.meta.dir, '..')

async function main() {
  console.log('')
  console.log(' ██╗  ██╗ ██████╗██╗      █████╗ ██╗    ██╗')
  console.log(' ╚██╗██╔╝██╔════╝██║     ██╔══██╗██║    ██║')
  console.log('  ╚███╔╝ ██║     ██║     ███████║██║ █╗ ██║')
  console.log('  ██╔██╗ ██║     ██║     ██╔══██║██║███╗██║')
  console.log(' ██╔╝ ██╗╚██████╗███████╗██║  ██║╚███╔███╔╝')
  console.log(' ╚═╝  ╚═╝ ╚═════╝╚══════╝╚═╝  ╚═╝ ╚══╝╚══╝')
  console.log('')
  console.log('  超越人类与 AI 的边界')
  console.log('')
  console.log('📦 从源码安装 xclaw...')
  console.log('')

  // Check for Bun
  let hasBun = false
  try {
    await $`bun --version`.quiet()
    hasBun = true
    console.log('✅ 检测到 Bun')
  } catch {
    console.log('⚠️  未检测到 Bun，将使用 Node.js')
  }

  // Check for Node.js
  try {
    const nodeVer = await $`node -v`.text()
    const major = parseInt(nodeVer.replace('v', '').split('.')[0])
    if (major < 18) {
      console.log(`❌ Node.js 版本过低 (需要 >= 18, 当前: ${nodeVer.trim()})`)
      process.exit(1)
    }
    console.log(`✅ Node.js ${nodeVer.trim()}`)
  } catch {
    console.log('❌ 需要 Node.js >= 18')
    console.log('   下载: https://nodejs.org')
    process.exit(1)
  }

  console.log('')

  // Install dependencies
  console.log('📥 安装依赖...')
  if (hasBun) {
    await $`bun install`.cwd(ROOT)
  } else {
    await $`npm install`.cwd(ROOT)
  }

  // Build
  console.log('')
  console.log('🔨 构建...')
  if (hasBun) {
    await $`bun run build`.cwd(ROOT)
  } else {
    // For npm, we need to use the build script directly
    await $`node build.ts`.cwd(ROOT)
  }

  // Verify dist exists
  const distCli = join(ROOT, 'dist', 'cli-node.js')
  if (!existsSync(distCli)) {
    console.log('❌ 构建失败: dist/cli-node.js 不存在')
    process.exit(1)
  }

  console.log('')
  console.log('🔗 全局安装...')

  // Detect platform
  const platform = process.platform
  const isWindows = platform === 'win32'

  if (isWindows) {
    // Windows: create batch wrapper
    const localAppData = process.env.LOCALAPPDATA || ''
    const installDir = join(localAppData, 'xclaw')

    // Create directory
    await $`mkdir -p ${installDir}`.quiet()

    // Create batch wrapper
    const batchContent = `@echo off
node "${join(ROOT, 'dist', 'cli-node.js')}" %*
`
    await Bun.write(join(installDir, 'xclaw.cmd'), batchContent)

    // Add to PATH
    const currentPath = process.env.PATH || ''
    if (!currentPath.includes(installDir)) {
      console.log(`⚠️  请将以下路径添加到 PATH:`)
      console.log(`   ${installDir}`)
    }

    console.log('')
    console.log(`✅ xclaw 已安装到: ${installDir}`)
  } else {
    // macOS/Linux: create symlink
    let installDir = '/usr/local/bin'

    // Check write permission
    try {
      await $`test -w ${installDir}`.quiet()
    } catch {
      installDir = join(process.env.HOME || '~', '.local-bin')
      await $`mkdir -p ${installDir}`.quiet()
      console.log(`⚠️  /usr/local/bin 无写入权限`)
      console.log(`   安装到: ${installDir}`)
      console.log(`   请确保 ${installDir} 在 PATH 中`)
    }

    // Create symlink
    const linkPath = join(installDir, 'xclaw')
    await $`ln -sf ${distCli} ${linkPath}`.quiet()
    await $`chmod +x ${distCli}`.quiet()

    console.log('')
    console.log(`✅ xclaw 已安装到: ${linkPath}`)
  }

  console.log('')
  console.log('🚀 安装完成!')
  console.log('')
  console.log('使用方式:')
  console.log('   xclaw              # 启动')
  console.log('   xclaw --version    # 查看版本')
  console.log('   xclaw --help       # 查看帮助')
  console.log('')
  console.log('首次配置:')
  console.log('   启动后输入 /login 配置 API')
  console.log('')
  console.log('更新:')
  console.log('   cd ' + ROOT)
  console.log('   git pull')
  if (hasBun) {
    console.log('   bun install && bun run build')
  } else {
    console.log('   npm install && node build.ts')
  }
  console.log('')
}

main().catch(err => {
  console.error('❌ 安装失败:', err.message)
  process.exit(1)
})
