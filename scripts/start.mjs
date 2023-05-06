import { spawn } from 'child_process'

const args = process.argv.slice(2)
const command = `chokidar src/*.ts --initial --silent -c "tsc && node dist/src/index.js ${args.join(
  ' '
)}"`

const child = spawn(command, {
  stdio: 'inherit',
  shell: true,
})

child.on('close', (code) => {
  process.exit(code)
})
