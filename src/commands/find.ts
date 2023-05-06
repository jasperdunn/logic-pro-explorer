import { createCommand } from '@commander-js/extra-typings'

export const findCommand = createCommand('find').description(
  'Find projects that are using the selected components.'
)
