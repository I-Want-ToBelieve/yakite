// SPDX-FileCopyrightText: 2018-2019 Eon S. Jeon <esjeon@hyunmu.am>
// SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@gikari.com>
//
// SPDX-License-Identifier: MIT

export interface Frame {
  x: number
  y: number
  w: number
  h: number
}

export class Rect {
  constructor (
    public x: number,
    public y: number,
    public width: number,
    public height: number
  ) {}

  public static fromFrame (value: Frame, mapfn?: <T>(v: T) => Frame): Rect {
    const frame = mapfn ? mapfn(value) : value
    return new Rect(frame.x, frame.y, frame.w, frame.h)
  }

  public get maxX (): number {
    return this.x + this.width
  }

  public get maxY (): number {
    return this.y + this.height
  }

  public get center (): [number, number] {
    return [
      this.x + Math.floor(this.width / 2),
      this.y + Math.floor(this.height / 2)
    ]
  }

  public clone (): Rect {
    return new Rect(this.x, this.y, this.width, this.height)
  }

  public equals (other: Rect): boolean {
    return (
      this.x === other.x &&
      this.y === other.y &&
      this.width === other.width &&
      this.height === other.height
    )
  }

  public gap (left: number, right: number, top: number, bottom: number): Rect {
    return new Rect(
      this.x + left,
      this.y + top,
      this.width - (left + right),
      this.height - (top + bottom)
    )
  }

  public gap_mut (
    left: number,
    right: number,
    top: number,
    bottom: number
  ): this {
    this.x += left
    this.y += top
    this.width -= left + right
    this.height -= top + bottom
    return this
  }

  public includes (other: Rect): boolean {
    return (
      this.x <= other.x &&
      this.y <= other.y &&
      other.maxX < this.maxX &&
      other.maxY < this.maxY
    )
  }

  public includesPoint ([x, y]: [number, number]): boolean {
    return this.x <= x && x <= this.maxX && this.y <= y && y <= this.maxY
  }

  public subtract (other: Rect): Rect {
    return new Rect(
      this.x - other.x,
      this.y - other.y,
      this.width - other.width,
      this.height - other.height
    )
  }

  public toFrame (): Frame {
    const { x, y, width: w, height: h } = this

    return { x, y, w, h }
  }

  public distance (w1: Rect, w2: Rect): number {
    return Math.sqrt(Math.pow(w1.x - w2.x, 2) + Math.pow(w1.y - w2.y, 2))
  }

  public overlapArea (w1: Rect, w2: Rect): number {
    const overlapX = Math.max(0, Math.min(w1.x + w1.width, w2.x + w2.width) - Math.max(w1.x, w2.x))
    const overlapY = Math.max(0, Math.min(w1.y + w1.height, w2.y + w2.height) - Math.max(w1.y, w2.y))
    return overlapX * overlapY
  }

  public isOverlapped (w1: Rect, w2: Rect): boolean {
    return (w1.x <= w2.x && w2.x <= w1.x + w1.width && w1.y <= w2.y && w2.y <= w1.y + w1.height) ||
           (w2.x <= w1.x && w1.x <= w2.x + w2.width && w2.y <= w1.y && w1.y <= w2.y + w2.height)
  }

  public getOverlapFilter (draggedWindow: Rect): (window: Rect) => boolean {
    return (window: Rect) => this.isOverlapped(window, draggedWindow)
  }

  public getOverlapSorter (draggedWindow: Rect): (a: Rect, b: Rect) => number {
    return (a: Rect, b: Rect) => {
      const areaA = this.overlapArea(a, draggedWindow)
      const areaB = this.overlapArea(b, draggedWindow)

      return areaB - areaA
    }
  }

  public toString (): string {
    return 'Rect(' + [this.x, this.y, this.width, this.height].join(', ') + ')'
  }
}

/**
 * Describes geometric changes of a rectangle, in terms of changes per edge.
 * Outward changes are in positive, and inward changes are in negative.
 */
export class RectDelta {
  /** Generate a delta that transforms basis to target. */
  public static fromRects (basis: Rect, target: Rect): RectDelta {
    const diff = target.subtract(basis)
    return new RectDelta(
      diff.width + diff.x,
      -diff.x,
      diff.height + diff.y,
      -diff.y
    )
  }

  constructor (
    public readonly east: number,
    public readonly west: number,
    public readonly south: number,
    public readonly north: number
  ) {}

  public toString (): string {
    return `WindowResizeDelta(east=${this.east} west=${this.west} north=${this.north} south=${this.south}}`
  }
}
