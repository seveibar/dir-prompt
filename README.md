# `dir-prompt`

Converts directory to prompt, ignoring files that aren't important.

`dir-prompt` creates a representation of a file directory as a string prompt, excluding files that are common to ignore (such as `package-lock.json` and `yarn.lock`) or specified in `.gitignore` and `.promptignore`. This utility is helpful for quickly obtaining a textual outlook of a given directory, with control over what to include and exclude from the output.

Files to be ignored are read from a `.gitignore` and `promptignore` file in the same directory as where the command is run. The project provides flexibility with multiple output formats including console display, output to a file, or copying to clipboard.

## Installation

```shell
npm install -g dir-prompt
```

## Usage

1. Command line usage:

```shell
dir-prompt [options]
```

Where `[options]` include:

- `-w`: Write prompt to a file, `PROMPT.md`.
- `-s`: Print prompt to the console.
- `-c`: Copy the prompt to the clipboard.
- `-a`: Analyze total characters and tokens in the output.

2. To exclude files or directories, add them to a `.gitignore` or `.promptignore` file in your project root, the utility will automatically exclude files matching patterns in those.