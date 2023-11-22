// SPDX-FileCopyrightText: 2018-2019 Eon S. Jeon <esjeon@hyunmu.am>
// SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@gikari.com>
//
// SPDX-License-Identifier: MIT

import { type IEngineWindow } from '../window'

import { type IBridgeSurface } from '../../bridge/surface'

/**
 * Window storage facility with convenient window filters built-in.
 */
export interface IWindowStore {
  /**
   * Returns all visible windows on the given surface.
   */
  visibleWindowsOn: (surf: IBridgeSurface) => IEngineWindow[]

  /**
   * Return all visible "Tile" windows on the given surface.
   */
  visibleTiledWindowsOn: (surf: IBridgeSurface) => IEngineWindow[]

  /**
   * Return all visible "tileable" windows on the given surface
   * @see Window#tileable
   */
  visibleTileableWindowsOn: (surf: IBridgeSurface) => IEngineWindow[]

  /**
   * Return all "tileable" windows on the given surface, including hidden
   */
  tileableWindowsOn: (surf: IBridgeSurface) => IEngineWindow[]

  /**
   * Return all windows on this surface, including minimized windows
   */
  allWindowsOn: (surf: IBridgeSurface) => IEngineWindow[]

  /**
   * Inserts the window at the beginning
   */
  unshift: (window: IEngineWindow) => void

  /**
   * Inserts the window at the end
   */
  push: (window: IEngineWindow) => void

  /**
   * Remove window from the store
   */
  remove: (window: IEngineWindow) => void

  /**
   * Move srcWin to the destWin position (before/after)
   * @param after if true, srcWin is moved after the destWindow. If false - it is moved before.
   */
  move: (srcWin: IEngineWindow, destWin: IEngineWindow, after?: boolean) => void

  /**
   * Swap windows positions
   */
  swap: (alpha: IEngineWindow, beta: IEngineWindow) => void

  /**
   * Put the window into the master area.
   * @param window window to put into the master area
   */
  putWindowToMaster: (window: IEngineWindow) => void
}

export class WindowStore implements IWindowStore {
  /**
   * @param list window list to initialize from
   */
  constructor (public list: IEngineWindow[] = []) {}

  public move (
    srcWin: IEngineWindow,
    destWin: IEngineWindow,
    after?: boolean
  ): void {
    const srcIdx = this.list.indexOf(srcWin)
    const destIdx = this.list.indexOf(destWin)
    if (srcIdx === -1 || destIdx === -1) {
      return
    }

    // Delete the source window
    this.list.splice(srcIdx, 1)
    // Place the source window in before destination window or after it
    this.list.splice(after ? destIdx + 1 : destIdx, 0, srcWin)
  }

  public putWindowToMaster (window: IEngineWindow): void {
    const idx = this.list.indexOf(window)
    if (idx === -1) {
      return
    }
    this.list.splice(idx, 1)
    this.list.splice(0, 0, window)
  }

  public swap (alpha: IEngineWindow, beta: IEngineWindow): void {
    const alphaIndex = this.list.indexOf(alpha)
    const betaIndex = this.list.indexOf(beta)
    if (alphaIndex < 0 || betaIndex < 0) {
      return
    }

    this.list[alphaIndex] = beta
    this.list[betaIndex] = alpha
  }

  public get length (): number {
    return this.list.length
  }

  public at (idx: number): IEngineWindow {
    return this.list[idx]
  }

  public indexOf (window: IEngineWindow): number {
    return this.list.indexOf(window)
  }

  public push (window: IEngineWindow): void {
    this.list.push(window)
  }

  public remove (window: IEngineWindow): void {
    const idx = this.list.indexOf(window)
    if (idx >= 0) {
      this.list.splice(idx, 1)
    }
  }

  public unshift (window: IEngineWindow): void {
    this.list.unshift(window)
  }

  public visibleWindowsOn (surf: IBridgeSurface): IEngineWindow[] {
    return this.list.filter((win) => win.visibleOn(surf))
  }

  public visibleTiledWindowsOn (surf: IBridgeSurface): IEngineWindow[] {
    return this.list.filter((win) => win.tiled && win.visibleOn(surf))
  }

  public visibleTileableWindowsOn (surf: IBridgeSurface): IEngineWindow[] {
    return this.list.filter((win) => win.tileable && win.visibleOn(surf))
  }

  public tileableWindowsOn (surf: IBridgeSurface): IEngineWindow[] {
    return this.list.filter(
      (win) => win.tileable && win.surface.id === surf.id
    )
  }

  public allWindowsOn (surf: IBridgeSurface): IEngineWindow[] {
    return this.list.filter((win) => win.surface.id === surf.id)
  }
}
