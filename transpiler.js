'use strict';

var fs = require('fs');
var recast = require('recast');

var builders = recast.types.builders;

function Transpiler(config) {
    this._config = config;
}

Transpiler.prototype = {
    transpile: function(file) {
        this._importDeclarations = [];

        var content = fs.readFileSync(file);

        var ast = recast.parse(content);

        recast.visit(ast, {
            visitExportDeclaration: this._visitExportDeclaration.bind(this),
            visitImportDeclaration: this._visitImportDeclaration.bind(this)
        });

        ast = this._wrapModule(ast, file);

        var output = recast.print(ast).code;

        this._importDeclarations.length = 0;

        return output;
    },

    _addAMDWrapper: function(ast, file) {
        var body = ast.program.body;

        var addedModules = {};
        var deps = [];
        var identifiers = [];

        this._importDeclarations.forEach(function(importDeclaration) {
            if (!addedModules[importDeclaration.source]) {
                deps.push(builders.literal(importDeclaration.source));
                identifiers.push(builders.identifier(importDeclaration.moduleIdentifier));

                addedModules[importDeclaration.source] = true;
            }
        });

        debugger;

        var moduleName = file.substring(this._config.root.length + 1);

        ast.program.body = [builders.expressionStatement(builders.callExpression(builders.identifier('define'), [
            builders.literal(moduleName),
            builders.arrayExpression(deps.concat(builders.literal('exports'))),
            builders.functionExpression(null, identifiers.concat(builders.identifier('__exports__')), builders.blockStatement(body))
        ]))];

        return ast;
    },

    _addExportStatement: function(path, key, value) {
        path.insertBefore(builders.expressionStatement(
            builders.assignmentExpression(
                '=',
                builders.memberExpression(
                    builders.identifier('__exports__'),
                    builders.literal(key),
                    true
                ),
                builders.identifier(value)
            )
        ));
    },

    _addModuleVariables: function(ast) {
        var body = ast.program.body;

        this._importDeclarations.forEach(function(importDeclaration) {
            importDeclaration.specifiers.forEach(function(specifier) {
                body.unshift(
                    builders.variableDeclaration('var', [
                        builders.variableDeclarator(
                            builders.identifier(specifier.name),
                                specifier.exportAll ?
                                    (builders.identifier(importDeclaration.moduleIdentifier)) :
                                    (builders.memberExpression(
                                        builders.identifier(importDeclaration.moduleIdentifier),
                                        builders.literal(specifier.id),
                                        true)
                                    )
                                )
                    ])
                );
            });
        });

        return ast;
    },

    _getModuleIdentifier: function(source) {
        source = '$' + source.replace(/[^a-z0-9_$]/g, '$') + '$';

        return source;
    },

    _visitImportDeclaration: function(path) {
        var self = this;

        var moduleSource = path.value.source.value;

        var specifiers = [];

        path.value.specifiers.forEach(function(specifier) {
            var specifierName;
            var specifierId;

            specifierName = specifierId = specifier.id.name;

            if (specifier.name) {
                specifierName = specifier.name.name;
            }

            specifiers.push({
                exportAll: specifier.type === 'ImportNamespaceSpecifier',
                id: specifierId,
                name: specifierName
            });
        });

        this._importDeclarations.push({
            moduleIdentifier: self._getModuleIdentifier(moduleSource),
            source: moduleSource,
            specifiers: specifiers
        });

        return builders.emptyStatement();
    },

    _visitExportDeclaration: function(path) {
        var self = this;

        if (path.value.default) {
            self._addExportStatement(path, 'default', path.value.declaration.name);

        } else {
            path.value.specifiers.forEach(function(specifier) {
                var specifierName;
                var specifierId;

                specifierName = specifierId = specifier.id.name;

                if (specifier.name) {
                    specifierName = specifier.name.name;
                }

                self._addExportStatement(path, specifierName, specifierId);
            });
        }

        return builders.emptyStatement();
    },

    _wrapModule: function(ast, file) {
        ast = this._addModuleVariables(ast);

        ast = this._addAMDWrapper(ast, file);

        return ast;
    }
};

module.exports = Transpiler;