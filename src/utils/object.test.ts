import { iterativeMerge } from './object.js'
import { iterativeMergeCases } from './object.test-data.js'

describe('iterativeMerge', () => {
  test.each(iterativeMergeCases)('$description', ({ target, source, expected }) => {
    const actual = iterativeMerge(target, source)

    expect(actual).toEqual(expected)
  })
})
