'use strict';

var assert = require('assert');
var Transpiler = require('../lib/transpiler.js');

describe('Transpiler', function () {
    it('should create an instance of Transpiler', function () {
        var transpiler = new Transpiler();

        assert.ok(transpiler.transpile);
    });
});