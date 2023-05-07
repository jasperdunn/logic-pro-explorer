import { program } from '@commander-js/extra-typings'
import chalk from 'chalk'
import { treeCommand } from './commands/tree.js'
import { getErrorMessage } from './utils/error.js'
import { configCommand } from './commands/config.js'
import { findCommand } from './commands/find.js'
import { infoCommand } from './commands/info.js'
import { uninstallCommand } from './commands/uninstall.js'
import { packageProperties } from './utils/file.js'

try {
  const { name, description, version } = packageProperties

  program
    .name(name)
    .description(description)
    .version(version, '-v, --version', 'Displays the version number.')
    .usage('[command] [options]')
    .helpOption('-h, --help', 'Displays this help message.')
    .addHelpCommand('help', 'Displays this help message.')
    .addCommand(configCommand)
    .addCommand(treeCommand)
    .addCommand(findCommand)
    .addCommand(infoCommand)
    .addCommand(uninstallCommand)
    .parse()
} catch (error) {
  console.error(chalk.red(getErrorMessage(error)))
  process.exit(1)
}
