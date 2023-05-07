import { runCommand } from '../cli-test-helpers.js'

describe('info command', () => {
  test('should display the help message', () => {
    expect(runCommand('info -h')).toMatchSnapshot()
  })
})
