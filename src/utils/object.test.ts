import { iterativeMerge } from './object'
import { iterativeMergeCases } from './object.test-data'

describe('iterativeMerge', () => {
  test.each(iterativeMergeCases)('$description', ({ target, source, expected }) => {
    const actual = iterativeMerge(target, source)

    expect(actual).toEqual(expected)
  })
})
