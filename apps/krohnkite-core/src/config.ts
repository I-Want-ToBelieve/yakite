// SPDX-FileCopyrightText: 2018-2019 Eon S. Jeon <esjeon@hyunmu.am>
// SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@gikari.com>
//
// SPDX-License-Identifier: MIT

export interface Config {
  experimentalBackend: boolean

  // #region Layout
  layoutOrder: string[]
  monocleMaximize: boolean
  maximizeSoleTile: boolean
  monocleMinimizeRest: boolean // KWin-specific
  untileByDragging: boolean
  // #endregion

  // #region Features
  keepFloatAbove: boolean
  noTileBorder: boolean
  limitTileWidthRatio: number
  // #endregion

  // #region Gap
  gaps: {
    screen: {
      top: number
      left: number
      right: number
      bottom: number
    }
    tileLayout: number
  }
  // #endregion

  // #region Behavior
  newWindowAsMaster: boolean
  // #endregion

  ignore: {
    class: string[]
    title: string[]
    screen: number[]
    role: string[]
  }

  floating: {
    class: string[]
    title: string[]
  }
  // #endregion
}

export const DEFAULT_CONFIG: Readonly<Config> = {
  experimentalBackend: false,

  layoutOrder: ['TileLayout', 'MonocleLayout', 'ThreeColumnLayout', 'SpreadLayout', 'StairLayout', 'SpiralLayout', 'QuarterLayout', 'FloatingLayout', 'CascadeLayout'],
  monocleMaximize: false,
  maximizeSoleTile: false,
  monocleMinimizeRest: false,
  untileByDragging: false,

  keepFloatAbove: false,
  noTileBorder: false,
  limitTileWidthRatio: 0,
  newWindowAsMaster: true,
  gaps: {
    screen: {
      top: 40,
      left: 20,
      right: 20,
      bottom: 100
    },
    tileLayout: 20
  },
  ignore: {
    class: [],
    title: [],
    screen: [],
    role: []
  },
  floating: {
    class: [],
    title: []
  }
}
