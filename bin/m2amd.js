#!/usr/bin/env node

var path = require('path');
var m2amd = require(path.join('../lib'));
var pkg = require('../package.json');
var updateNotifier = require('update-notifier');

updateNotifier({
	packageName: pkg.name,
	packageVersion: pkg.version
}).notify();

m2amd();