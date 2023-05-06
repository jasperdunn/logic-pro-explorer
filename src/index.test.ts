import { runCommand } from './cli-test-helpers'

describe('help command', () => {
  it('should display the help message', () => {
    expect(runCommand('help')).toMatchSnapshot()
  })
})
