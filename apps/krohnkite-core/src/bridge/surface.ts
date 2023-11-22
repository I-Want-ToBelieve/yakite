// SPDX-FileCopyrightText: 2018-2019 Eon S. Jeon <esjeon@hyunmu.am>
// SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@gikari.com>
//
// SPDX-License-Identifier: MIT

import { type Rect } from '@/utils/rect'

/**
 * Surface provided by KWin. Surface is essentially a screen space, but
 * it can represent a surface, that is not currently displayed, e.g. a
 * virtual desktop.
 */
export interface IBridgeSurface {
  /**
   * Surface unique id
   */
  readonly id: string | number

  /**
   * Should the surface be completely ignored by the script.
   */
  readonly ignore: boolean

  /**
   * The area in which windows are placed.
   */
  readonly workingArea: Readonly<Rect>

  /**
   * The next surface. The next surface is a virtual desktop, that comes after current one.
   */
  next: () => IBridgeSurface | null
}
