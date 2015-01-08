'use strict';

var assert = require('assert');
var fs = require('fs');
var path = require('path');
var Transpiler = require('../lib/transpiler.js');

describe('Transpiler', function () {
    it('should create an instance of Transpiler', function () {
        var transpiler = new Transpiler();

        assert.ok(transpiler.transpile);
    });

    it('should load a module with imports', function () {
        var transpiler = new Transpiler();

        var output = transpiler.transpile(path.resolve('test/fixture'), path.resolve('test/fixture/import.js'));

        var expected = fs.readFileSync('test/expected/import.js', 'utf8');

        assert.strictEqual(expected, output);
    });

    it('should load a module with exports', function () {
        var transpiler = new Transpiler();

        var output = transpiler.transpile(path.resolve('test/fixture'), path.resolve('test/fixture/export.js'));

        var expected = fs.readFileSync('test/expected/export.js', 'utf8');

        assert.strictEqual(expected, output);
    });

    it('should load a module with both imports and exports', function () {
        var transpiler = new Transpiler();

        var output = transpiler.transpile(path.resolve('test/fixture'), path.resolve('test/fixture/import-export.js'));

        var expected = fs.readFileSync('test/expected/import-export.js', 'utf8');

        assert.strictEqual(expected, output);
    });
});