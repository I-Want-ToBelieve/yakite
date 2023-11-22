/**
 * @see https://transform.tools/json-to-typescript89
 * @see https://github.com/koekeishiya/yabai/blob/master/doc/yabai.asciidoc#command-3
 */

export interface YabaiFrame {
  x: number
  y: number
  w: number
  h: number
}

export interface YabaiDisplay {
  id: number
  uuid: string
  index: number
  frame: YabaiFrame
  spaces: number[]
}

export interface YabaiSpace {
  id: number
  uuid: string
  index: number
  label: string
  type: string
  display: number
  windows: number[]
  'first-window': number
  'last-window': number
  'has-focus': boolean
  'is-visible': boolean
  'is-native-fullscreen': boolean
}

export interface YabaiWindow {
  id: number
  pid: number
  app: string
  title: string
  frame: YabaiFrame
  role: string
  subrole: string
  display: number
  space: number
  level: number
  layer: string
  opacity: number
  'split-type': string
  'split-child': string
  'stack-index': number
  'can-move': boolean
  'can-resize': boolean
  'has-focus': boolean
  'has-shadow': boolean
  'has-parent-zoom': boolean
  'has-fullscreen-zoom': boolean
  'is-native-fullscreen': boolean
  'is-visible': boolean
  'is-minimized': boolean
  'is-hidden': boolean
  'is-floating': boolean
  'is-sticky': boolean
  'is-grabbed': boolean
}

export type YabaiDisplays = YabaiDisplay[]
export type YabaiSpaces = YabaiSpace[]
export type YabaiWindows = YabaiWindow[]
