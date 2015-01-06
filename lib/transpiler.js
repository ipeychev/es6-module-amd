'use strict';

var fs = require('fs');
var recast = require('recast');

var builders = recast.types.builders;

/**
 * Creates an instance of Transpiler class.
 *
 * @constructor
 * @param {object} - Configuration object. May contain the following properties:
 *     - "root" - specifies the root folder, which should be scanned for files.
 */
function Transpiler(config) {
    this._config = config;
}

Transpiler.prototype = {
    constructor: Transpiler,

    /**
     * Transpiles a file and converts an ES6 module to AMD.
     *
     * @param {string} file The file which should be transpiled.
     * @return {string} The converted to AMD content of the file.
     */
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

    /**
     * Adds an AMD wrapper around the provided AST.
     *
     * @protected
     * @param {object} ast The AST which should be wrapped.
     * @param {string} file The full path to the file from which module name should be generated.
     * @return {object} The wrapped AST.
     */
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

        var moduleName = file.substring(this._config.root.length + 1);

        ast.program.body = [builders.expressionStatement(builders.callExpression(builders.identifier('define'), [
            builders.literal(moduleName),
            builders.arrayExpression(deps.concat(builders.literal('exports'))),
            builders.functionExpression(null, identifiers.concat(builders.identifier('__exports__')), builders.blockStatement(body))
        ]))];

        return ast;
    },

    /**
     * Adds an export statement before an recast path.
     *
     * @protected
     * @param {object} path The recast path which should be modified.
     * @param {string} key The variable, which will be exported from the module.
     * @param {value} key The implementation of the exported variable.
     */
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

    /**
     * Declares a variable for each used dependency value.
     *
     * @protected
     * @param {object} ast The AST which should be modified.
     * @return {object} The modified AST.
     */
    _addModuleVariables: function(ast) {
        var body = ast.program.body;

        // Loop over each import declaration
        this._importDeclarations.reverse().forEach(function(importDeclaration) {
            // Loop over all specifiers in this import declaration
            importDeclaration.specifiers.reverse().forEach(function(specifier) {
                // Add in the beginning of the file an variable declaration.
                body.unshift(
                    builders.variableDeclaration('var', [
                        builders.variableDeclarator(
                            // The name of the variable will be name of the specifier
                            builders.identifier(specifier.name),
                                // If the import was specified like:
                                // import * as foo from 'bar'
                                // then assign as value to the variable the dependency value
                                specifier.exportAll ?
                                    (builders.identifier(importDeclaration.moduleIdentifier)) :
                                    // Otherwise, assign as value the exported value from the dependency.
                                    (builders.memberExpression(
                                        builders.identifier(importDeclaration.moduleIdentifier),
                                        builders.literal(specifier.id),
                                        // Get the exported value as computed, not using dot notation.
                                        true)
                                    )
                                )
                    ])
                );
            });
        });

        return ast;
    },

    /**
     * Returns a module identifier from source name (file, URI).
     *
     * @protected
     * @param {string} source The source name, from which module identifier should be returned.
     * @return {string} The generated module identifier.
     */
    _getModuleIdentifier: function(source) {
        // Use simple replace, basically replace everything which is not Latin character, underscore
        // or number, with dollar sign.
        source = '$' + source.replace(/[^a-z0-9_$]/g, '$') + '$';

        return source;
    },

    /**
     * Visits an import declaration.
     *
     * @protected
     * @param {object} path The recast path (node) of the import declaration.
     * @return {object} Returns empty statement, the import declaration will be deleted.
     */
    _visitImportDeclaration: function(path) {
        var self = this;

        var moduleSource = path.value.source.value;

        var specifiers = [];

        // For each specifier, collect its id, name and put them in an array.
        path.value.specifiers.forEach(function(specifier) {
            var specifierName;
            var specifierId;

            specifierName = specifierId = specifier.id.name;

            if (specifier.name) {
                specifierName = specifier.name.name;
            }

            specifiers.push({
                // ImportNamespaceSpecifier is in case like:
                // import * as foo from 'bar'
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

    /**
     * Visits an export declaration.
     *
     * @protected
     * @param {object} path The recast path (node) of the export declaration.
     * @return {object} Returns empty statement, the export declaration will be deleted.
     */
    _visitExportDeclaration: function(path) {
        var self = this;

        // Handles case as:
        // export default c;
        if (path.value.default) {
            self._addExportStatement(path, 'default', path.value.declaration.name);

        } else {
            // Handles case as:
            // export { e, f as z };
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

    /**
     * Wraps the module with variables and AMD wrapper (define) function.
     *
     * @protected
     * @param {object} ast The AST which should be wrapped.
     * @param {string} file The name of the file which have to be converted to AMD.
     * @return {object} Returns the wrapped AST.
     */
    _wrapModule: function(ast, file) {
        ast = this._addModuleVariables(ast);

        ast = this._addAMDWrapper(ast, file);

        return ast;
    }
};

module.exports = Transpiler;