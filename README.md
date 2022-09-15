# matter-lint

<p align="left">
  <a><img src="https://img.shields.io/github/license/Abyssers/matter-lint"></a>
  <a><img src="https://img.shields.io/github/workflow/status/Abyssers/matter-lint/publishment"></a>
  <a><img src="https://img.shields.io/github/issues/Abyssers/matter-lint"></a>
  <a><img src="https://img.shields.io/github/forks/Abyssers/matter-lint"></a>
  <a><img src="https://img.shields.io/github/stars/Abyssers/matter-lint"></a>
</p>

A front-matter normalizer that depends on the commit history

## Quik Start

Install:

```sh
npm install @abysser/matter-lint
```

## Usage

```sh
npx matter-lint -- <filePath1> <filePath2> ...
```

## Options

### As the Command Args

Specify a configuration file (It must be a JSON file, default: .matterlint.json):

```sh
npx matter-lint -c xxx.json -- <filePath1> <filePath2> ...
```

Specify the number of blank lines between front-matter and content:

```sh
npx matter-lint -bl <number> -- <filePath1> <filePath2> ...
```

Forced to cover:

```sh
npx matter-lint -f -- <filePath1> <filePath2> ...
```

Write back:

```sh
npx matter-lint -w -- <filePath1> <filePath2> ...
```

Field Mapping:

```sh
npx matter-lint -m created:date;author:writer;contributors:writers -- <filePath1> <filePath2> ...
```

### From the Configuration File

Default Setting (.matterlint.json):

```json
{
    "blankLines": 1,
    "force": false,
    "write": false,
    "map": {
        "created": "date",
        "author": "writer",
        "contributors": "writers"
    }
}
```

## License

[MIT](./LICENSE)

Copyright 2022 Abyssers