import fs from 'fs/promises'
import { Option, createCommand } from '@commander-js/extra-typings'
import inquirer from 'inquirer'
import ora from 'ora'
import chalk from 'chalk'
import plist from 'plist'
import type { FileType } from '../utils/file.js'
import { fileTypes, getFileExtensionFromType, getFilePaths } from '../utils/file.js'
import { plural } from '../utils/string.js'
import { getErrorMessage } from '../utils/error.js'
import { config } from './config.js'

export const infoCommand = createCommand('info')
  .description('Display information about the selected project or component.')
  .addOption(
    new Option('-t, --type <type>', 'Display information about the selected type.')
      .choices(fileTypes)
      .default('project')
      .argParser((value) => {
        if (!fileTypes.includes(value as FileType)) {
          throw new Error(`type must be one of ${fileTypes.map((type) => `"${type}"`).join(', ')}`)
        }

        return value as FileType
      })
  )
  .action(async ({ type }) => {
    await printInfo(type as FileType)
  })

async function printInfo(fileType: FileType): Promise<void> {
  const spinner = ora(`Loading ${fileType}s...`).start()

  try {
    switch (fileType) {
      case 'component':
        {
          const filePaths = await getFilePaths(
            getFileExtensionFromType(fileType),
            config.directory[fileType]
          )

          if (filePaths.length === 0) {
            spinner.fail(`No ${fileType}s found.`)
            return
          }

          spinner.succeed(
            chalk.green(`Found ${filePaths.length} ${plural(filePaths.length, 'component')}.`)
          )

          const response = await inquirer.prompt<{
            files: string[]
          }>([
            {
              type: 'checkbox',
              name: 'files',
              message: `Select ${fileType}s to view their information.`,
              choices: filePaths.map((path) => ({
                name: path,
                value: path,
              })),
            },
          ])

          const files = await Promise.all(
            response.files.map((component) => getComponentInfo(component))
          )

          console.log(files.map((file) => renderComponent(file)).join('\n\n'))
        }
        break

      case 'project': {
        spinner.succeed()
        const unknownBinaryPath = `/Volumes/data-ssd/audio/Logic/discondition/bounce/20200523-bounce.logicx/Alternatives/000/ProjectData`
        const data = await fs.readFile(unknownBinaryPath, { encoding: 'hex' })
        console.log(data.slice(0, 1000))
      }
    }
  } catch (error) {
    spinner.fail(getErrorMessage(error))
  }
}

type AUComponentInfo = {
  name: string
  version: string
  author: string
  type: 'Effect' | 'Virtual Instrument' | 'Unknown'
}

function renderComponent(component: AUComponentInfo): string {
  return `Name: ${component.name}
Version: ${component.version}
Type: ${component.type}`
}

async function getComponentInfo(componentPath: string): Promise<AUComponentInfo> {
  const unknown = 'Unknown'
  const plistPath = `${componentPath}/Contents/Info.plist`
  const data = await fs.readFile(plistPath, { encoding: 'utf-8' })

  const { AudioComponents, CFBundleName, CFBundleShortVersionString } = plist.parse(
    data.toString()
  ) as AUComponentPlist

  const component = AudioComponents?.[0]

  let name = component?.name || CFBundleName || unknown
  let author = component?.manufacturer || unknown

  const nameParts = name.split(': ')
  if (nameParts.length === 2) {
    author = nameParts[0]
    name = nameParts[1]
  }

  let type: AUComponentInfo['type'] = 'Unknown'

  if (component?.type === AUComponentType.Effect) {
    type = 'Effect'
  } else if (component?.type === AUComponentType.Instrument) {
    type = 'Virtual Instrument'
  }

  return {
    name,
    author,
    version: CFBundleShortVersionString || unknown,
    type,
  }
}

enum AUComponentType {
  Effect = 'aufx',
  Instrument = 'aumu',
}

type AUComponentPlist = {
  AudioComponents?: AudioComponent[]
  CFBundleName?: string
  CFBundleShortVersionString?: string
}

type AudioComponent = {
  description: string
  manufacturer: string
  name: string
  type: AUComponentType
}

/**
 * MetaData for a Logic project alternative.
 */
type MetaData = {
  SamplerInstrumentsFiles: unknown[]
  isTimeCodeBased: boolean
  SongKey: string
  AudioFiles: string[]
  NumberOfTracks: number
  VideoFiles: unknown[]
  PlaybackFiles: unknown[]
  SampleRate: number
  UnusedAudioFiles: unknown[]
  AlchemyFiles: unknown[]
  SongGenderKey: string
  ImpulsResponsesFiles: unknown[]
  FrameRateIndex: number
  SongSignatureNumerator: number
  BeatsPerMinute: number
  SignatureKey: number
  Version: number
  SongSignatureDenominator: number
  SurroundFormatIndex: number
  UltrabeatFiles: unknown[]
}
