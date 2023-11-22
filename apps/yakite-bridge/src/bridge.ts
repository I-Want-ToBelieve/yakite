import { YakiteBridgeSurface } from './surface'

import {
  type ActionNames,
  type EventNames,
  type WindowEventCallbacks,
  type WindowsManager,
  type Logger,
  type IBridge,
  type IBridgeSurface,
  type IEngineWindow,
  EngineWindow,
  WindowState
} from 'krohnkite-core'
import Yabai from 'yakite-yabai'
import {
  type YabaiFrame,
  type YabaiWindow
} from 'yakite-yabai'
import { YakiteBridgeWindow } from './window'
import { type EventHandlerMap } from 'yakite-message'
import { Rect } from 'krohnkite-core'
import debounce from 'debounce'
import { $ } from 'execa'
import { type YakiteConfig } from 'yakite-config'

export class YakiteBridge implements IBridge {
  public wm: WindowsManager | undefined
  private readonly windowMap: WrapperMap<
  YabaiWindow,
  IEngineWindow
  >

  private entered: boolean

  /**
   * @param config Bismuth configuration. If none is provided, the configuration is read from KConfig (in most cases from config file).
   */
  constructor (
    private readonly yabai: Yabai,
    private readonly config: YakiteConfig,
    private readonly logger: Logger
  ) {
    this.windowMap = new WrapperMap(
      (window: YabaiWindow) =>
        YakiteBridgeWindow.generateID(window),
      (window: YabaiWindow) =>
        new EngineWindow(
          new YakiteBridgeWindow(
            window.id,
            this.config,
            this.yabai
          ),
          this.config,
          this.logger
        ),
      this.logger
    )
    this.entered = false
  }

  static async create (
    yabai: Yabai,
    config: YakiteConfig,
    logger: Logger
  ): Promise<YakiteBridge> {
    await yabai.start()

    return new YakiteBridge(yabai, config, logger)
  }

  public listeners: {
    [K in EventNames]: WindowEventCallbacks[K]
  } = {} as any

  public actions: {
    [K in ActionNames]: () => any
  } = {} as any

  public addAction (
    name: ActionNames,
    callback: () => void
  ): void {
    this.actions[name] = callback
  }

  public addEventListener<K extends EventNames> (
    name: K,
    callback: WindowEventCallbacks[K]
  ): void {
    this.listeners[name] = callback
  }

  public get currentSurface (): IBridgeSurface {
    const { currentDisplay, currentSpace } =
      this.yabai
    return new YakiteBridgeSurface(
      currentDisplay.id,
      currentSpace.id,
      this.config,
      this.yabai
    )
  }

  public set currentSurface (
    value: IBridgeSurface
  ) {
    const surface = value as YakiteBridgeSurface

    if (
      this.yabai.currentSpace.index !==
      surface.space.index
    ) {
      void this.yabai.focus(
        {
          domain: 'space'
        },
        surface.space.index
      )
    }
  }

  public get currentWindow (): IEngineWindow | null {
    const window = this.yabai.currentWindow
    return window
      ? this.windowMap.get(window)
      : null
  }

  public set currentWindow (
    window: IEngineWindow | null
  ) {
    if (window !== null) {
      void this.yabai.focus(
        {
          domain: 'window'
        },
        window.window.id
      )
    }
  }

  public get screens (): IBridgeSurface[] {
    return this.yabai.displays.map(display => {
      return new YakiteBridgeSurface(
        display.id,
        this.yabai.currentSpace.id,
        this.config,
        this.yabai
      )
    })
  }

