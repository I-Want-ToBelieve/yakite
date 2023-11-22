// SPDX-FileCopyrightText: 2018-2019 Eon S. Jeon <esjeon@hyunmu.am>
// SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@gikari.com>
//
// SPDX-License-Identifier: MIT

import { type IEngine, Engine } from '@/engine'
import { type IEngineWindow, WindowState } from '@/engine/window'

import { type IBridgeSurface } from '@/bridge/surface'

import * as Action from '@/action'

import { type Logger } from '@/types/logger.types'
import { type Config } from '@/config'
import { type IBridge } from '@/bridge'

export interface WindowEventCallbacks {
  onSurfaceUpdate: () => void
  onCurrentSurfaceChanged: () => void
  onWindowAdded: (window: IEngineWindow) => void
  onWindowRemoved: (window: IEngineWindow) => void
  onWindowMoveStart: (_window: IEngineWindow) => void
  onWindowMove: (_window: IEngineWindow) => void
  onWindowMoveOver: (window: IEngineWindow) => void
  onWindowResizeStart: () => void
  onWindowResize: (window: IEngineWindow) => void
  onWindowResizeOver: (window: IEngineWindow) => void
  onWindowMaximizeChanged: (_window: IEngineWindow, _maximized: boolean) => void
  onWindowGeometryChanged: (window: IEngineWindow) => void
  onWindowScreenChanged: (_window: IEngineWindow) => void
  onWindowChanged: (window: IEngineWindow | null, comment?: 'unminimized' | 'minimized' | string) => void
  onWindowFocused: (window: IEngineWindow) => void
  onWindowShadeChanged: (window: IEngineWindow) => void
}

export type EventNames = keyof WindowEventCallbacks

/**
 * Entry point of the script (apart from QML). Handles the user input (shortcuts)
 * and the events from the Driver (in other words KWin, the window manager/compositor).
 * Provides interface for the Engine to ask Driver about particular properties of the user
 * interface.
 *
 * Basically an adapter type controller from MVA pattern.
 */
export interface IWindowsManager {
  /**
   * A bunch of surfaces, that represent the user's screens.
   */
  readonly screens: IBridgeSurface[]
  /**
   * Current active window. In other words the window, that has focus.
   */
  currentWindow: IEngineWindow | null

  /**
   * Current screen. In other words the screen, that has focus.
   */
  currentSurface: IBridgeSurface

  /**
   * Show a popup notification in the center of the screen.
   * @param text the main text of the notification.
   * @param icon an optional name of the icon to display in the pop-up.
   * @param hint an optional string displayed beside the main text.
   */
  showNotification: (text: string, icon?: string, hint?: string) => void
  /**
   * Ask engine to manage the window
   * @param win the window which needs to be managed.
   */
  manageWindow: (win: IEngineWindow) => void

  /**
   * The function is called when the script is destroyed.
   * In particular, it's called by QML Component.onDestroyed
   */
  drop: () => void
}

export class WindowsManager implements IWindowsManager {
  public readonly engine: IEngine

  public constructor (
    private readonly bridge: IBridge,
    public readonly config: Config,
    public readonly logger: Logger
  ) {
    this.engine = new Engine(this, config, logger)
    this.bridge.wm = this
  }

  /**
   * Entry point: start tiling window management
   */
  public start (): void {
    this.addActionToBridge()
    this.addEventListenerToBridge()

    this.bridge.manageWindows()
    this.engine.arrange()
  }

  public get screens (): IBridgeSurface[] {
    return this.bridge.screens
  }

  public get currentWindow (): IEngineWindow | null {
    return this.bridge.currentWindow
  }

  public set currentWindow (value: IEngineWindow | null) {
    this.bridge.currentWindow = value
  }

  public get currentSurface (): IBridgeSurface {
    return this.bridge.currentSurface
  }

  public set currentSurface (value: IBridgeSurface) {
    this.bridge.currentSurface = value
  }

