# text-fs
Convert file system to text files and back

Implemented:
* filesystem -> json
* json -> filesystem
* directories
* files
* symlinks

Todo:
* permissions and ownership

## Use cases
* store/backup file structures in password managers :)
* send file structures as chat messages
* prob more stuff I can't think of right now

## How to use

```
╰─>$ fs2json --help
fs2json <input>

Convert folders/files -> json repr

Options:
  --version      Show version number                                   [boolean]
  --verbose, -v  print more stuff                     [boolean] [default: false]
  --help         Show help                                             [boolean]

Examples:
  fs2json /home/someone/somedir  Converts /home/someone/somedir to json
                                 recursively
```

```
╰─>$ json2fs --help
json2fs <output>

Convert json from stdin to fs

Options:
  --version      Show version number                                   [boolean]
  --verbose, -v  print more stuff                     [boolean] [default: false]
  --input, -i    Get input from file instead of stdin                   [string]
  --help         Show help                                             [boolean]

Examples:
  json2fs outputdir               Converts json from stdin to fs @ outputdir
  json2fs -i inputfile outputdir  Converts json from inputfile to fs @ outputdir
```


