import { spawn } from 'node:child_process'

const child = spawn(process.execPath, ['ace', 'test', ...process.argv.slice(2)], {
  stdio: 'inherit',
  shell: false,
  env: {
    ...process.env,
    NODE_ENV: 'test',
    DB_CONNECTION: 'sqlite',
    SESSION_DRIVER: 'memory',
  },
})

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal)
    return
  }

  process.exit(code ?? 1)
})
