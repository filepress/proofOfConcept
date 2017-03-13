#!/usr/bin/env node

/*
	Currently only to display how the commandline could look.
 */

/*
Commands
- new [layout] <title>	// Create a new markdown file.
- publish <title>		// Move an article fromdraft to published.
- serve	[options]		// in browser previewn [drafts]
 */

const cli = require('commander')
const packageInfo = require('./../package.json')

cli
	.version(packageInfo.version)
	.usage('[cmd] [options]')
	.description('Manage your markdown based blog or website.')
	.command('init [folder]', 'initialize a new blog/website.')
	.command('new [design] <title>', 'Create a new markdown file.')
	.command('serve [options]', 'Open generated website in default browser.')
	.parse(process.argv)
