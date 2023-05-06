import * as mac from './mac'
import { errorMessage } from './error'
import { getFilePaths } from './file'

describe('getPathsByExtension', async () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('throws an error when the path is an empty string', () => {
    const directoryPath = ''

    expect(() => getFilePaths('.component', directoryPath)).toThrowError(
      errorMessage.directoryDoesNotExist(directoryPath)
    )
  })

  it('throws an error when the path is an alias', async () => {
    vi.spyOn(mac, 'isFinderAlias').mockImplementation(() => true)

    const directoryPath = 'fake/path/to/alias'

    expect(() => getFilePaths('.component', directoryPath)).toThrowError(
      `This path is an alias. Please use the resolved directory path.`
    )
  })
})
