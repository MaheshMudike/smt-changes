#!/usr/bin/env node
var fs = require('fs');
var path = require('path');
var compile = require('es6-template-strings/compile');
var resolveToString = require('es6-template-strings/resolve-to-string');

var ROOT_DIR = '.';//process.argv[2];
var FILES = {
    SRC: "src/cordova/config.tpl.xml",
    DEST: "config.xml"
};

var env = process.argv[2] || 'dev';//process.env.NODE_ENV || 'dev';
var envFile = 'src/cordova/cordova.' + env + '.json';

var srcFileFull = path.join(ROOT_DIR, FILES.SRC);
var destFileFull = path.join(ROOT_DIR, FILES.DEST);
var configFileFull = path.join(ROOT_DIR, envFile);

var templateData = fs.readFileSync(srcFileFull, 'utf8');

var configData = fs.readFileSync(configFileFull, 'utf8');
var config = JSON.parse(configData);

var compiled = compile(templateData);
var content = resolveToString(compiled, config);

fs.writeFileSync(destFileFull, content);