  private async autofocus (
    { force, id } = {
      force: false,
      id: -1
    }
  ): Promise<void> {
    await new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        ;(async () => {
          try {
            const windows = await Yabai.windows()
            if (force && id !== -1) {
              await this.yabai.focus(
                { domain: 'window' },
                id
              )
            } else if (
              !windows.find(
                it =>
                  it['has-focus'] &&
                  !it['is-minimized']
              )
            ) {
              this.wm?.engine.focusOrder(1, false)
            }
            resolve()
          } catch (error) {
            reject(new Error('not have yabai'))
          }
        })().catch(() => {
          reject(new Error('not have yabai'))
        })
      }, 31)
    })
  }

  public get wrappedListeners (): EventHandlerMap {
    return {
      applicationLaunched: async () => {},
      applicationTerminated: async () => {},
      applicationFrontSwitched: async () => {},
      applicationVisible: async env => {
        await this.enter(async () => {
          this.yabai.windows =
            this.yabai.windows.map(it => {
              if (
                it.pid === +env.YABAI_PROCESS_ID
              ) {
                return {
                  ...it,
                  'is-hidden': false,
                  'is-visible': true
                }
              } else {
                return it
              }
            })
          const yabaiWindows =
            this.yabai.windows.filter(
              it =>
                it.pid === +env.YABAI_PROCESS_ID
            )
          if (yabaiWindows.length === 0) {
            return
          }

          yabaiWindows.forEach(yabaiWindow => {
            this.logger.info(
              `applicationVisible(): ${yabaiWindow.id}-${yabaiWindow.app}`
            )

            const window =
              this.windowMap.add(yabaiWindow)

            this.listeners.onWindowAdded(window)

            if (
              window.state ===
              WindowState.Unmanaged
            ) {
              this.logger.info(
                `Window becomes unmanaged and gets removed :( The client was ${yabaiWindow.id}-${yabaiWindow.app}`
              )
              this.windowMap.remove(yabaiWindow)
            } else {
              this.logger.info(
                'Window is ok, can manage. Bind events now...'
              )
            }
          })
        })
      },
      applicationHidden: async env => {
        await this.enter(async () => {
          // sync the window state
          this.yabai.windows =
            this.yabai.windows.map(it => {
              if (
                it.pid === +env.YABAI_PROCESS_ID
              ) {
                return {
                  ...it,
                  'is-hidden': true,
                  'is-visible': false
                }
              } else {
                return it
              }
            })
          const yabaiWindows =
            this.yabai.windows.filter(
              it =>
                it.pid === +env.YABAI_PROCESS_ID
            )
          if (yabaiWindows.length === 0) {
            return
          }

          yabaiWindows.forEach(yabaiWindow => {
            this.logger.info(
              `applicationHidden(): ${yabaiWindow.id}-${yabaiWindow.app}`
            )
            const window =
              this.windowMap.get(yabaiWindow)
            if (window) {
              this.listeners.onWindowRemoved(
                window
              )
              this.windowMap.remove(yabaiWindow)
            }
          })

          if (this.config.yakite.autoforce) {
            await this.autofocus()
          }
        })
      },

      windowCreated: async env => {
        await this.enter(async () => {
          const yabaiWindow =
            await this.yabai.window(
              env.YABAI_WINDOW_ID
            )

          this.yabai.windows.push(yabaiWindow)

          this.logger.info(
            `windowCreated(): ${yabaiWindow.id}-${yabaiWindow.app}`
          )

          const window =
            this.windowMap.add(yabaiWindow)

          this.listeners.onWindowAdded(window)

          if (
            window.state === WindowState.Unmanaged
          ) {
            this.logger.info(
              `Window becomes unmanaged and gets removed :( The client was ${yabaiWindow.id}-${yabaiWindow.app}`
            )
            this.windowMap.remove(yabaiWindow)
          } else {
            this.logger.info(
              'Window is ok, can manage. Bind events now...'
            )
          }

          if (this.config.yakite.autoforce) {
            await this.autofocus({
              force: true,
              id: yabaiWindow.id
            })
          }
        })
      },
      windowDestroyed: async env => {
        await this.enter(async () => {
          const [yabaiWindow, rest] =
            this.yabai.extractElement(
              this.yabai.windows,
              it => it.id === +env.YABAI_WINDOW_ID
            )
          if (!yabaiWindow) return

          this.yabai.windows = rest

          const window =
            this.windowMap.get(yabaiWindow)

          this.logger.info(
            `windowDestroyed(): ${yabaiWindow.id}-${yabaiWindow.app}`
          )

          if (window) {
            this.listeners.onWindowRemoved(window)
            this.windowMap.remove(yabaiWindow)
          }

          if (this.config.yakite.autoforce) {
            await this.autofocus()
          }
        })
      },
      windowFocused: async env => {
        await this.enter(async () => {
          const { currentWindow: prevWindow } =
            this.yabai
          if (
            prevWindow.id === +env.YABAI_WINDOW_ID
          ) {
            return
          }

          this.yabai.windows =
            this.yabai.windows.map(it => {
              if (
                it.id === +env.YABAI_WINDOW_ID
              ) {
                // change currentWindow
                this.yabai.currentWindow = {
                  ...it,
                  'has-focus': true
                }
                return this.yabai.currentWindow
              }

              if (it.id === prevWindow.id) {
                return {
                  ...it,
                  'has-focus': false
                }
              }

              return it
            })

          const { currentWindow } = this.yabai

          this.logger.info(
            `windowFocused(): ${currentWindow.app}-${currentWindow.id}`
          )

          const isPrevWindowNowDestroyed =
            !this.yabai.windows.find(
              it => it.id === prevWindow.id
            )

          if (isPrevWindowNowDestroyed) {
            return
          }

          const prevWindowNow =
            await this.yabai.window(prevWindow.id)
          // if it still exists
          if (prevWindowNow) {
            // check whether it has been moved to another space
            if (
              prevWindowNow.space !==
              prevWindow.space
            ) {
              this.yabai.windows =
                this.yabai.windows.map(it => {
                  if (
                    it.id === prevWindowNow.id
                  ) {
                    return {
                      ...it,
                      space: prevWindowNow.space
                    }
                  }
                  return it
                })
              const window = this.windowMap.get(
                prevWindowNow
              )

              if (!window) return

              this.listeners.onWindowChanged(
                window,
                `space=${prevWindowNow.space}`
              )
            }
            // or display.
            if (
              prevWindowNow.display !==
              prevWindow.display
            ) {
              this.yabai.windows =
                this.yabai.windows.map(it => {
                  if (
                    it.id === prevWindowNow.id
                  ) {
                    return {
                      ...it,
                      display:
                        prevWindowNow.display
                    }
                  }
                  return it
                })
              const window = this.windowMap.get(
                prevWindowNow
              )
              if (!window) return

              this.listeners.onWindowScreenChanged(
                window
              )
            }
          }
        })
      },
      windowMoved: async env => {
        await this.enter(async () => {
          console.log('windowMoved():', env)
          const yabaiWindow =
            await this.yabai.window(
              env.YABAI_WINDOW_ID
            )
          if (!yabaiWindow) return

          const { frame } = yabaiWindow
          const ID =
            YakiteBridgeWindow.generateID(
              yabaiWindow
            )

          const isFirst =
            !this.yabai.cachedFrame[ID] ||
            !(
              'moveing' in
              this.yabai.cachedFrame[ID]
            ) ||
            !(
              'frame' in
              this.yabai.cachedFrame[ID]
            )

          const moveing =
            isFirst ||
            !Rect.fromFrame({
              ...yabaiWindow.frame,
              w: 0,
              h: 0
            }).equals(
              Rect.fromFrame({
                ...(this.yabai.cachedFrame[ID]
                  .frame as YabaiFrame),
                w: 0,
                h: 0
              })
            )

          if (isFirst) {
            this.yabai.cachedFrame[ID] = {
              frame,
              moveing
            }
            return
          }

          if (
            moveing ===
            this.yabai.cachedFrame[ID].moveing
          ) {
            this.yabai.cachedFrame[ID] = {
              frame,
              moveing
            }
            return
          }

          console.log(this.yabai.cachedFrame[ID])
          console.log('Move End', env)

          if (!moveing) {
            const window =
              this.windowMap.get(yabaiWindow)
            if (!window) return

            this.yabai.cachedFrame[ID] = {
              frame,
              moveing
            }

            if (
              !this.yabai.cachedFrame[ID]
                .onWindowMoveOver
            ) {
              this.yabai.cachedFrame[
                ID
              ].onWindowMoveOver = debounce(
                () => {
                  this.yabai.windows =
                    this.yabai.windows.map(it => {
                      if (
                        it.id ===
                        +env.YABAI_WINDOW_ID
                      ) {
                        return {
                          ...it,
                          frame
                        }
                      }

                      return it
                    })

                  delete this.yabai.cachedFrame[
                    ID
                  ].frame
                  delete this.yabai.cachedFrame[
                    ID
                  ].moveing

                  this.listeners.onWindowMoveOver(
                    window
                  )
                },
                31.4
              )
            }

            this.yabai.cachedFrame[
              ID
            ].onWindowMoveOver?.()
          }
        })
      },
      windowResized: async env => {
        await this.enter(async () => {
          console.log('windowResized():', env)
          const yabaiWindow =
            await this.yabai.window(
              env.YABAI_WINDOW_ID
            )
          if (!yabaiWindow) return

          const { frame } = yabaiWindow
          const ID =
            YakiteBridgeWindow.generateID(
              yabaiWindow
            )

          const isFirst =
            !this.yabai.cachedFrame[ID] ||
            !(
              'resizeing' in
              this.yabai.cachedFrame[ID]
            ) ||
            !(
              'frame' in
              this.yabai.cachedFrame[ID]
            )

          const resizeing =
            isFirst ||
            !Rect.fromFrame({
              ...yabaiWindow.frame,
              x: 0,
              y: 0
            }).equals(
              Rect.fromFrame({
                ...(this.yabai.cachedFrame[ID]
                  .frame as YabaiFrame),
                x: 0,
                y: 0
              })
            )

          this.yabai.cachedFrame[ID] = {
            frame,
            resizeing
          }

          const window =
            this.windowMap.get(yabaiWindow)
          if (!window) return

          this.yabai.windows =
            this.yabai.windows.map(it => {
              if (
                it.id === +env.YABAI_WINDOW_ID
              ) {
                return {
                  ...it,
                  frame
                }
              }

              return it
            })

          if (
            !this.yabai.cachedFrame[ID]
              .onWindowResize
          ) {
            this.yabai.cachedFrame[
              ID
            ].onWindowResize = debounce(() => {
              this.yabai.cachedFrame[
                ID
              ].resizeing = false
              delete this.yabai.cachedFrame[ID]
                .frame
              delete this.yabai.cachedFrame[ID]
                .resizeing

              this.listeners.onWindowResize(
                window
              )
            }, 100)
          }

          this.yabai.cachedFrame[
            ID
          ].onWindowResize?.()

          if (isFirst) return

          if (
            resizeing ===
            this.yabai.cachedFrame[ID].resizeing
          ) {
            return
          }

          console.log(this.yabai.cachedFrame[ID])
          console.log('Log End', env)

          if (!resizeing) {
            if (
              !this.yabai.cachedFrame[ID]
                .onWindowResizeOver
            ) {
              this.yabai.cachedFrame[
                ID
              ].onWindowResizeOver = debounce(
                () => {
                  this.yabai.cachedFrame[
                    ID
                  ].resizeing = false
                  delete this.yabai.cachedFrame[
                    ID
                  ].frame
                  delete this.yabai.cachedFrame[
                    ID
                  ].resizeing

                  this.listeners.onWindowResizeOver(
                    window
                  )
                },
                314
              )
            }

            this.yabai.cachedFrame[
              ID
            ].onWindowResizeOver?.()
          }
        })
      },

      windowTitleChanged: async env => {
        await this.enter(async () => {
          const yabaiWindow =
            await this.yabai.window(
              env.YABAI_WINDOW_ID
            )

          this.yabai.windows =
            this.yabai.windows.map(it => {
              if (
                it.id === +env.YABAI_WINDOW_ID
              ) {
                return {
                  ...it,
                  title: yabaiWindow.title
                }
              }
              return it
            })

          this.logger.info(
            `windowTitleChanged(): ${yabaiWindow.id}-${yabaiWindow.app}-${yabaiWindow.title}`
          )
        })
      },

      windowMinimized: async env => {
        await this.enter(async () => {
          this.yabai.windows =
            this.yabai.windows.map(it => {
              if (
                it.id === +env.YABAI_WINDOW_ID
              ) {
                return {
                  ...it,
                  'is-minimized': true
                }
              }
              return it
            })

          const yabaiWindow =
            this.yabai.windows.find(
              it => it.id === +env.YABAI_WINDOW_ID
            )

          if (!yabaiWindow) return

          this.logger.info(
            `windowMinimized(): ${yabaiWindow.id}-${yabaiWindow.app}`
          )

          this.listeners.onWindowChanged(
            this.windowMap.get(yabaiWindow),
            'minimized'
          )

          if (this.config.yakite.autoforce) {
            await this.autofocus()
          }
        })
      },

      windowDeminimized: async env => {
        await this.enter(async () => {
          this.yabai.windows =
            this.yabai.windows.map(it => {
              if (
                it.id === +env.YABAI_WINDOW_ID
              ) {
                return {
                  ...it,
                  'is-minimized': false
                }
              }
              return it
            })

          const yabaiWindow =
            this.yabai.windows.find(
              it => it.id === +env.YABAI_WINDOW_ID
            )

          if (!yabaiWindow) return

          this.logger.info(
            `windowDeminimized(): ${yabaiWindow.id}-${yabaiWindow.app}`
          )

          this.listeners.onWindowChanged(
            this.windowMap.get(yabaiWindow),
            'unminimized'
          )
        })
      },

      spaceCreated: async env => {
        await this.enter(async () => {
          const space = await this.yabai.space(
            env.YABAI_SPACE_ID
          )

          this.yabai.spaces.push(space)

          this.logger.info(
            `spaceCreated(): ${space.index}-${space.id}`
          )

          this.listeners.onCurrentSurfaceChanged()
        })
      },

      spaceDestroyed: async env => {
        await this.enter(async () => {
          const [yabaiSpace, rest] =
            this.yabai.extractElement(
              this.yabai.spaces,
              it => it.id === +env.YABAI_SPACE_ID
            )
          if (!yabaiSpace) return

          this.yabai.spaces = rest

          this.logger.info(
            `spaceDestroyed(): ${env.YABAI_SPACE_ID}-${yabaiSpace.id}`
          )

          this.listeners.onCurrentSurfaceChanged()
        })
      },

      spaceChanged: async env => {
        await this.enter(async () => {
          this.yabai.spaces =
            this.yabai.spaces.map(it => {
              if (
                it.id ===
                this.yabai.currentSpace.id
              ) {
                return {
                  ...it,
                  'has-focus': false
                }
              }

              if (it.id === +env.YABAI_SPACE_ID) {
                this.yabai.currentSpace = {
                  ...it,
                  'has-focus': true
                }
                return this.yabai.currentSpace
              }

              return it
            })

          this.logger.info(
            `spaceChanged(): ${this.yabai.currentSpace.index}-${this.yabai.currentSpace.id}`
          )

          this.listeners.onCurrentSurfaceChanged()
        })
      },

      displayAdded: async env => {
        await this.enter(async () => {
          const display =
            await this.yabai.display(
              env.YABAI_DISPLAY_ID
            )

          this.yabai.displays.push(display)
          this.logger.info(
            `displayAdded(): ${display.index}-${display.id}`
          )

          this.listeners.onCurrentSurfaceChanged()
        })
      },

      displayRemoved: async env => {
        await this.enter(async () => {
          const [yabaiDisplay, rest] =
            this.yabai.extractElement(
              this.yabai.displays,
              it =>
                it.id === +env.YABAI_DISPLAY_ID
            )
          if (!yabaiDisplay) return

          this.yabai.displays = rest
          this.logger.info(
            `displayRemoved(): ${yabaiDisplay.index}-${yabaiDisplay.id}`
          )

          this.listeners.onCurrentSurfaceChanged()
        })
      },

      displayMoved: async () => {
        await this.enter(async () => {
          const displays = await Yabai.displays()

          this.yabai.displays = displays

          this.listeners.onCurrentSurfaceChanged()

          this.logger.info('displayMoved()')
        })
      },

      displayResized: async env => {
        await this.enter(async () => {
          const display =
            await this.yabai.display(
              env.YABAI_DISPLAY_ID
            )

          if (!display) return
          this.yabai.displays =
            this.yabai.displays.map(it => {
              if (
                it.id === +env.YABAI_DISPLAY_ID
              ) {
                return {
                  ...it,
                  frame: display.frame
                }
              }

              return it
            })
          this.logger.info(
            `displayResized(): ${display.index}-${display.id}`
          )

          this.listeners.onCurrentSurfaceChanged()
        })
      },

      displayChanged: async env => {
        await this.enter(async () => {
          this.yabai.displays =
            this.yabai.displays.map(it => {
              if (
                it.id === +env.YABAI_DISPLAY_ID
              ) {
                this.yabai.currentDisplay = it
                return this.yabai.currentDisplay
              }

              return it
            })

          this.logger.info(
            `displayChanged(): ${this.yabai.currentDisplay.index}-${this.yabai.currentDisplay.id}`
          )

          this.listeners.onCurrentSurfaceChanged()
        })
      },
      missionControlEnter: async () => {},
      missionControlExit: async () => {},
      dockDidRestart: async () => {},
      menuBarHiddenChanged: async () => {},
      dockDidChangePref: async () => {}
    }
  }

  public manageWindows (): void {
    const windows = this.yabai.windows

    for (const window of windows) {
      this.manageWindow(window)
    }
  }

  /**
   * Manage window with the particular KWin clientship
   * @param client window client object specified by KWin
   */
  private manageWindow (win: YabaiWindow): void {
    // Add window to our window map
    const window = this.windowMap.add(win)

    if (window.shouldIgnore) {
      this.windowMap.remove(win)
      return
    }

    this.wm?.manageWindow(window)
  }

  public async showNotification (
    text: string,
    icon?: string,
    hint?: string
  ): Promise<void> {
    this.logger.info(
      `showNotification(): ${text} ${icon} ${hint}`
    )
    let yakiteToast

    try {
      const path = (await $`which yakite-toast`)
        .stdout
      yakiteToast = path
    } catch {
      yakiteToast = `${process.env.DEVENV_ROOT}/apps/yakite-toast/dist/yakite-toast`
    }

    try {
      await $`${yakiteToast} --text ${text}`
    } catch (error) {}
  }

  public async drop (): Promise<void> {
    this.logger.info(
      'Dropping all registered callbacks... Goodbye.'
    )
    await this.yabai.drop?.()
  }

  /**
   * Run the given function in a protected(?) context to prevent nested event
   * handling.
   *
   * KWin emits signals as soon as window states are changed, even when
   * those states are modified by the script. This causes multiple re-entry
   * during event handling, resulting in performance degradation and harder
   * debugging.
   */
  private async enter (
    callback: () => Promise<void>
  ): Promise<void> {
    if (this.entered) {
      return
    }

    try {
      // this.entered = true
      await callback()
    } catch (e: any) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      this.logger.info(
        `Oops! ${e.name}: ${e.message}. `
      )
    } finally {
      this.entered = false
    }
  }
}

/**
 * Wrapper map type.
 */
class WrapperMap<F, T> {
  private items: Record<string, T>

  constructor (
    public readonly hasher: (item: F) => string,
    public readonly wrapper: (item: F) => T,
    public readonly logger: Logger
  ) {
    this.items = {}
  }

  public add (item: F): T {
    const key = this.hasher(item)

    if (this.items[key] !== undefined) {
      this.logger.error(
        `WrapperMap: the key [' ${key} '] already exists!`
      )
    }

    const wrapped = this.wrapper(item)
    this.items[key] = wrapped
    return wrapped
  }

  public get (item: F): T | null {
    const key = this.hasher(item)
    return this.items[key] || null
  }

  public getByKey (key: string): T | null {
    return this.items[key] || null
  }

  public remove (item: F): boolean {
    const key = this.hasher(item)
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    return delete this.items[key]
  }
}
