import { type IBridgeSurface, type Config } from 'krohnkite-core'
import { Rect } from 'krohnkite-core'
import type Yabai from 'yakite-yabai'
import { type YabaiSpace, type YabaiDisplay } from 'yakite-yabai'

export class YakiteBridgeSurface implements IBridgeSurface {
  public readonly ignore: boolean
  public readonly workingArea: Rect
  public readonly id: string

  constructor (
    public readonly displayId: YabaiDisplay['id'],
    public readonly spaceId: YabaiSpace['id'],
    private readonly config: Config,
    private readonly yabai: Yabai
  ) {
    this.id = this.generateId()

    this.ignore = this.config.ignore.screen.includes(this.display.index)

    this.workingArea = Rect.fromFrame(
      this.display.frame
    )
  }

  private savedDisplay: YabaiDisplay | null = null
  private savedSpace: YabaiSpace | null = null

  public get display (): YabaiDisplay {
    const display = this.yabai.displays.find((it) => it.id === this.displayId)

    if (display) {
      this.savedDisplay = display
    }

    return this.savedDisplay as YabaiDisplay
  }

  public get space (): YabaiSpace {
    const space = this.yabai.spaces.find((it) => +it.id === +this.spaceId)

    if (space) {
      this.savedSpace = space
    }

    return this.savedSpace as YabaiSpace
  }

  public next (): IBridgeSurface | null {
    const { currentDisplay, spaces } = this.yabai
    const currentDisplaySpaces = spaces.filter((it) => it.display === currentDisplay.index)
    // This is the last virtual desktop

    const next = currentDisplaySpaces.find((it) => it.index === this.space.index + 1)
    if (!next) {
      return null
    }

    return new YakiteBridgeSurface(
      this.display.id,
      next.id,
      this.config,
      this.yabai
    )
  }

  private generateId (): string {
    return `${this.displayId}-${this.spaceId}`
  }

  public toString (): string {
    return `YakiteBridgeSurface(${this.display.index}, ${this.space.index})`
  }
}
