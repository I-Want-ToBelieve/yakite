import { DEFAULT_CONFIG, type Config } from 'krohnkite-core'
import Conf from 'conf'

export interface YakiteConfig extends Config {
  yakite: {
    toast: {
      enable: boolean
      duration: number
      /*     Top left: x = 0, y = 0
      Top center: x = 0.5, y = 0
      Top right: x = 1, y = 0
      Middle left: x = 0, y = 0.5
      Center: x = 0.5, y = 0.5
      Middle right: x = 1, y = 0.5
      Bottom left: x = 0, y = 1
      Bottom center: x = 0.5, y = 1
      Bottom right: x = 1, y = 1 */
      coordinates: {
        x: number
        y: number
      }
    }
    autoforce: boolean
  }
}

export const YAKITE_DEFAULT_CONFIG = {
  ...DEFAULT_CONFIG,
  yakite: {
    toast: {
      enable: true,
      duration: 1.5,
      coordinates: {
        x: 0.5,
        y: 0.5
      }
    },
    autoforce: true
  }
}

const conf = new Conf<YakiteConfig>({
  projectName: 'yakite',
  projectVersion: '1.0.0',
  configName: 'yakite',
  projectSuffix: '',
  cwd: `${process.env.HOME}/.config/yakite`,
  defaults: YAKITE_DEFAULT_CONFIG
})

const config = conf.store

export default config
