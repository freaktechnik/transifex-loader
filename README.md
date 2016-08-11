# transifex-loader
A loader, that fetches the content of string files from transifex. Requires
configuration via `.transifexrc` and `.tx/config` in the same format as the
official `tx` tool. The configuration files are searched from the directory
the loaded file is in up to the system root.

## Query options

### `store`
You can disable writing the result from transifex to the original file by setting
this to `false`.
