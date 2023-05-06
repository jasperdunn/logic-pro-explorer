import { program } from '@commander-js/extra-typings'
import chalk from 'chalk'
import { name, description, version } from '../package.json'
import { treeCommand } from './commands/tree'
import { getErrorMessage } from './utils/error'
import { configCommand } from './commands/config'
import { findCommand } from './commands/find'
import { infoCommand } from './commands/info'

try {
  program
    .name(name)
    .description(description)
    .version(version, '-v, --version', 'Displays the version number.')
    .helpOption('-h, --help', 'Displays this help message.')
    .addHelpCommand('help [command]', 'Displays help for a specific command.')
    .addCommand(configCommand)
    .addCommand(treeCommand)
    .addCommand(findCommand)
    .addCommand(infoCommand)
    .parse()
} catch (error) {
  console.error(chalk.red(getErrorMessage(error)))
  process.exit(1)
}
