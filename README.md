ECMAScript6 module to AMD converter
==================

Converts ECMAScript 6 modules to AMD.


Install
==================
```
$ [sudo] npm install -g es6m2amd
```


Usage
==================

```
$ m2amd -o out examples
```

Where "examples" is the directory which will be scanned for files and "out" is the folder, in which the processed files will be stored.

You can include only some of the files in a directory by specifying file pattern via "-i" option, like this:

```
$ m2amd -o out -i "**/module.js" examples
```

In this case only file, called "module.js" in whatever sub-directory of "examples" folder will be processed.

Look for more information in the rest of the options:

```
$ m2amd --help

  Usage: m2amd [options] <folder ...>

  Options:

    -h, --help                     output usage information
    -o, --output [output folder]   output folder to store the generated AMD module. Default: current directory
    -i, --include [file patterns]  file patterns to process. Default: "**/*.js"
    -V, --version                  output the version number
```

### License
[LGPL License](LICENSE.md)

[![Build Status](https://travis-ci.org/ipeychev/es6-module-amd.svg)](https://travis-ci.org/ipeychev/es6-module-amd)