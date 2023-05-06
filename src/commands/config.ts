import os from 'os'
import fs from 'fs'
import path from 'path'
import { createCommand } from '@commander-js/extra-typings'
import { name as packageName } from '../../package.json'
import { getErrorMessage } from '../utils/error'
import { iterativeMerge } from '../utils/object'
import { DeepPartial } from '../types'
import { FileType } from '../utils/file'

export const projectDirectoryFlags = '-p, --project-directory <path>'
export const componentDirectoryFlags = '-c, --component-directory <path>'

const configPath = `/Users/${os.userInfo().username}/.${packageName}/config.json`
const defaultProjectDirectory = `/Users/${os.userInfo().username}/Music/Logic/`
const defaultComponentDirectory = '/Library/Audio/Plug-Ins/Components/'

export const config = getConfig()

export const configCommand = createCommand('config')
  .description('Set configuration options.')
  .option(projectDirectoryFlags, 'Set the directory to scan for Logic projects.')
  .option(componentDirectoryFlags, 'Set the directory to scan for components.')
  .option('-r, --reset', 'Reset the configuration to the default values.')
  .action(({ projectDirectory, componentDirectory, reset }) => {
    if (reset) {
      initializeConfig({ reset: true })
      return
    }

    if (projectDirectory || componentDirectory) {
      updateConfig({
        directory: {
          component: componentDirectory,
          project: projectDirectory,
        },
      })
    }
  })

type Config = {
  directory: Record<FileType, string>
}

type InitializeConfigOptions = {
  reset: true
}
function initializeConfig(options?: InitializeConfigOptions): void {
  try {
    if (!options?.reset && fs.existsSync(configPath)) {
      return
    }

    const configDirectoryPath = path.dirname(configPath)
    if (!fs.existsSync(configDirectoryPath)) {
      fs.mkdirSync(configDirectoryPath)
    }

    const configData: Config = {
      directory: {
        project: defaultProjectDirectory,
        component: defaultComponentDirectory,
      },
    }

    fs.writeFileSync(configPath, JSON.stringify(configData, null, 2))
  } catch (error) {
    throw new Error(
      `An error occurred while initializing the config file.\n${getErrorMessage(error)}`
    )
  }
}

function getConfig(): Config {
  try {
    initializeConfig()

    return JSON.parse(fs.readFileSync(configPath, 'utf-8')) as Config
  } catch (error) {
    throw new Error(`An error occurred while reading the config file.\n${getErrorMessage(error)}`)
  }
}

function updateConfig(partialConfig: DeepPartial<Config>): void {
  try {
    fs.writeFileSync(configPath, JSON.stringify(iterativeMerge(config, partialConfig), null, 2))
  } catch (error) {
    throw new Error(`An error occurred while updating the config file.\n${getErrorMessage(error)}`)
  }
}
