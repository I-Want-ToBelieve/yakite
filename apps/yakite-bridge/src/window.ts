import { Rect, matchWords } from 'krohnkite-core'
import { YakiteBridgeSurface } from './surface'
import { type Config, type IBridgeWindow, type IBridgeSurface } from 'krohnkite-core'
import { type YabaiSpace, type YabaiDisplay, type YabaiWindow } from 'yakite-yabai'
import type Yabai from 'yakite-yabai'

export class YakiteBridgeWindow implements IBridgeWindow {
  /**
   * Create a window from the Yabai Window object
   *
   * @param id
   * @param config
   * @param log
   */
  constructor (
    public readonly id: YabaiWindow['id'],
    private readonly config: Config,
    private readonly yabai: Yabai
  ) {
    this.maximized = this.fullScreen
  }

  private savedWindow: YabaiWindow | null = null

  public get window (): YabaiWindow {
    const window = this.yabai.windows.find((it) => +it.id === +this.id)

    if (window) {
      this.savedWindow = window
    }

    return this.savedWindow as YabaiWindow
  }

  public get fullScreen (): boolean {
    return this.window['is-native-fullscreen']
  }

  public get geometry (): Rect {
    return Rect.fromFrame(this.window.frame)
  }

  public get active (): boolean {
    return this.window['has-focus']
  }

  public get shouldIgnore (): boolean {
    const { app, role, title } = this.window

    return (
      this.window['is-hidden'] ||
      this.config.ignore.class.includes(app) ||
      matchWords(title, this.config.ignore.title) >= 0 ||
      this.config.ignore.role.includes(role)
    )
  }

  public get shouldFloat (): boolean {
    const { app, title } = this.window

    return (
      !this.window['can-resize'] ||
      this.isDialog ||
      this.config.floating.class.includes(app) ||
      matchWords(title, this.config.floating.title) >= 0
    )
  }

  public get screen (): number {
    return this.window.display
  }

  public get minimized (): boolean {
    return this.window['is-minimized']
  }

  public set minimized (min: boolean) {
    if (min) {
      void this.yabai.minimize(this.id)
    } else {
      void this.yabai.deminimize(this.id)
    }
  }

  public readonly shaded = false

  public maximized: boolean

  public get surface (): IBridgeSurface {
    const { displays, spaces } = this.yabai

    return new YakiteBridgeSurface(
      (displays.find((it) => it.index === this.window.display) as YabaiDisplay).id,
      (spaces.find((it) => it.index === this.window.space) as YabaiSpace).id
      ,
      this.config,
      this.yabai
    )
  }

  public set surface (surface: YakiteBridgeSurface) {
    // TODO: setting activity?
    // TODO: setting screen = move to the screen
    if (this.window.space !== surface.space.index) {
      this.window.space = surface.space.index
    }
  }

  public static generateID (window: YabaiWindow): string {
    return `${window.app}-${window.id}`
  }

  public async commit (
    geometry?: Rect,
    _noBorder?: boolean,
    keepAbove?: boolean
  ): Promise<void> {
    // const ID = YakiteBridgeWindow.generateID(this.window)
    // console.log(this.yabai.cachedFrame[ID])
    // if (this.yabai.cachedFrame[ID]?.moveing) {
    //   return
    // }

    // if (this.yabai.cachedFrame[ID]?.resizeing) {
    //   return
    // }

    if (keepAbove) {
      await this.yabai.above(this.window.id)
    } else if (keepAbove === false) {
      await this.yabai.normal(this.window.id)
    }

    if (geometry !== undefined) {
      const frame = this.adjustGeometry(geometry).toFrame()
      const { x, y, w, h } = frame
      await this.yabai.move({ x, y }, this.id)
      await this.yabai.resize({ w, h }, this.id)
    }
  }

  public toString (): string {
    // Using a shorthand name to keep debug message tidy
    return `Win(${this.window.id.toString()}.${
      this.window.app + this.window.title
    })`
  }

  public visibleOn (surface: IBridgeSurface): boolean {
    const yakiteSurface = surface as YakiteBridgeSurface

    return (
      !this.minimized &&
      (this.window.space === yakiteSurface.space.index || this.window['is-sticky']) && /* on all desktop */
      this.window.display === yakiteSurface.display.index
    )
  }

  /**
   * Apply various resize hints to the given geometry
   * @param geometry
   * @returns
   */
  private adjustGeometry (geometry: Rect): Rect {
    let width = geometry.width
    let height = geometry.height

    /* do not resize fixed-size windows */
    if (!this.window['can-resize']) {
      width = this.window.frame.w
      height = this.window.frame.h
    }

    return new Rect(geometry.x, geometry.y, width, height)
  }

  public get isDialog (): boolean {
    // TODO
    return this.window.subrole === 'AXDialog'
  }
}
