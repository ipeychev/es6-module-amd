'use strict';

var fs = require('fs');
var path = require('path');
var program = require('commander');
var Transpiler = require('./transpiler');
var walk = require('walk');

module.exports = function() {
    function list(value) {
        return value.split(',').map(String);
    }

    var curDir = process.cwd();

    program
        .usage('[options] <file ...>', list)
        .option('-r, --root [root folder]', 'The root folder, from which we should start looking for files. Default: current directory', String, curDir)
        .option('-o, --output [output folder]', 'Output file to store the generated AMD module. Default: current directory', String, curDir)
        .option('-e, --extensions [file extensions]', 'Only files which extensions match these in the list will be processed. Default: "js"', list, ['js'])
        .version('0.0.1')
        .parse(process.argv);

    program.root = path.resolve(program.root);
    program.output = path.resolve(program.output);

    var transpiler = new Transpiler({
        root: program.root
    });

    var options = {
        followLinks: false
    };

    function onWalkerFile(root, fileStats, next) {
        var file = path.join(root, fileStats.name);

        var fileExt = file.substr(file.lastIndexOf('.') + 1);

        if (program.extensions.indexOf(fileExt.toLowerCase()) >= 0) {
            var outputFile = path.join(program.output, file.substring(program.root.length + 1));

            var outputDirName = path.dirname(outputFile);

            if (!fs.existsSync(outputDirName)) {
                fs.mkdirSync(outputDirName);
            }

            var output = transpiler.transpile(file);

            fs.writeFile(outputFile, output, 'utf8', function(error) {
                if (error) {
                    console.error(error);
                }

                next();
            });
        }
        else {
            next();
        }
    }

    var walker = walk.walk(program.root, options);

    walker.on('file', onWalkerFile);
};