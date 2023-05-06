import { execSync } from 'child_process'
import { resolve } from 'path'

export function runCommand(command: string): string {
  return execSync(`node ${resolve(__dirname, '../dist/src/index.js')} ${command}`).toString()
}