  public showNotification (text: string, icon?: string, hint?: string): void {
    this.bridge.showNotification(text, icon, hint)
  }

  public manageWindow (window: IEngineWindow): void {
    this.engine.manage(window)
  }

  public drop (): void {
    this.bridge.drop()
  }

  private addEventListenerToBridge (): void {
    this.bridge.addEventListener('onSurfaceUpdate', () => {
      this.engine.arrange()
    })
    this.bridge.addEventListener('onCurrentSurfaceChanged', () => {
      this.logger.info(['onCurrentSurfaceChanged', { srf: this.currentSurface }])
      this.engine.arrange()
    })
    this.bridge.addEventListener('onWindowAdded', (window: IEngineWindow) => {
      this.logger.info(['onWindowAdded', { window }])
      this.engine.manage(window)
      if (window.tileable) {
        const surface = this.currentSurface
        const tiles = this.engine.windows.visibleTiledWindowsOn(surface)
        const layoutCapacity = this.engine.layouts.getCurrentLayout(surface).capacity
        if (layoutCapacity !== undefined && tiles.length > layoutCapacity) {
          const nextSurface = this.currentSurface.next()
          if (nextSurface) {
            window.surface = nextSurface
            this.currentSurface = nextSurface
          }
        }
      }
      this.engine.arrange()
    })
    this.bridge.addEventListener('onWindowRemoved', (window: IEngineWindow) => {
      this.logger.info(`[WindowManager#onWindowRemoved] Window removed: ${window.toString()}`)
      this.engine.unmanage(window)
      if (this.engine.isLayoutMonocleAndMinimizeRest()) {
        if (!this.currentWindow) {
          this.logger.info(
            '[WindowManager#onWindowRemoved] Switching to the minimized window'
          )
          this.engine.focusOrder(1, true)
        }
      }
      this.engine.arrange()
    })
    this.bridge.addEventListener('onWindowMoveStart', (_window: IEngineWindow) => {
      /* do nothing */
    })
    this.bridge.addEventListener('onWindowMove', (_window: IEngineWindow) => {
      /* do nothing */
    })
    this.bridge.addEventListener('onWindowMoveOver', (window: IEngineWindow) => {
      this.logger.info(['onWindowMoveOver', { window }])
      if (window.state === WindowState.Tiled) {
        const tiles = this.engine.windows.visibleTiledWindowsOn(
          this.currentSurface
        )

        const targets = tiles
          .filter((it) => it.id !== window.id)
          .filter(
            (it) => it.actualGeometry.getOverlapFilter(window.actualGeometry)
          ).sort((a, b) => {
            return window.actualGeometry.getOverlapSorter(window.actualGeometry)(a.actualGeometry, b.actualGeometry)
          })
        if (targets.length >= 1) {
          this.engine.windows.swap(window, targets.at(0) as IEngineWindow)
          this.engine.arrange()
          return
        }
        console.log(targets, window)
      }
      if (this.config.untileByDragging) {
        if (window.state === WindowState.Tiled) {
          const diff = window.actualGeometry.subtract(window.geometry)
          const distance = Math.sqrt(diff.x ** 2 + diff.y ** 2)
          if (distance > 30) {
            window.floatGeometry = window.actualGeometry
            window.state = WindowState.Floating
            this.engine.arrange()
            this.engine.showNotification('Window Untiled')
            return
          }
        }
      }
      window.commit()
    })
    this.bridge.addEventListener('onWindowResizeStart', () => {
      /* do nothing */
    })
    this.bridge.addEventListener('onWindowResize', (window: IEngineWindow) => {
      this.logger.info(`[WindowManager#onWindowResize] Window is resizing: ${window.toString()}`)
      if (window.state === WindowState.Tiled) {
        this.engine.adjustLayout(window)
        this.engine.arrange()
      }
    })

    this.bridge.addEventListener('onWindowResizeOver', (window: IEngineWindow) => {
      this.logger.info(
        `[WindowManager#onWindowResizeOver] Window resize is over: ${window.toString()}`
      )
      if (window.tiled) {
        this.engine.adjustLayout(window)
        this.engine.arrange()
      }
    })
    this.bridge.addEventListener('onWindowMaximizeChanged', (_window: IEngineWindow, _maximized: boolean) => {
      this.engine.arrange()
    })
    this.bridge.addEventListener('onWindowGeometryChanged', (window: IEngineWindow) => {
      this.logger.info(['onWindowGeometryChanged', { window }])
    })
    this.bridge.addEventListener('onWindowScreenChanged', (_window: IEngineWindow) => {
      this.engine.arrange()
    })
    this.bridge.addEventListener('onWindowChanged', (window: IEngineWindow | null, comment?: 'unminimized' | 'minimized' | string) => {
      if (window) {
        this.logger.info(['onWindowChanged', { window, comment }])
        if (comment === 'unminimized') {
          this.currentWindow = window
        }
        this.engine.arrange()
      }
    })
    this.bridge.addEventListener('onWindowFocused', (window: IEngineWindow) => {
      window.timestamp = new Date().getTime()
      if (this.engine.isLayoutMonocleAndMinimizeRest()) {
        this.engine.minimizeOthers(window)
      }
    })
    this.bridge.addEventListener('onWindowShadeChanged', (window: IEngineWindow) => {
      this.logger.info(`onWindowShadeChanged, window: ${window.toString()}`)
      if (window.shaded) {
        window.state = WindowState.Floating
      } else {
        window.state = window.statePreviouslyAskedToChangeTo
      }
      this.engine.arrange()
    })
  }

