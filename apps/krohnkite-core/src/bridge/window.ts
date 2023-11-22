// SPDX-FileCopyrightText: 2018-2019 Eon S. Jeon <esjeon@hyunmu.am>
// SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@gikari.com>
//
// SPDX-License-Identifier: MIT

import { type Rect } from '@/utils/rect'
import { type IBridgeSurface } from './surface'

/**
 * KWin window representation.
 */
export interface IBridgeWindow {
  /**
   * Is the window is currently set to be fullscreen
   */
  readonly fullScreen: boolean

  /**
   * Window geometry: its coordinates, width and height
   */
  readonly geometry: Readonly<Rect>

  /**
   * Window unique id
   */
  readonly id: string | number

  /**
   * Whether it window is in maximized state
   */
  readonly maximized: boolean

  /**
   * Whether the window should be completely ignored by the script
   */
  readonly shouldIgnore: boolean

  /**
   * Whether the window should float according to the some predefined rules
   */
  readonly shouldFloat: boolean

  /**
   * The screen number the window is currently at
   */
  readonly screen: number

  /**
   * Whether the window is focused right now
   */
  readonly active: boolean

  /**
   * Whether the window is a dialog window
   */
  readonly isDialog: boolean

  /**
   * Window's current surface
   */
  surface: IBridgeSurface

  /**
   * Whether the window is minimized
   */
  minimized: boolean

  /**
   * Whether the window is shaded
   */
  shaded: boolean

  /**
   * Commit the window properties to the KWin, i.e. "show the results of our manipulations to the user"
   * @param geometry
   * @param noBorder
   * @param keepAbove
   */
  commit: (geometry?: Rect, noBorder?: boolean, keepAbove?: boolean) => Promise<void>

  /**
   * Whether the window is visible on the specified surface
   * @param surface the surface to check against
   */
  visibleOn: (surface: IBridgeSurface) => boolean
}
