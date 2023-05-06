type ErrorWithMessage = {
  message: string
}

function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as Record<string, unknown>)['message'] === 'string'
  )
}

function toErrorWithMessage(error: unknown): ErrorWithMessage {
  if (isErrorWithMessage(error)) {
    return error
  }

  try {
    return new Error(JSON.stringify(error))
  } catch {
    // Fallback in case there's an error stringifying
    // like with circular references.
    return new Error(String(error))
  }
}

/**
 * @returns The error.message from an unknown error caught in a catch block.
 *
 * Falls back to stringify and toString if the object doesn't have an error.
 */
export function getErrorMessage(error: unknown): string {
  return toErrorWithMessage(error).message
}

export enum ErrorCode {
  /**
   * no such file or directory
   */
  ENOENT = 'ENOENT',
}

export function isErrorCode(error: unknown, code: ErrorCode): boolean {
  return getErrorMessage(error).startsWith(code)
}

export const errorMessage = {
  directoryDoesNotExist: (directoryPath: string) =>
    `This directory does not exist: "${directoryPath}"`,
}
