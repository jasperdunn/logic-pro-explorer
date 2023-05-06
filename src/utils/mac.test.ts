import { errorMessage } from './error'
import { isFinderAlias } from './mac'

describe('isFinderAlias', () => {
  test("throws an error when the path doesn't exist", () => {
    const directoryPath = 'fake/path/to/alias'

    expect(() => isFinderAlias(directoryPath)).toThrowError(
      errorMessage.directoryDoesNotExist(directoryPath)
    )
  })
})
