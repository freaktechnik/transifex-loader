# transifex-loader

[![Greenkeeper badge](https://badges.greenkeeper.io/freaktechnik/transifex-loader.svg)](https://greenkeeper.io/)
[![Build Status](https://travis-ci.org/freaktechnik/transifex-loader.svg?branch=master)](https://travis-ci.org/freaktechnik/transifex-loader) [![codecov](https://codecov.io/gh/freaktechnik/transifex-loader/branch/master/graph/badge.svg)](https://codecov.io/gh/freaktechnik/transifex-loader)
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Ffreaktechnik%2Ftransifex-loader.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2Ffreaktechnik%2Ftransifex-loader?ref=badge_shield)

A loader, that fetches the content of string files from Transifex. Requires
configuration via `.transifexrc` and `.tx/config` in the same format as the
official `tx` tool. The configuration files are searched from the directory
the loaded file is in up to the system root.

## Installation
```bash
npm install --save-dev transifex-loader
```

## Usage
Add the loader before any other action in your webpack configuration for all your
resources that are translated on Transifex. You can of course also use it in a
require statement directly. The loader works as a kind of pre-processor for
translations.

If the translation can be found on Transifex, it is downloaded and
returned. If an error occurs (i.e. no internet connection) the local file is
returned. When the remote translations are successfully loaded the loader by
default writes the updated version to disk, replacing your local file. This can
be disabled with the `store` option.

To match your local resources with the Transifex translations the loader uses
the same configuration as the `tx` command line tool, specifically `.transifexrc`
for credentials and `.tx/config` for resource informations.

## Options

### `store`
You can disable writing the result from Transifex to the original file by setting
this to `false`.

### `disableCache`
Disables reading the resource that is in the source language from the local file
system and fetches it from Transifex, too.

## Known incompatibilities (to tx)

 - Requires the project to be on transifex.com but does not complain about it.
 - Ignores `minimum_perc`.


## License
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Ffreaktechnik%2Ftransifex-loader.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2Ffreaktechnik%2Ftransifex-loader?ref=badge_large)