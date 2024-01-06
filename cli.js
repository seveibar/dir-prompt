#!/usr/bin/env node

import { getVirtualFileSystemFromDirPath } from "make-vfs"
import * as fs from "fs/promises"
import ignore from "ignore"
import minimist from "minimist"
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

if (args.c) {
  ncp.copy(prompt_string)
}

if (!args.s || args.a) {
  console.log(`\nTotal characters: ${prompt_string.length}`)
  const tokens = encode(prompt_string)
  console.log(`Total tokens: ${tokens.length}`)
}