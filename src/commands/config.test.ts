import { runCommand } from '../cli-test-helpers.js'

describe('config command', () => {
  test('should display the help message', () => {
    expect(runCommand('config -h')).toMatchSnapshot()
  })
})
