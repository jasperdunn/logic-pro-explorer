import { execSync, spawnSync } from 'child_process'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

export const packagePath = resolve(dirname(fileURLToPath(import.meta.url)), '../dist/index.js')

export function runCommand(command: string): string {
  return execSync(`node ${packagePath} ${command}`).toString()
}

export function runSpawnedCommand(command: string, input = ''): string {
  const result = spawnSync('node', [packagePath, command], { input })
  if (result.status !== 0) {
    throw new Error(`Command '${command}' failed with exit code ${result.status}.`)
  }
  return result.stdout.toString()
}
