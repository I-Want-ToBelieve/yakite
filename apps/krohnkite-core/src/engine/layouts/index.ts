// SPDX-FileCopyrightText: 2018-2019 Eon S. Jeon <esjeon@hyunmu.am>
// SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@gikari.com>
//
// SPDX-License-Identifier: MIT

import { type IEngineWindow } from '../window'
import { type IEngine } from '..'

import { type IWindowsManager } from '../../manager'
import { type Action } from '../../action'

import { type Rect, type RectDelta } from '../../utils/rect'

export abstract class WindowsLayout {
  /* read-only */

  static readonly id: string

  /**
   * Human-readable name of the layout.
   */
  abstract readonly name: string

  /**
   * The icon name of the layout.
   */
  abstract readonly icon: string

  /**
   * A string that can be used to show layout specific properties in the pop-up,
   * e.g. the number of master windows.
   */
  readonly hint?: string

  /**
   * The maximum number of windows, that the layout can contain.
   */
  readonly capacity?: number

  adjust? (
    area: Rect,
    tiles: IEngineWindow[],
    basis: IEngineWindow,
    delta: RectDelta
  ): void

  abstract apply (
    controller: IWindowsManager,
    tileables: IEngineWindow[],
    area: Rect
  ): void

  executeAction? (engine: IEngine, action: Action): void

  abstract toString (): string
}
