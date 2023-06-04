/**
 * A mapped type that makes all properties of a given type `T` optional recursively.
 *
 * Limitations:
 * - May cause performance issues with very deeply nested types.
 * - Circular references in type `T` may cause issues in type checking.
 * - Array properties will not be made optional.
 * - May not work as expected with union and intersection types.
 * - Index signatures in type `T` will not be affected.
 * - Readonly properties will not be made optional.
 */
export type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>
}

/**
 * A mapped type that creates a test case for a function.
 *
 * @example
 * ```ts
 * type MyTestCase = FunctionTestCase<['a', 'b'], (a: number, b: string) => number>
 * // { description: string, a: number, b: string, expected: number }
 * ```
 */
export type FunctionTestCase<Func extends FunctionType, Args extends string[]> = {
  description: string
  expected: ReturnType<Func>
} & RecordFromArgs<Args, Func>

/**
 * A mapped type that creates a record from a tuple of argument names and a function type.
 * The record will have the same keys as the argument names, and the values will be the
 * corresponding argument types from the function type.
 *
 * @examples
 * ```ts
 * type MyRecord = RecordFromArgs<['a', 'b'], (a: number, b: string) => number>
 * // { a: number, b: string }
 *
 * type MyRecord = RecordFromArgs<['args'], (args: { a: number, b: string }) => number>
 * // { args: { a: number, b: string } }
 *
 * type MyRecord = RecordFromArgs<['a', 'b'], (a: number, b?: string) => number>
 * // { a: number, b?: string }
 * ```
 */
type RecordFromArgs<Args extends string[], Func extends FunctionType> = {
  [K in keyof Args]: K extends keyof Parameters<Func>
    ? IsKeyOptional<Parameters<Func>, K> extends true
      ? { [P in Args[K]]?: Parameters<Func>[K] }
      : { [P in Args[K]]: Parameters<Func>[K] }
    : never
}[number] extends infer R
  ? UnionToIntersection<R>
  : never

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FunctionType = (...args: any[]) => any

type UnionToIntersection<U> = (U extends unknown ? (k: U) => void : never) extends (
  k: infer I
) => void
  ? I
  : never

type IsKeyOptional<T, K extends keyof T> = object extends { [P in K]: T[P] } ? true : false
