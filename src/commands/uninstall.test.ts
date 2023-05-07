import { runSpawnedCommand } from '../cli-test-helpers.js'
import { doesPathExist } from '../utils/file.js'
import { configPath, config, updateConfig } from './config.js'

describe('uninstall command', () => {
  const originalConfig = structuredClone(config)
  afterAll(async () => {
    await updateConfig(originalConfig)
  })

  // TODO: figure out how to test this, the config file is being deleted whilst other tests are running
  test.skip('should prompt the user for confirmation', async () => {
    const actual = runSpawnedCommand('uninstall', 'y')

    const configFileExists = await doesPathExist(configPath)

    // why is the snapshot file generating multiple times?
    expect(actual).toMatchSnapshot()
    expect(configFileExists).toBe(false)
  })

  test('should close the app if the user declines', () => {
    const actual = runSpawnedCommand('uninstall', 'n')

    expect(actual).toMatchSnapshot()
  })
})
