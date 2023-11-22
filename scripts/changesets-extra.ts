import { getPackages } from '@manypkg/get-packages'
import path from 'node:path'
import fs from 'node:fs/promises'
import parseJson from 'parse-json'
import toml from '@iarna/toml'
import * as prettier from 'prettier'

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

// console.dir(
//   { packages },
//   {
//     depth: Number.POSITIVE_INFINITY,
//     colors: true
//   }
// )

packages
  .filter(
    it =>
      'changesetsExtra' in
      (it.packageJson as typeof it.packageJson &
      IPackageJson)
  )
  .forEach(it => {
    const { changesetsExtra, version } =
      it.packageJson as typeof it.packageJson & IPackageJson

    const {
      language,
      sources,
      versionUpdatePolicy,
      prevVersion
    } = changesetsExtra
    const { dir } = it

    switch (language) {
      case 'rust':
        if (versionUpdatePolicy === 'auto') {
          ;(async () => {
            const cargoPath = path.join(dir, 'Cargo.toml')

            const cargoToml = toml.parse(String(await fs.readFile(cargoPath))) as any

            cargoToml.package.version = version

            await fs.writeFile(cargoPath, toml.stringify(cargoToml))
          })().catch((e) => {
            console.error(e)
          })
        }
        break
      case 'objective-c':
        if (
          versionUpdatePolicy === 'source-code-replacement'
        ) {
          if (!prevVersion) {
            throw new Error(
              `Not found prevVersion field in ${dir}/package.json changesetsExtra prop`
            )
          }

          sources
            .map(it => path.join(dir, it))
            .forEach(it => {
              ;(async () => {
                const source = await fs.readFile(it)
                await fs.writeFile(
                  it,
                  String(source).replaceAll(
                    prevVersion,
                    version
                  )
                )

                const packageJsonPath = path.join(
                  dir,
                  'package.json'
                )
                const packageJson = parseJson(
                  (
                    await fs.readFile(packageJsonPath)
                  ).toString()
                ) as any
                packageJson.changesetsExtra.prevVersion =
                  version
                await fs.writeFile(
                  packageJsonPath,
                  await prettier.format(JSON.stringify(packageJson), { parser: 'json' })
                )
              })().catch(e => {
                console.error(e)
              })
            })
        }
        break
      default:
        break
    }
  })
