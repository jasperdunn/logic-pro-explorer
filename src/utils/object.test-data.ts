import type { iterativeMerge } from '../utils/object.js'
import type { FunctionTestCase, DeepPartial } from '../types.js'

type Target = {
  a: number
  b: string
  c: number | { d: number; e: number } | number[] | undefined
}
type Source = DeepPartial<Target>

export const iterativeMergeCases: FunctionTestCase<
  ['target', 'source'],
  typeof iterativeMerge<Target, Source>
>[] = [
  {
    description: 'should merge two objects',
    target: { a: 1, b: '1', c: 1 },
    source: { b: '2', c: 3 },
    expected: { a: 1, b: '2', c: 3 },
  },
  {
    description: 'should merge nested objects',
    target: { a: 1, b: '1', c: { d: 1, e: 1 } },
    source: { b: '2', c: { e: 2 } },
    expected: { a: 1, b: '2', c: { d: 1, e: 2 } },
  },
  {
    description: 'does not merge arrays',
    target: { a: 1, b: '1', c: [1, 2, 3] },
    source: { b: '2', c: [4, 5, 6] },
    expected: { a: 1, b: '2', c: [4, 5, 6] },
  },
  {
    description: 'should return the target object if the source is empty',
    target: { a: 1, b: '1', c: 1 },
    source: {},
    expected: { a: 1, b: '1', c: 1 },
  },
  {
    description: 'should return the target value if the source is undefined',
    target: { a: 1, b: '1', c: 1 },
    source: { c: undefined },
    expected: { a: 1, b: '1', c: 1 },
  },
]
