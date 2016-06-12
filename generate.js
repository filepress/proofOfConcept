/*
    Generate static HTML pages from markdwon.
 */

/**
 *   @typedef {Object} mdInfos
 *
 */

const start = Date.now()

const path = require('path')
const fs = require('fs')
const Stream = require('stream')
const _ = require('highland')
const YAML = require('yamljs');

//Get all the md files.
let sourceFolder = path.join(__dirname, 'source')
walk(sourceFolder, /\.md$/, function(err, files) {
	_(files)
	.map(filePath => ({filePath}))
	.flatMap(addConfig)
	.map(parseFrontmatter)
	.collect()
	.toCallback((err, result) => {
		console.log('result\n', YAML.stringify(result, 3));
		logTime()
	})

})

function logTime() {
	const end = Date.now()
	let dur = (end - start) / 1000
	console.log('Time needed: ', dur);
}

/**
 *   Parses the given frontmatter of a markdown file.
 *   @param  {mdInfos} obj - mdInfos object to work on
 */
function parseFrontmatter(obj) {
	obj.config = parseYMLFrontmatter(obj.config)
	return obj
}

/**
 *   Parse frontmatter in YML format.
 *   @param  {String} header - The Frontmatter to parse
 */
function parseYMLFrontmatter(header) {
	let headerYML = header.replace(/^.*\n/, '')
	return YAML.parse(headerYML)
}

/**
 *   [addMarkdownHeader description]
 *   @param {mdInfos} obj - The Infos to work on
 */
function addConfig(obj) {
	return _(function (push, next) {
		readMarkdown(obj.filePath)
		.map(onlyFrontmatter)
		.toCallback((err, result) => {
			obj.config = result
			push(err, obj)
			push(null, _.nil)
		})
	})
}

/**
 *   [readMarkdown description]
 *   @param  {String} filePath - Path to markdwon file to read
 *   @return {Stream}          - A stream with the read file
 */
function readMarkdown(filePath) {
    return _(function (push, next) {
        fs.readFile(filePath, 'utf8', function (err, data) {
            push(err, data)
            push(null, _.nil)
        });
    });
};

/**
 *   Extracts the frontmatter from a file.
 *   Frontmatter should be enclosed in '---'.
 *   Will keep the first line but remove the closing '---'.
 *   @param  {String} file - The file to work on
 *   @return {String}      - The frontmatter of the given file
 */
function onlyFrontmatter(file) {
	return file.split('\n')
	.reduce((infos, line) => {
		if(infos.markers >= 2) return infos
		if(/^---/.test(line)) {
			infos.markers += 1
			if(infos.markers === 1) infos.header.push(line)
		} else {
			infos.header.push(line)
		}
		return infos
	}, {markers: 0, header: []})
	.header.join('\n')
}

/**
 *   Walks a filestructure starting from a given root and calls a callback
 *   with all found files.
 *   @param  {String}   dir    - Root directory
 *   @param  {RegEx}   filter  - RegEx to test found files against
 *   @param  {Function} done   - Callback will be called with (err, foundFiles)
 */
function walk(dir, filter, done) {
    var results = []
    fs.readdir(dir, function(err, list) {
        if (err) return done(err)
        var pending = list.length
        if (!pending) return done(null, results);
        list.forEach(function(file) {
            file = path.resolve(dir, file)
            fs.stat(file, function(err, stat) {
                if (stat && stat.isDirectory()) {
                    walk(file, filter, function(err, res) {
                        results = results.concat(res)
                        if (!--pending) done(null, results)
                    });
                } else {
                    if (filter.test(file)) {
                        results.push(file)
                    }
                    if (!--pending) done(null, results)
                }
            })
        })
    })
}
