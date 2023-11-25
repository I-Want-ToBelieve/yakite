import { getPackages } from '@manypkg/get-packages'
import { $ } from 'execa'

export type ILanguage = 'objective-c' | 'rust'
export interface IPackageJson {
  changesetsExtra: {
    language: ILanguage
    sources: string[]
    versionUpdatePolicy: 'source-code-replacement' | 'auto'
    prevVersion?: string
  }
}

const { packages } = await getPackages(process.cwd())

packages
  .filter(it =>
    ['yakite', 'yakite-toast'].includes(
      (
        it.packageJson as typeof it.packageJson &
        IPackageJson
      ).name
    )
  )
  .forEach(it => {
    const { version, name } =
      it.packageJson as typeof it.packageJson & IPackageJson

    ;(async () => {
      await $`git push origin --delete ${name}@${version}`
      await $`git push origin ${name}@${version}`
    })().catch(e => {
      console.error(e)
    })
  })
