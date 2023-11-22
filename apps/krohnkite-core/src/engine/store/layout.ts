// SPDX-FileCopyrightText: 2018-2019 Eon S. Jeon <esjeon@hyunmu.am>
// SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@gikari.com>
//
// SPDX-License-Identifier: MIT

import FloatingLayout from '../layouts/floating'

import { type WindowsLayout } from '../layouts'

import { type IBridgeSurface } from '../../bridge/surface'

import { wrapIndex } from '../../utils/func'

import MonocleLayout from '../layouts/monocle'
import TileLayout from '../layouts/tile'
// import CascadeLayout from './layout/cascade_layout'
import QuarterLayout from '../layouts/quarter'
import SpiralLayout from '../layouts/spiral'
import SpreadLayout from '../layouts/spread'
import StairLayout from '../layouts/stair'
import ThreeColumnLayout from '../layouts/three-column'
import { type Config } from '@/config'

export class LayoutStoreEntry {
  public get currentLayout (): WindowsLayout {
    return this.loadLayout(this.currentID)
  }

  private currentIndex: number | null
  private currentID: string
  private layouts: Record<string, WindowsLayout>
  private previousID: string

  private readonly config: Config

  constructor (config: Config) {
    this.config = config
    this.currentIndex = 0
    this.currentID = this.config.layoutOrder[0]
    this.layouts = {}
    this.previousID = this.currentID

    this.loadLayout(this.currentID)
  }

  public cycleLayout (step: -1 | 1): WindowsLayout {
    this.previousID = this.currentID
    this.currentIndex =
      this.currentIndex !== null
        ? wrapIndex(this.currentIndex + step, this.config.layoutOrder.length)
        : 0
    this.currentID = this.config.layoutOrder[this.currentIndex]
    return this.loadLayout(this.currentID)
  }

  public toggleLayout (targetID: string): WindowsLayout {
    const targetLayout = this.loadLayout(targetID)

    // Toggle if requested, set otherwise
    if (this.currentID === targetID) {
      this.currentID = this.previousID
      this.previousID = targetID
    } else {
      this.previousID = this.currentID
      this.currentID = targetID
    }

    this.updateCurrentIndex()
    return targetLayout
  }

  private updateCurrentIndex (): void {
    const idx = this.config.layoutOrder.indexOf(this.currentID)
    this.currentIndex = idx === -1 ? null : idx
  }

  private loadLayout (ID: string): WindowsLayout {
    let layout = this.layouts[ID]
    if (!layout) {
      layout = this.layouts[ID] = this.createLayoutFromId(ID)
    }
    return layout
  }

  private createLayoutFromId (id: string): WindowsLayout {
    if (id === MonocleLayout.id) {
      return new MonocleLayout(this.config)
    } else if (id === QuarterLayout.id) {
      return new QuarterLayout(this.config)
    } else if (id === SpiralLayout.id) {
      return new SpiralLayout(this.config)
    } else if (id === SpreadLayout.id) {
      return new SpreadLayout()
    } else if (id === StairLayout.id) {
      return new StairLayout()
    } else if (id === ThreeColumnLayout.id) {
      return new ThreeColumnLayout(this.config)
    } else if (id === TileLayout.id) {
      return new TileLayout(this.config)
    } else {
      return new FloatingLayout()
    }
  }
}

export default class LayoutStore {
  private store: Record<string, LayoutStoreEntry>

  constructor (private readonly config: Config) {
    this.store = {}
  }

  public getCurrentLayout (surface: IBridgeSurface): WindowsLayout {
    return surface.ignore
      ? FloatingLayout.instance
      : this.getEntry(String(surface.id)).currentLayout
  }

  public cycleLayout (surface: IBridgeSurface, step: 1 | -1): WindowsLayout | null {
    if (surface.ignore) {
      return null
    }
    return this.getEntry(String(surface.id)).cycleLayout(step)
  }

  public toggleLayout (
    surface: IBridgeSurface,
    layoutClassID: string
  ): WindowsLayout | null {
    if (surface.ignore) {
      return null
    }
    return this.getEntry(String(surface.id)).toggleLayout(layoutClassID)
  }

  private getEntry (key: string): LayoutStoreEntry {
    if (!this.store[key]) {
      this.store[key] = new LayoutStoreEntry(this.config)
    }
    return this.store[key]
  }
}
