#!/usr/bin/env node

var path = require('path'),
    pkg = require(path.join(__dirname, '../package.json')),
    program = require('commander'),
    cmdValue;

program
    .version(pkg.version)
    .usage('[options] <command>')
    .command('configure', 'install one or more packages')
    .command('list', 'list playlists', { isDefault: true })
    .parse(process.argv)
    ;
