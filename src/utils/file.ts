import fs from 'fs/promises'
import { resolve, join } from 'path'
import type { PathLike } from 'fs'
import { isFinderAlias } from './mac.js'
import { ErrorCode, errorMessage, getErrorMessage, isErrorCode } from './error.js'

export const packageProperties = await getPackageProperties()

export async function getFilePaths(
  extension: FileExtension,
  directoryPath: string,
  limit?: number
): Promise<string[]> {
  const filePaths: string[] = []

  try {
    if (await isFinderAlias(directoryPath)) {
      // should this be an exception?
      throw new Error(`This path is an alias. Please use the resolved directory path.`)
    }

    if (!(await fs.stat(directoryPath)).isDirectory()) {
      // should this be an exception?
      throw new Error('The path is not a directory.')
    }

    const stack = [directoryPath]

    while (stack.length > 0 && (!limit || filePaths.length < limit)) {
      const currentPath = stack.pop()

      if (!currentPath) {
        continue
      }

      const pathParts = await fs.readdir(currentPath)

      for (const part of pathParts.reverse()) {
        const fullPath = join(currentPath, part)

        if (limit && filePaths.length >= limit) {
          break
        }

        if (part.endsWith(extension)) {
          filePaths.push(fullPath)
        }

        if ((await fs.stat(fullPath)).isDirectory()) {
          stack.push(fullPath)
        }
      }
    }
  } catch (error) {
    if (isErrorCode(error, ErrorCode.ENOENT)) {
      throw new Error(errorMessage.directoryDoesNotExist(directoryPath))
    }

    throw new Error(
      `An error occurred while reading the directory: "${directoryPath}"\n${getErrorMessage(error)}`
    )
  }

  return filePaths
}

export function getFileExtensionFromType(type: FileType): FileExtension {
  switch (type) {
    case 'project':
      return '.logicx'

    case 'component':
      return '.component'
  }
}

type PackageProperties = {
  name: string
  version: string
  description: string
}
/**
 * Required until node officially supports importing JSON files.
 */
async function getPackageProperties(): Promise<PackageProperties> {
  try {
    return JSON.parse(
      await fs.readFile(resolve('package.json'), { encoding: 'utf-8' })
    ) as PackageProperties
  } catch (error) {
    throw new Error(
      `An error occurred while reading the package.json file.\n${getErrorMessage(error)}`
    )
  }
}

export async function doesPathExist(url: PathLike): Promise<boolean> {
  try {
    await fs.access(url)
    return true
  } catch (error) {
    if (isErrorCode(error, ErrorCode.ENOENT)) {
      return false
    }

    console.error(error)

    throw error
  }
}

export const fileTypes = ['project', 'component'] as const
export type FileType = (typeof fileTypes)[number]
export type FileExtension = '.logicx' | '.component'
