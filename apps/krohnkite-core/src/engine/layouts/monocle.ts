// SPDX-FileCopyrightText: 2018-2019 Eon S. Jeon <esjeon@hyunmu.am>
// SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@gikari.com>
//
// SPDX-License-Identifier: MIT

import { type WindowsLayout } from '.'

import { WindowState, type IEngineWindow } from '../window'

import {
  type Action,
  FocusBottomWindow,
  FocusLeftWindow,
  FocusNextWindow,
  FocusPreviousWindow,
  FocusRightWindow,
  FocusUpperWindow
} from '../../action'

import { type Rect } from '../../utils/rect'

import { type IWindowsManager } from '../../manager'
import { type IEngine } from '..'
import { type Config } from '@/config'

export default class MonocleLayout implements WindowsLayout {
  public static readonly id = 'MonocleLayout'
  public readonly classID = MonocleLayout.id
  public readonly name = 'Monocle Layout'
  public readonly icon = 'bismuth-monocle'

  private readonly config: Config

  constructor (config: Config) {
    this.config = config
  }

  public apply (
    controller: IWindowsManager,
    tileables: IEngineWindow[],
    area: Rect
  ): void {
    /* Tile all tileables */
    tileables.forEach((tile) => {
      tile.state = this.config.monocleMaximize
        ? WindowState.Maximized
        : WindowState.Tiled

      tile.geometry = area
    })
  }

  public clone (): this {
    /* fake clone */
    return this
  }

  public executeAction (engine: IEngine, action: Action): void {
    if (
      action instanceof FocusUpperWindow ||
      action instanceof FocusLeftWindow ||
      action instanceof FocusPreviousWindow
    ) {
      engine.focusOrder(-1, this.config.monocleMinimizeRest)
    } else if (
      action instanceof FocusBottomWindow ||
      action instanceof FocusRightWindow ||
      action instanceof FocusNextWindow
    ) {
      engine.focusOrder(1, this.config.monocleMinimizeRest)
    } else {
      action.executeWithoutLayoutOverride()
    }
  }

  public toString (): string {
    return 'MonocleLayout()'
  }
}
