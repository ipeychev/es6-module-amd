'use strict';

var fs = require('fs');
var recast = require('recast');

var namedTypes = recast.types.namedTypes;
var builders = recast.types.builders;

var content = fs.readFileSync('test.js');

var ast = recast.parse(content);

function addExportStatement(path, key, value) {
    path.insertBefore(builders.expressionStatement(
        builders.assignmentExpression(
            '=',
            builders.memberExpression(
                builders.identifier('__es6_export__'),
                builders.literal(key),
                true
            ),
            builders.identifier(value)
        )
    ));
}

recast.visit(ast, {
    visitImportDeclaration: function(path) {
        // console.log(path);

        // debugger;

        path.replace(null);

        this.traverse(path);
    },

    visitExportDeclaration: function(path) {
        if (path.value.default) {
            addExportStatement(path, 'default', path.value.declaration.name);

        } else {
            path.value.specifiers.forEach(function(specifier) {
                var specifierName;
                var specifierId;

                specifierName = specifierId = specifier.id.name;

                if (specifier.name) {
                    specifierName = specifier.name.name;
                }

                addExportStatement(path, specifierName, specifierId);
            });
        }

        path.replace(builders.emptyStatement());

        this.traverse(path);
    }
});

var output = recast.print(ast).code;

console.log(output);