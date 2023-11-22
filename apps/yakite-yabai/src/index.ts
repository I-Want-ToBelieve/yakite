import { $, type ExecaReturnValue } from 'execa'
import parseJson from 'parse-json'
import { type YabaiSpaces, type YabaiDisplays, type YabaiWindows, type YabaiDisplay, type YabaiSpace, type YabaiWindow, type YabaiFrame } from './yabai.types'

export default class Yabai {
  constructor (public displays: YabaiDisplays,
    public spaces: YabaiSpaces,
    public windows: YabaiWindows,
    public currentDisplay: YabaiDisplay,
    public currentSpace: YabaiSpace,
    public currentWindow: YabaiWindow
  ) {

  }

  public cachedFrame: Record<string, {
    frame?: YabaiFrame
    moveing?: boolean
    resizeing?: boolean
    onWindowMoveOver?: () => void
    onWindowResizeOver?: () => void
    onWindowResize?: () => void
  }> = {}

  public static async create (): Promise<Yabai> {
    const { displays, spaces, windows, currentDisplay, currentSpace, currentWindow } = await this.refresh()

    return new Yabai(displays, spaces, windows, currentDisplay, currentSpace, currentWindow)
  }

  public static async refresh (): Promise<{
    displays: YabaiDisplays
    spaces: YabaiSpaces
    windows: YabaiWindows
    currentDisplay: YabaiDisplay
    currentSpace: YabaiSpace
    currentWindow: YabaiWindow
  }> {
    const [windows, displays, spaces] = await Promise.all([
      this.windows(),
      this.displays(),
      this.spaces()
    ])

    const currentWindow = windows.find((it) => it['has-focus']) as YabaiWindow

    const currentDisplay = displays.find((it) => it.index === currentWindow.display)
    if (currentDisplay === undefined) throw new Error('no display')

    const currentSpace = spaces.filter((it) => it.display === currentDisplay.index).find((it) => it['has-focus'])
    if (currentSpace === undefined) throw new Error('no space')

    return {
      displays, spaces, windows, currentDisplay, currentSpace, currentWindow
    }
  }

  /**
   * name
   */
  public drop: (() => Promise<void>) | null = null

