import { lstat } from 'fs/promises'
import { execFileSync } from 'child_process'
import { ErrorCode, errorMessage, isErrorCode } from './error.js'

export async function isFinderAlias(directoryPath: string): Promise<boolean> {
  try {
    if (!(await lstat(directoryPath)).isFile()) {
      return false
    }

    const contentType = execFileSync(
      'mdls',
      ['-raw', '-name', 'kMDItemContentType', directoryPath],
      {
        encoding: 'utf8',
      }
    )

    return contentType.trim() === 'com.apple.alias-file'
  } catch (error) {
    if (isErrorCode(error, ErrorCode.ENOENT)) {
      throw new Error(errorMessage.directoryDoesNotExist(directoryPath))
    }

    throw error
  }
}
