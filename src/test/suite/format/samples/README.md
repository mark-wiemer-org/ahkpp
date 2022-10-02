## Formatting samples

All files should be saved with `LF` (just a newline / `\n`), not `CRLF` (carriage return newline / `\r\n`). `LF` is easier to test and save consistently in git, even if Windows technically uses `CRLF`. Internal formatter tests will convert the end of line sequence to `LF`, where external formatter tests will preserve the end of line sequence.
