import { expect, test, describe } from 'bun:test'
import Yabai from '.'
import { spacesSchema, displaysSchema, windowsSchema } from './yabai.zod'

const yabai = await Yabai.create()

describe('query', () => {
  test('displays', () => {
    expect(displaysSchema.safeParse(yabai.displays).success).toBe(true)
  })

  test('spaces', () => {
    expect(spacesSchema.safeParse(yabai.spaces).success).toBe(true)
  })

  test('windows', () => {
    expect(windowsSchema.safeParse(yabai.windows).success).toBe(true)
  })
})
