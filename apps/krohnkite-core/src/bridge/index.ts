// SPDX-FileCopyrightText: 2018-2019 Eon S. Jeon <esjeon@hyunmu.am>
// SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@gikari.com>
//
// SPDX-License-Identifier: MIT

import { type IBridgeSurface } from './surface'

import { type ActionNames } from '@/action'
import { type WindowsManager, type EventNames, type WindowEventCallbacks } from '@/manager'
import { type IEngineWindow } from '@/engine/window'

/**
 * The responsibility of Bridge is to provide the operations provided by the window manager to the actual caller,
 * and to hand over the triggerable event listeners to the actual triggerer for binding
 * As its name suggests, it is a bridge between the running environment and the window manager layout engine..
 */
export interface IBridge {
  wm?: WindowsManager
  /**
   * All the surfaces/screens currently possess by the running environment
   */
  readonly screens: IBridgeSurface[]

  /**
   * Surface (screen) of the current window
   */
  currentSurface: IBridgeSurface

  /**
   * Currently active (i.e. focused) window
   */
  currentWindow: IEngineWindow | null

  /**
   * Events that the window manager needs to listen for
   */
  listeners: {
    [K in EventNames]: WindowEventCallbacks[K]
  }

  /**
   * Actions that can be performed on the window manager
   */
  actions: Record<ActionNames, () => any> | Record<any, any>

  /**
   * Show a popup notification in the center of the screen.
   * @param text the main text of the notification.
   * @param icon an optional name of the icon to display in the pop-up.
   * @param hint an optional string displayed beside the main text.
   */
  showNotification: (text: string, icon?: string, hint?: string) => void

  /**
   * The window manager needs to listen to events in the environment,
   * so it applies to the bridge to add these events,
   * and then the other side of the bridge calls the corresponding callback function when the relevant events occur.
   */
  addEventListener: <K extends EventNames> (name: K, callback: WindowEventCallbacks[K]) => void

  /**
   * The window manager exposes actions to the bridge,
   * so that the other side of the bridge can call those actions through the bridge.,
  */
  addAction: (name: ActionNames, callback: () => any) => void

  /**
   * Manage the windows, that were active before script loading
   */
  manageWindows: () => void

  /**
   * Destroy all callbacks and other non-GC resources
   */
  drop: () => void
}

export * from './surface'
export * from './window'
