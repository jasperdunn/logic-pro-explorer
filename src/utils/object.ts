import { DeepPartial } from '../types'

/**
 * Merge deeply nested properties of two objects.
 *
 * _Note: Does not merge arrays. If a property is an array, the value from the source object will be used._
 */
export function iterativeMerge<T extends object, S extends DeepPartial<T>>(
  target: T,
  source: S
): T {
  const merged: T = JSON.parse(JSON.stringify(target))
  const stack: StackItem[] = [{ target: merged, source: source }]

  while (stack.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- stack.length > 0
    const { target: currentTarget, source: currentSource } = stack.pop()!

    for (const [key, value] of Object.entries(currentSource)) {
      if (currentSource[key] === undefined) {
        continue
      }

      if (typeof value === 'object' && value !== null) {
        stack.push({ target: currentTarget[key], source: value })
      } else {
        currentTarget[key] = value
      }
    }
  }

  return merged
}

type StackItem = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  target: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  source: any
}
