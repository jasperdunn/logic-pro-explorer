import { runCommand } from './cli-test-helpers.js'

beforeAll(() => {
  runCommand('config -p /Volumes/data-ssd/audio/Logic/')
})

describe('help command', () => {
  it('should display the help message', () => {
    expect(runCommand('help')).toMatchSnapshot()
  })
})
