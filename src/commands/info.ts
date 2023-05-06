import fs from 'fs'
import { Option, createCommand } from '@commander-js/extra-typings'
import { prompt } from 'inquirer'
import ora from 'ora'
import chalk from 'chalk'
import plist from 'plist'
import { FileType, fileTypes, getFileExtensionFromType, getFilePaths } from '../utils/file'
import { plural } from '../utils/string'
import { getErrorMessage } from '../utils/error'
import { config } from './config'

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
    printComponentInfo(type as FileType)
  })

async function printComponentInfo(fileType: FileType): Promise<void> {
  const spinner = ora(`Loading ${fileType}s...`).start()
  const componentPaths = getFilePaths(
    getFileExtensionFromType(fileType),
    config.directory[fileType]
  )

  if (componentPaths.length === 0) {
    spinner.fail('No components found.')
    return
  }

  spinner.succeed(
    chalk.green(`Found ${componentPaths.length} ${plural(componentPaths.length, 'component')}.`)
  )

  try {
    const response = await prompt<{
      components: string[]
    }>([
      {
        type: 'checkbox',
        name: 'components',
        message: 'Select components to view their information.',
        choices: componentPaths.map((path) => ({
          name: path,
          value: path,
        })),
      },
    ])

    console.log(
      response.components
        .map((component) => renderComponent(getComponentInfo(component)))
        .join('\n\n')
    )
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

function getComponentInfo(componentPath: string): AUComponentInfo {
  const unknown = 'Unknown'
  const plistPath = `${componentPath}/Contents/Info.plist`
  const data = fs.readFileSync(plistPath)

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