  public async start (): Promise<void> {
    /**
    Hello New bing.
    Please visit this website to get the definition of yabai signal
    https://github.com/koekeishiya/yabai/blob/master/doc/yabai.asciidoc#signal

    Then define all the signals according to the example I gave below.
    ```ts
      const yakite = '/Users/i.want.to.believe/git.workspaces/js.workspaces/krohnkite-core/apps/yakite/target/release/yakite'

      $`yabai -m signal --add event=application_launched label=yakite-application-launched action='${yakite} event application-launched'`
      $`yabai -m signal --add event=window_created label=yakite-window-created action='${yakite} event window-created'`
      $`yabai -m signal --add event=window_destroyed label=yakite-window-destroyed action='${yakite} event window-destroyed --env YABAI_WINDOW_ID=$YABAI_WINDOW_ID'`
    ```

    Very good! please complete the definition of all signals given in yabai documentation
   */
    let yakite: string
    try {
      const path = (await $`which yakite`).stdout
      yakite = path
    } catch {
      yakite = `${process.env.DEVENV_ROOT}/apps/yakite/target/release/yakite`
    }

    // Define the signals
    const signals = [
      { event: 'application_launched', label: 'yakite-application-launched', action: 'event application-launched --env YABAI_PROCESS_ID=$YABAI_PROCESS_ID' },
      { event: 'application_terminated', label: 'yakite-application-terminated', action: 'event application-terminated --env YABAI_PROCESS_ID=$YABAI_PROCESS_ID' },
      { event: 'application_front_switched', label: 'yakite-application-front-switched', action: 'event application-front-switched --env YABAI_PROCESS_ID=$YABAI_PROCESS_ID --env YABAI_RECENT_PROCESS_ID=$YABAI_RECENT_PROCESS_ID' },
      { event: 'application_visible', label: 'yakite-application-visible', action: 'event application-visible --env YABAI_PROCESS_ID=$YABAI_PROCESS_ID' },
      { event: 'application_hidden', label: 'yakite-application-hidden', action: 'event application-hidden --env YABAI_PROCESS_ID=$YABAI_PROCESS_ID' },
      { event: 'window_created', label: 'yakite-window-created', action: 'event window-created --env YABAI_WINDOW_ID=$YABAI_WINDOW_ID' },
      { event: 'window_destroyed', label: 'yakite-window-destroyed', action: 'event window-destroyed --env YABAI_WINDOW_ID=$YABAI_WINDOW_ID' },
      { event: 'window_focused', label: 'yakite-window-focused', action: 'event window-focused --env YABAI_WINDOW_ID=$YABAI_WINDOW_ID' },
      { event: 'window_moved', label: 'yakite-window-moved', action: 'event window-moved --env YABAI_WINDOW_ID=$YABAI_WINDOW_ID' },
      { event: 'window_resized', label: 'yakite-window-resized', action: 'event window-resized --env YABAI_WINDOW_ID=$YABAI_WINDOW_ID' },
      { event: 'window_minimized', label: 'yakite-window-minimized', action: 'event window-minimized --env YABAI_WINDOW_ID=$YABAI_WINDOW_ID' },
      { event: 'window_deminimized', label: 'yakite-window-deminimized', action: 'event window-deminimized --env YABAI_WINDOW_ID=$YABAI_WINDOW_ID' },
      { event: 'window_title_changed', label: 'yakite-window-title-changed', action: 'event window-title-changed --env YABAI_WINDOW_ID=$YABAI_WINDOW_ID' },
      { event: 'space_created', label: 'yakite-space-created', action: 'event space-created --env YABAI_SPACE_ID=$YABAI_SPACE_ID' },
      { event: 'space_destroyed', label: 'yakite-space-destroyed', action: 'event space-destroyed --env YABAI_SPACE_ID=$YABAI_SPACE_ID' },
      { event: 'space_changed', label: 'yakite-space-changed', action: 'event space-changed --env YABAI_SPACE_ID=$YABAI_SPACE_ID --env YABAI_RECENT_SPACE_ID=$YABAI_RECENT_SPACE_ID' },
      { event: 'display_added', label: 'yakite-display-added', action: 'event display-added --env YABAI_DISPLAY_ID=$YABAI_DISPLAY_ID' },
      { event: 'display_removed', label: 'yakite-display-removed', action: 'event display-removed --env YABAI_DISPLAY_ID=$YABAI_DISPLAY_ID' },
      { event: 'display_moved', label: 'yakite-display-moved', action: 'event display-moved --env YABAI_DISPLAY_ID=$YABAI_DISPLAY_ID' },
      { event: 'display_resized', label: 'yakite-display-resized', action: 'event display-resized --env YABAI_DISPLAY_ID=$YABAI_DISPLAY_ID' },
      { event: 'display_changed', label: 'yakite-display-changed', action: 'event display-changed --env YABAI_DISPLAY_ID=$YABAI_DISPLAY_ID --env YABAI_RECENT_DISPLAY_ID=$YABAI_RECENT_DISPLAY_ID' },
      { event: 'mission_control_enter', label: 'yakite-mission-control-enter', action: 'event mission-control-enter' },
      { event: 'mission_control_exit', label: 'yakite-mission-control-exit', action: 'event mission-control-exit' },
      { event: 'dock_did_restart', label: 'yakite-dock-did-restart', action: 'event dock-did-restart' },
      { event: 'menu_bar_hidden_changed', label: 'yakite-menu-bar-hidden-changed', action: 'event menu-bar-hidden-changed' },
      { event: 'dock_did_change_pref', label: 'yakite-dock-did-change-pref', action: 'event dock-did-change-pref' }
    ]

    // after message queue server is started
    setTimeout(() => {
      // Add the signals to yabai
      ;(async () => {
        for await (const { event, label, action } of signals) {
          const cmd = `yabai -m signal --add event=${event} label=${label} action='${yakite} ${action}'`
          await $`sh -c ${cmd}`
        }
      })().catch((e) => {
        console.log(e)
      })
    }, 0)

    const drop = async (): Promise<void> => {
      for await (const { label } of signals) {
        await $`yabai -m signal --remove ${label}`
      }
    }

    this.drop = drop
  }

