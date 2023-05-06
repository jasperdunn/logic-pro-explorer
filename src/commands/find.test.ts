import { runCommand } from '../cli-test-helpers'

describe('find command', () => {
  test('should display the help message', () => {
    expect(runCommand('find -h')).toMatchSnapshot()
  })
})
