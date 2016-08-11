# transifex-loader
A loader, that fetches the content of string files from transifex. Requires
configuration via `.transifexrc` and `.tx/config` in the same format as the
official `tx` tool.

## Query options

### `store`
You can disable writing the result from transifex to the original file by setting
this to `false`.
