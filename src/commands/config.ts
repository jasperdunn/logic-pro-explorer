import os from 'os'
import fs from 'fs/promises'
import path from 'path'
import { createCommand } from '@commander-js/extra-typings'
import { getErrorMessage } from '../utils/error.js'
import { iterativeMerge } from '../utils/object.js'
import type { DeepPartial } from '../types.js'
import type { FileType } from '../utils/file.js'
import { doesPathExist, packageProperties } from '../utils/file.js'

const { name } = packageProperties

export const projectDirectoryFlags = '-p, --project-directory <path>'
export const componentDirectoryFlags = '-c, --component-directory <path>'

export const configPath = `/Users/${os.userInfo().username}/.${name}/config.json`
const defaultProjectDirectory = `/Users/${os.userInfo().username}/Music/Logic/`
const defaultComponentDirectory = '/Library/Audio/Plug-Ins/Components/'

export const config = await getConfig()

export const configCommand = createCommand('config')
  .description('Set configuration options.')
  .option(projectDirectoryFlags, 'Set the directory to scan for Logic projects.')
  .option(componentDirectoryFlags, 'Set the directory to scan for components.')
  .option('-r, --reset', 'Reset the configuration to the default values.')
  .action(async ({ projectDirectory, componentDirectory, reset }) => {
    if (reset) {
      await initializeConfig({ reset: true })
      return
    }

    if (projectDirectory || componentDirectory) {
      await updateConfig({
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
async function initializeConfig(options?: InitializeConfigOptions): Promise<void> {
  try {
    if (!options?.reset && (await doesPathExist(configPath))) {
      return
    }

    const configDirectoryPath = path.dirname(configPath)
    if (!(await doesPathExist(configDirectoryPath))) {
      await fs.mkdir(configDirectoryPath)
    }

    const configData: Config = {
      directory: {
        project: defaultProjectDirectory,
        component: defaultComponentDirectory,
      },
    }

    await fs.writeFile(configPath, JSON.stringify(configData, null, 2))
  } catch (error) {
    throw new Error(
      `An error occurred while initializing the config file.\n${getErrorMessage(error)}`
    )
  }
}

async function getConfig(): Promise<Config> {
  try {
    await initializeConfig()

    return JSON.parse(await fs.readFile(configPath, { encoding: 'utf-8' })) as Config
  } catch (error) {
    throw new Error(`An error occurred while reading the config file.\n${getErrorMessage(error)}`)
  }
}

export async function updateConfig(partialConfig: DeepPartial<Config>): Promise<void> {
  try {
    await fs.writeFile(configPath, JSON.stringify(iterativeMerge(config, partialConfig), null, 2), {
      encoding: 'utf-8',
    })
  } catch (error) {
    throw new Error(`An error occurred while updating the config file.\n${getErrorMessage(error)}`)
  }
}

export async function removeConfig(): Promise<void> {
  try {
    await fs.rm(path.dirname(configPath), {
      force: true,
      recursive: true,
    })
  } catch (error) {
    throw new Error(`An error occurred while removing the config file.\n${getErrorMessage(error)}`)
  }
}
