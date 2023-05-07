import { createCommand } from '@commander-js/extra-typings'
import inquirer from 'inquirer'
import { packageProperties } from '../utils/file.js'
import { removeConfig } from './config.js'

const { name } = packageProperties

export const uninstallCommand = createCommand('uninstall')
  .description(`Remove ${name} from your computer.`)
  .action(async () => {
    try {
      const { confirmed } = await inquirer.prompt<{ confirmed: boolean }>([
        {
          type: 'confirm',
          name: 'confirmed',
          message: `Are you sure you want to uninstall ${name}?`,
        },
      ])

      if (!confirmed) {
        return
      }

      await removeConfig()
    } catch (error) {
      console.error(error)
    }
  })
