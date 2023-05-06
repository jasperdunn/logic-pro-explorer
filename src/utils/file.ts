import fs from 'fs'
import path from 'path'
import { isFinderAlias } from './mac'
import { ErrorCode, errorMessage, getErrorMessage, isErrorCode } from './error'

export function getFilePaths(
  extension: FileExtension,
  directoryPath: string,
  limit?: number
): string[] {
  const filePaths: string[] = []

  try {
    if (isFinderAlias(directoryPath)) {
      // should this be an exception?
      throw new Error(`This path is an alias. Please use the resolved directory path.`)
    } else if (!fs.statSync(directoryPath).isDirectory()) {
      // should this be an exception?
      throw new Error('The path is not a directory.')
    }

    const stack = [directoryPath]

    while (stack.length > 0 && (!limit || filePaths.length < limit)) {
      const currentPath = stack.pop()

      if (!currentPath) {
        continue
      }

      const pathParts = fs.readdirSync(currentPath)

      for (const part of pathParts.reverse()) {
        const fullPath = path.join(currentPath, part)

        if (limit && filePaths.length >= limit) {
          break
        }

        if (part.endsWith(extension)) {
          filePaths.push(fullPath)
        }

        if (fs.statSync(fullPath).isDirectory()) {
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

export const fileTypes = ['project', 'component'] as const
export type FileType = (typeof fileTypes)[number]
export type FileExtension = '.logicx' | '.component'