  private addActionToBridge (): void {
    this.bridge.addAction('focusNextWindow', () => { new Action.FocusNextWindow(this.engine, this.logger).execute() })
    this.bridge.addAction('focusPreviousWindow', () => { new Action.FocusPreviousWindow(this.engine, this.logger).execute() })
    this.bridge.addAction('focusUpperWindow', () => { new Action.FocusUpperWindow(this.engine, this.logger).execute() })
    this.bridge.addAction('focusBottomWindow', () => { new Action.FocusBottomWindow(this.engine, this.logger).execute() })
    this.bridge.addAction('focusLeftWindow', () => { new Action.FocusLeftWindow(this.engine, this.logger).execute() })
    this.bridge.addAction('focusRightWindow', () => { new Action.FocusRightWindow(this.engine, this.logger).execute() })
    this.bridge.addAction('moveActiveWindowToNextPosition', () => { new Action.MoveActiveWindowToNextPosition(this.engine, this.logger).execute() })
    this.bridge.addAction('moveActiveWindowToPreviousPosition', () => { new Action.MoveActiveWindowToPreviousPosition(this.engine, this.logger).execute() })
    this.bridge.addAction('moveActiveWindowUp', () => { new Action.MoveActiveWindowUp(this.engine, this.logger).execute() })
    this.bridge.addAction('moveActiveWindowDown', () => { new Action.MoveActiveWindowDown(this.engine, this.logger).execute() })
    this.bridge.addAction('moveActiveWindowLeft', () => { new Action.MoveActiveWindowLeft(this.engine, this.logger).execute() })
    this.bridge.addAction('moveActiveWindowRight', () => { new Action.MoveActiveWindowRight(this.engine, this.logger).execute() })
    this.bridge.addAction('increaseActiveWindowWidth', () => { new Action.IncreaseActiveWindowWidth(this.engine, this.logger).execute() })
    this.bridge.addAction('increaseActiveWindowHeight', () => { new Action.IncreaseActiveWindowHeight(this.engine, this.logger).execute() })
    this.bridge.addAction('decreaseActiveWindowWidth', () => { new Action.DecreaseActiveWindowWidth(this.engine, this.logger).execute() })
    this.bridge.addAction('decreaseActiveWindowHeight', () => { new Action.DecreaseActiveWindowHeight(this.engine, this.logger).execute() })
    this.bridge.addAction('increaseMasterAreaWindowCount', () => { new Action.IncreaseMasterAreaWindowCount(this.engine, this.logger).execute() })
    this.bridge.addAction('decreaseMasterAreaWindowCount', () => { new Action.DecreaseMasterAreaWindowCount(this.engine, this.logger).execute() })
    this.bridge.addAction('increaseLayoutMasterAreaSize', () => { new Action.IncreaseLayoutMasterAreaSize(this.engine, this.logger).execute() })
    this.bridge.addAction('decreaseLayoutMasterAreaSize', () => { new Action.DecreaseLayoutMasterAreaSize(this.engine, this.logger).execute() })
    this.bridge.addAction('toggleActiveWindowFloating', () => { new Action.ToggleActiveWindowFloating(this.engine, this.logger).execute() })
    this.bridge.addAction('pushActiveWindowIntoMasterAreaFront', () => { new Action.PushActiveWindowIntoMasterAreaFront(this.engine, this.logger).execute() })
    this.bridge.addAction('switchToNextLayout', () => { new Action.SwitchToNextLayout(this.engine, this.logger).execute() })
    this.bridge.addAction('switchToPreviousLayout', () => { new Action.SwitchToPreviousLayout(this.engine, this.logger).execute() })
    this.bridge.addAction('toggleTileLayout', () => { new Action.ToggleTileLayout(this.engine, this.logger).execute() })
    this.bridge.addAction('toggleMonocleLayout', () => { new Action.ToggleMonocleLayout(this.engine, this.logger).execute() })
    this.bridge.addAction('toggleThreeColumnLayout', () => { new Action.ToggleThreeColumnLayout(this.engine, this.logger).execute() })
    this.bridge.addAction('toggleStairLayout', () => { new Action.ToggleStairLayout(this.engine, this.logger).execute() })
    this.bridge.addAction('toggleSpreadLayout', () => { new Action.ToggleSpreadLayout(this.engine, this.logger).execute() })
    this.bridge.addAction('toggleFloatingLayout', () => { new Action.ToggleFloatingLayout(this.engine, this.logger).execute() })
    this.bridge.addAction('toggleQuarterLayout', () => { new Action.ToggleQuarterLayout(this.engine, this.logger).execute() })
    this.bridge.addAction('toggleSpiralLayout', () => { new Action.ToggleSpiralLayout(this.engine, this.logger).execute() })
    this.bridge.addAction('rotate', () => { new Action.Rotate(this.engine, this.logger).execute() })
    this.bridge.addAction('focusNextWindow', () => { new Action.FocusNextWindow(this.engine, this.logger).execute() })
    this.bridge.addAction('focusPreviousWindow', () => { new Action.FocusPreviousWindow(this.engine, this.logger).execute() })
    this.bridge.addAction('focusUpperWindow', () => { new Action.FocusUpperWindow(this.engine, this.logger).execute() })
    this.bridge.addAction('focusBottomWindow', () => { new Action.FocusBottomWindow(this.engine, this.logger).execute() })
    this.bridge.addAction('focusLeftWindow', () => { new Action.FocusLeftWindow(this.engine, this.logger).execute() })
    this.bridge.addAction('focusRightWindow', () => { new Action.FocusRightWindow(this.engine, this.logger).execute() })
    this.bridge.addAction('moveActiveWindowToNextPosition', () => { new Action.MoveActiveWindowToNextPosition(this.engine, this.logger).execute() })
    this.bridge.addAction('moveActiveWindowToPreviousPosition', () => { new Action.MoveActiveWindowToPreviousPosition(this.engine, this.logger).execute() })
    this.bridge.addAction('moveActiveWindowUp', () => { new Action.MoveActiveWindowUp(this.engine, this.logger).execute() })
    this.bridge.addAction('moveActiveWindowDown', () => { new Action.MoveActiveWindowDown(this.engine, this.logger).execute() })
    this.bridge.addAction('moveActiveWindowLeft', () => { new Action.MoveActiveWindowLeft(this.engine, this.logger).execute() })
    this.bridge.addAction('moveActiveWindowRight', () => { new Action.MoveActiveWindowRight(this.engine, this.logger).execute() })
    this.bridge.addAction('increaseActiveWindowWidth', () => { new Action.IncreaseActiveWindowWidth(this.engine, this.logger).execute() })
    this.bridge.addAction('increaseActiveWindowHeight', () => { new Action.IncreaseActiveWindowHeight(this.engine, this.logger).execute() })
    this.bridge.addAction('decreaseActiveWindowWidth', () => { new Action.DecreaseActiveWindowWidth(this.engine, this.logger).execute() })
    this.bridge.addAction('decreaseActiveWindowHeight', () => { new Action.DecreaseActiveWindowHeight(this.engine, this.logger).execute() })
    this.bridge.addAction('increaseMasterAreaWindowCount', () => { new Action.IncreaseMasterAreaWindowCount(this.engine, this.logger).execute() })
    this.bridge.addAction('decreaseMasterAreaWindowCount', () => { new Action.DecreaseMasterAreaWindowCount(this.engine, this.logger).execute() })
    this.bridge.addAction('increaseLayoutMasterAreaSize', () => { new Action.IncreaseLayoutMasterAreaSize(this.engine, this.logger).execute() })
    this.bridge.addAction('decreaseLayoutMasterAreaSize', () => { new Action.DecreaseLayoutMasterAreaSize(this.engine, this.logger).execute() })
    this.bridge.addAction('toggleActiveWindowFloating', () => { new Action.ToggleActiveWindowFloating(this.engine, this.logger).execute() })
    this.bridge.addAction('pushActiveWindowIntoMasterAreaFront', () => { new Action.PushActiveWindowIntoMasterAreaFront(this.engine, this.logger).execute() })
    this.bridge.addAction('switchToNextLayout', () => { new Action.SwitchToNextLayout(this.engine, this.logger).execute() })
    this.bridge.addAction('switchToPreviousLayout', () => { new Action.SwitchToPreviousLayout(this.engine, this.logger).execute() })
    this.bridge.addAction('toggleTileLayout', () => { new Action.ToggleTileLayout(this.engine, this.logger).execute() })
    this.bridge.addAction('toggleMonocleLayout', () => { new Action.ToggleMonocleLayout(this.engine, this.logger).execute() })
    this.bridge.addAction('toggleThreeColumnLayout', () => { new Action.ToggleThreeColumnLayout(this.engine, this.logger).execute() })
    this.bridge.addAction('toggleStairLayout', () => { new Action.ToggleStairLayout(this.engine, this.logger).execute() })
    this.bridge.addAction('toggleSpreadLayout', () => { new Action.ToggleSpreadLayout(this.engine, this.logger).execute() })
    this.bridge.addAction('toggleFloatingLayout', () => { new Action.ToggleFloatingLayout(this.engine, this.logger).execute() })
    this.bridge.addAction('toggleQuarterLayout', () => { new Action.ToggleQuarterLayout(this.engine, this.logger).execute() })
    this.bridge.addAction('toggleSpiralLayout', () => { new Action.ToggleSpiralLayout(this.engine, this.logger).execute() })
    this.bridge.addAction('rotate', () => { new Action.Rotate(this.engine, this.logger).execute() })
    this.bridge.addAction('rotatePart', () => { new Action.RotatePart(this.engine, this.logger).execute() })
    this.bridge.addAction('rotateReverse', () => { new Action.RotateReverse(this.engine, this.logger).execute() })
  }
}
