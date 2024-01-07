#!/usr/bin/env node

import { getVirtualFileSystemFromDirPath } from "make-vfs"
import * as fs from "fs/promises"
import ignore from "ignore"
import minimist from "minimist"
import * as Glob from "glob"
import ncp from "copy-paste"
import { encode } from "gpt-tokenizer"

const args = minimist(process.argv.slice(2))

const commonignore = ["package-lock.json", "yarn.lock"]

const gitignore = await fs
  .readFile("./.gitignore")
  .then((b) => b.toString().split("\n").filter(Boolean))
  .catch((e) => [])

const promptignore = await fs
  .readFile("./.promptignore")
  .then((b) => b.toString().split("\n").filter(Boolean))
  .catch((e) => [])

const ig = ignore().add([...commonignore, ...gitignore, ...promptignore])

if (args["list-files"]) {
  const glob = Glob.globSync("**/*", {}).filter((fp) => !ig.ignores(fp))
  console.log(glob.join("\n"))
  process.exit(0)
}

const vfs = await getVirtualFileSystemFromDirPath({
  dirPath: process.cwd(),
  contentFormat: "string",
  fileMatchFn: (fp) => {
    return !ig.ignores(fp)
  },
})

const prompt_string = Object.entries(vfs)
  .map(([fp, content]) => `### ${fp} ###\n${content}`)
  .join("\n\n")

if (args.w) {
  await fs.writeFile("PROMPT.md", prompt_string)
}

if (args.s) {
  console.log(prompt_string)
}

if (!args.s || args.a) {
  if (args.a) {
    // What files were the largest?
    console.table(
      Object.entries(vfs).map(([fp, content]) => ({
        file: fp,
        tokens: encode(content).length,
      }))
    )
  }

  console.log(`\nTotal characters: ${prompt_string.length}`)
  const tokens = encode(prompt_string)
  console.log(`Total tokens: ${tokens.length}`)
}

if (args.c) {
  ncp.copy(prompt_string, () => {
    console.log("\nCopied prompt to clipboard")
    process.exit(0)
  })
}