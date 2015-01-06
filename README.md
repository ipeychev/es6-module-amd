ECMAScript6 module to AMD converter
==================

Converts ECMAScript 6 modules to AMD.

Install
==================
```
$ [sudo] npm install -g m2amd
```

Usage
==================

```
$ m2amd -r examples -o out
```

Where "examples" is the directory which will be scanned for files and "out" is the folder, in which the processed files will be stored. Look for more information in the rest of the options:

```
$ m2amd --help

  Usage: m2amd [options] <file ...>

  Options:

    -h, --help                          output usage information
    -r, --root [root folder]            The root folder, from which we should start looking for files. Default: current directory
    -o, --output [output folder]        Output file to store the generated AMD module. Default: current directory
    -e, --extensions [file extensions]  Only files which extensions match these in the list will be processed. Default: "js"
    -V, --version                       output the version number
```

### License
[LGPL License](LICENSE.md)
