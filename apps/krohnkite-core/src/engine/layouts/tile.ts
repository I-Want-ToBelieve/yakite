// SPDX-FileCopyrightText: 2018-2019 Eon S. Jeon <esjeon@hyunmu.am>
// SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@gikari.com>
//
// SPDX-License-Identifier: MIT

import { type WindowsLayout } from '.'
import {
  RotateLayoutPart,
  HalfSplitLayoutPart,
  StackLayoutPart
} from './part'

import { WindowState, type IEngineWindow } from '../window'

import {
  type Action,
  DecreaseLayoutMasterAreaSize,
  DecreaseMasterAreaWindowCount,
  IncreaseLayoutMasterAreaSize,
  IncreaseMasterAreaWindowCount,
  Rotate,
  RotateReverse,
  RotatePart
} from '../../action'

import { clip, slide } from '../../utils/func'
import { type Rect, type RectDelta } from '../../utils/rect'

import { type IWindowsManager } from '../../manager'
import { type IEngine } from '..'
import { type Config } from '@/config'

export default class TileLayout implements WindowsLayout {
  public static readonly MIN_MASTER_RATIO = 0.2
  public static readonly MAX_MASTER_RATIO = 0.8
  public static readonly id = 'TileLayout'
  public readonly classID = TileLayout.id
  public readonly name = 'Tile Layout'
  public readonly icon = 'bismuth-tile'

  public get hint (): string {
    return String(this.numMaster)
  }

  private readonly parts: RotateLayoutPart<
  HalfSplitLayoutPart<RotateLayoutPart<StackLayoutPart>, StackLayoutPart>
  >

  private get numMaster (): number {
    return this.parts.inner.primarySize
  }

  private set numMaster (value: number) {
    this.parts.inner.primarySize = value
  }

  private get masterRatio (): number {
    return this.parts.inner.ratio
  }

  private set masterRatio (value: number) {
    this.parts.inner.ratio = value
  }

  private readonly config: Config

  constructor (config: Config) {
    this.config = config

    this.parts = new RotateLayoutPart(
      new HalfSplitLayoutPart(
        new RotateLayoutPart(new StackLayoutPart(this.config)),
        new StackLayoutPart(this.config)
      )
    )

    const masterPart = this.parts.inner
    masterPart.gap =
      masterPart.primary.inner.gap =
      masterPart.secondary.gap =
        this.config.gaps.tileLayout
  }

  public adjust (
    area: Rect,
    tiles: IEngineWindow[],
    basis: IEngineWindow,
    delta: RectDelta
  ): void {
    this.parts.adjust(area, tiles, basis, delta)
  }

  public apply (
    _controller: IWindowsManager,
    tileables: IEngineWindow[],
    area: Rect
  ): void {
    tileables.forEach((tileable) => (tileable.state = WindowState.Tiled))

    this.parts.apply(area, tileables).forEach((geometry, i) => {
      tileables[i].geometry = geometry
    })
  }

  public clone (): WindowsLayout {
    const other = new TileLayout(this.config)
    other.masterRatio = this.masterRatio
    other.numMaster = this.numMaster
    return other
  }

  public executeAction (engine: IEngine, action: Action): void {
    if (action instanceof DecreaseLayoutMasterAreaSize) {
      this.masterRatio = clip(
        slide(this.masterRatio, -0.05),
        TileLayout.MIN_MASTER_RATIO,
        TileLayout.MAX_MASTER_RATIO
      )
    } else if (action instanceof IncreaseLayoutMasterAreaSize) {
      this.masterRatio = clip(
        slide(this.masterRatio, +0.05),
        TileLayout.MIN_MASTER_RATIO,
        TileLayout.MAX_MASTER_RATIO
      )
    } else if (action instanceof IncreaseMasterAreaWindowCount) {
      // TODO: define arbitrary constant
      if (this.numMaster < 10) {
        this.numMaster += 1
      }
      engine.showLayoutNotification()
    } else if (action instanceof DecreaseMasterAreaWindowCount) {
      if (this.numMaster > 0) {
        this.numMaster -= 1
      }
      engine.showLayoutNotification()
    } else if (action instanceof Rotate) {
      this.parts.rotate(90)
    } else if (action instanceof RotateReverse) {
      this.parts.rotate(-90)
    } else if (action instanceof RotatePart) {
      this.parts.inner.primary.rotate(90)
    } else {
      action.executeWithoutLayoutOverride()
    }
  }

  public toString (): string {
    return `TileLayout(nmaster=${this.numMaster}, ratio=${this.masterRatio})`
  }
}
