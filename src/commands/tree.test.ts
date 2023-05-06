import chalk from 'chalk'
import { runCommand } from '../cli-test-helpers'
import { buildTree, renderTree, TreeSymbol } from './tree'

describe('tree command', () => {
  test('should display the help message', () => {
    expect(runCommand('tree -h')).toMatchSnapshot()
  })
})

describe('buildTree', () => {
  it('builds an empty tree', () => {
    const actual = buildTree([])

    expect(actual).toEqual({
      children: [],
      name: '',
      type: 'directory',
    })
  })

  it('builds a valid tree', () => {
    const actual = buildTree([
      'root/folder-a/test.txt',
      'root/folder-a/test-2.txt',
      'root/folder-b/test.txt',
    ])

    expect(actual).toEqual({
      children: [
        {
          children: [
            {
              name: 'test.txt',
              type: 'file',
            },
            {
              name: 'test-2.txt',
              type: 'file',
            },
          ],

          name: 'folder-a',
          type: 'directory',
        },
        {
          children: [
            {
              name: 'test.txt',
              type: 'file',
            },
          ],
          name: 'folder-b',
          type: 'directory',
        },
      ],
      name: 'root',
      type: 'directory',
    })
  })
})

describe('renderTree', () => {
  it('renders an empty string', () => {
    const actual = renderTree({
      children: [],
      name: '',
      type: 'directory',
    })

    expect(actual).toBe('')
  })

  it('renders a valid tree', () => {
    const actual = renderTree({
      children: [
        {
          children: [
            {
              name: 'test.txt',
              type: 'file',
            },
          ],
          name: 'root',
          type: 'directory',
        },
      ],
      name: '',
      type: 'directory',
    })

    expect(actual).toBe(`\n${chalk.bold.blue('root')}\n${chalk.gray(TreeSymbol.Corner)}test.txt`)
  })
})
