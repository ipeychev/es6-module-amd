'use strict';

var fs = require('fs');
var minimatch = require('minimatch');
var mkdirp = require('mkdirp');
var path = require('path');
var pkg = require('../package.json');
var program = require('commander');
var Transpiler = require('./transpiler');
var walk = require('walk');

module.exports = function() {
    function list(value) {
        return value.split(',').map(String);
    }

    var curDir = process.cwd();

    program
        .usage('[options] <folder ...>', list)
        .option('-o, --output [output folder]', 'output folder to store the generated AMD module. Default: current directory', String, curDir)
        .option('-i, --include [file patterns]', 'file patterns to process. Default: "**/*.js"', String, '**/*.js')
        .option('-m, --map [source map]', 'Generate source map.')
        .version(pkg.version)
        .parse(process.argv);

    program.output = path.resolve(program.output);

    var transpiler = new Transpiler();

    function onWalkerFile(root, filePath, fileStats, next) {
        var file = path.join(filePath, fileStats.name);

        if (minimatch(file, program.include)) {
            var outputFile = path.join(program.output, file.substring(root.length + 1));

            var outputDirName = path.dirname(outputFile);

            if (!fs.existsSync(outputDirName)) {
                mkdirp.sync(outputDirName);
            }

            var result = transpiler.transpile(root, file);

            var fileName = path.basename(outputFile);

            var code = result.code;

            if (program.map) {
                code += '\n//# sourceMappingURL=' + fileName + '.map';

                fs.writeFile(outputFile + '.map', JSON.stringify(result.map), 'utf8', function(error) {
                    if (error) {
                        console.error(error);
                    }
                });
            }

            fs.writeFile(outputFile, code, 'utf8', function(error) {
                if (error) {
                    console.error(error);
                }

                next();
            });
        } else {
            next();
        }
    }

    var options = {
        followLinks: false
    };

    program.args.forEach(function(item) {
        if (fs.statSync(item).isDirectory()) {
            var root = path.resolve(item);

            var walker = walk.walk(root, options);

            walker.on('file', onWalkerFile.bind(this, root));

        } else {
            console.warn('Warning: only folders are accepted for processing. ' +
                'If you want to process single file, specify it via -i option. ' +
                'Run the program with --help option for more information.');
        }
    });

};