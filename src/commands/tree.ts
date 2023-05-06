import path from 'path'
import chalk from 'chalk'
import { createCommand, Option } from '@commander-js/extra-typings'
import ora from 'ora'
import { FileType, fileTypes, getFileExtensionFromType, getFilePaths } from '../utils/file'
import { plural } from '../utils/string'
import { getErrorMessage } from '../utils/error'
import { componentDirectoryFlags, config, projectDirectoryFlags } from './config'

export const treeCommand = createCommand('tree')
  .description('Displays a tree of Logic projects or components.')
  .addOption(
    new Option('-t, --type <type>', 'The type of files to scan for')
      .choices(fileTypes)
      .default('project')
      .argParser((value) => {
        if (!fileTypes.includes(value as FileType)) {
          throw new Error(`type must be one of ${fileTypes.map((type) => `"${type}"`).join(', ')}`)
        }

        return value as FileType
      })
  )
  .addOption(
    new Option(
      projectDirectoryFlags,
      'The directory to scan for Logic projects, the default can be set in config.'
    ).default(config.directory.project, chalk.blue(config.directory.project))
  )
  .addOption(
    new Option(
      componentDirectoryFlags,
      'The directory to scan for components, the default can be set in config.'
    ).default(config.directory.component, chalk.blue(config.directory.component))
  )
  .addOption(
    new Option('-l, --limit <number>', 'Limits the number of files to scan.').argParser((value) => {
      const parsed = parseInt(value)

      if (isNaN(parsed)) {
        throw new Error(`limit must be a number, received "${value}"`)
      }

      return parsed
    })
  )
  .action(({ type, componentDirectory, projectDirectory, limit }) => {
    switch (type as FileType) {
      case 'project':
        scan('project', projectDirectory, limit)
        return

      case 'component':
        scan('component', componentDirectory, limit)
        return
    }
  })

function scan(type: FileType, directory: string, limit?: number): void {
  const spinner = ora(`Loading ${type}s...`).start()

  try {
    const extension = getFileExtensionFromType(type)
    const filePaths = getFilePaths(extension, directory, limit)

    if (filePaths.length === 0) {
      spinner.info(chalk.blue(`No "${type}" files were found in "${directory}"`))
      return
    }

    spinner.succeed(chalk.green(`Found ${filePaths.length} ${plural(filePaths.length, type)}.`))

    console.log(renderTree(buildTree(filePaths)))
  } catch (error) {
    spinner.fail(chalk.red(getErrorMessage(error)))
  }
}

type Node = FileNode | DirectoryNode

type FileNode = {
  name: string
  type: 'file'
}

type DirectoryNode = {
  name: string
  type: 'directory'
  children: Node[]
}

export function buildTree(paths: string[]): Node {
  const root: Node = {
    name: '',
    type: 'directory',
    children: [],
  }

  for (const filePath of paths) {
    const pathParts = filePath.split(path.sep)
    let currentNode: Node = root

    for (const part of pathParts) {
      if (currentNode.type === 'directory') {
        const childNode: Node | undefined = currentNode.children.find((node) => node.name === part)

        if (childNode) {
          currentNode = childNode
          continue
        }
      }

      // some files have no extension, so we need to check if the path part is a directory
      const nodeIsDirectory = pathParts.indexOf(part) !== pathParts.length - 1

      let newNode: Node

      if (nodeIsDirectory) {
        newNode = {
          name: part,
          type: 'directory',
          children: [],
        }
      } else {
        newNode = {
          name: part,
          type: 'file',
        }
      }

      if (currentNode.type === 'directory') {
        currentNode.children.push(newNode)
      }

      currentNode = newNode
    }
  }

  return root.children[0] || root
}

export enum TreeSymbol {
  Edge = '├──',
  Line = '│  ',
  Corner = '└──',
  Blank = '   ',
}

type TreeBranch = {
  node: Node
  indent: string
  depth: number
}

export function renderTree(node: Node): string {
  /**
   * Using a buffer is more efficient than printing to stdout immediately, or using string concatenation.
   */
  const buffer: string[] = []
  const stack: Array<TreeBranch> = [{ node, indent: '', depth: 0 }]

  while (stack.length > 0) {
    const currentBranch = stack.pop()

    if (!currentBranch) {
      continue
    }

    if (currentBranch.node.type === 'file') {
      buffer.push(`${chalk.grey(currentBranch.indent)}${currentBranch.node.name}`)
      continue
    }

    // directory name
    buffer.push(`${chalk.grey(currentBranch.indent)}${chalk.bold.blue(currentBranch.node.name)}`)

    const children = currentBranch.node.children
    const childDepth = currentBranch.depth + 1

    for (let i = 0; i < children.length; i++) {
      const child = children[i]

      const isLastChild = i === 0

      let childIndent = ''
      if (currentBranch.depth > 0) {
        if (currentBranch.indent.endsWith(TreeSymbol.Edge)) {
          childIndent = currentBranch.indent.replace(TreeSymbol.Edge, TreeSymbol.Line)
        } else if (currentBranch.indent.endsWith(TreeSymbol.Corner)) {
          childIndent = currentBranch.indent.replace(TreeSymbol.Corner, TreeSymbol.Blank)
        } else {
          childIndent = TreeSymbol.Blank.repeat(childDepth - 2)
        }

        childIndent += isLastChild ? TreeSymbol.Corner : TreeSymbol.Edge
      }

      stack.push({
        node: child,
        indent: childIndent,
        depth: childDepth,
      })
    }
  }

  return buffer.join('\n')
}