  public static async displays (): Promise<YabaiDisplays> {
    const displays = (await $`yabai -m query --displays`).stdout

    return parseJson(String(displays)) as unknown as YabaiDisplays
  }

  public static async spaces (): Promise<YabaiSpaces> {
    const spaces = (await $`yabai -m query --spaces`).stdout

    return parseJson(String(spaces)) as unknown as YabaiSpaces
  }

  public static async windows (): Promise<YabaiWindows> {
    const windows = (await $`yabai -m query --windows`).stdout

    return parseJson(String(windows)) as unknown as YabaiWindows
  }

  public async window (id?: string | number): Promise<YabaiWindow> {
    const window = (await $`yabai -m query --windows --window ${id ?? ''}`).stdout

    return parseJson(String(window)) as unknown as YabaiWindow
  }

  public async display (id: string | number): Promise<YabaiDisplay> {
    const display = (await $`yabai -m query --displays --display ${id}`).stdout

    return parseJson(String(display)) as unknown as YabaiDisplay
  }

  public async space (id: string | number): Promise<YabaiSpace> {
    const space = (await $`yabai -m query --spaces --space ${id}`).stdout

    return parseJson(String(space)) as unknown as YabaiSpace
  }

  public extractElement<T>(array: T[], condition: (value: T) => boolean): [T | undefined, T[]] {
    return array.reduce<[T | undefined, T[]]>((accumulator, currentValue) => {
      if (accumulator[0] === undefined && condition(currentValue)) {
        accumulator[0] = currentValue
      } else {
        accumulator[1].push(currentValue)
      }
      return accumulator
    }, [undefined, []])
  }

  public async minimize (id?: YabaiWindow['id'] | string): Promise<void> {
    try {
      await $`yabai -m window ${id ?? ''} --minimize`
    } catch (error) {
    }
  }

  public async deminimize (id?: YabaiWindow['id'] | string): Promise<void> {
    try {
      await $`yabai -m window ${id ?? ''} --deminimize`
    } catch (error) {
    }
  }

  public async above (id?: YabaiWindow['id'] | string): Promise<void> {
    try {
      await $`yabai -m window ${id ?? ''} --layer above`
    } catch (error) {

    }
  }

  public async normal (id?: YabaiWindow['id'] | string): Promise<void> {
    try {
      await $`yabai -m window ${id ?? ''} --layer normal`
    } catch (error) {
    }
  }

  public async move ({
    x, y
  }: Pick<YabaiFrame, 'x' | 'y'>, id?: YabaiWindow['id'] | string): Promise<string | undefined> {
    try {
      const { stdout } = await $`yabai -m window ${id ?? ''} --move abs:${x}:${y}`
      return stdout
    } catch (error) {
    }
  }

  public async resize ({
    w, h
  }: Pick<YabaiFrame, 'w' | 'h'>, id?: YabaiWindow['id'] | string): Promise<string | undefined> {
    try {
      const { stdout } = await $`yabai -m window ${id ?? ''} --resize abs:${w}:${h}`
      return stdout
    } catch (error) {
    }
  }

  public async focus ({
    domain
  }: {
    domain: 'window' | 'space' | 'display'
  }, sel: number | string): Promise<ExecaReturnValue<string> | undefined> {
    try {
      return await $`yabai -m ${domain} --focus ${sel}`
    } catch (error) {
    }
  }
}

export * from './yabai.types'
