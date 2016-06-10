/*
    Generate static HTML pages from markdwon.
 */

const path = require('path')
const fs = require('fs')
const Stream = require('stream')
const _ = require('highland')

//Get all the md files.
let sourceFolder = path.join(__dirname, 'source')
walk(sourceFolder, /\.md$/, function(err, files) {
	_(files)
	.map(filePath => ({filePath}))
	.flatMap(addMarkdownHeader)
	.map(parseHeader)
	.collect()
	.toCallback((err, result) => {
		console.log('result\n', JSON.stringify(result, null, 2));
	})

})

function parseHeader(obj) {
	obj.header = parseYMLHeader(obj.header)
	return obj
}

function parseYMLHeader(header) {
	const YAML = require('yamljs');
	let headerYML = header.replace(/^.*\n/, '')
	return YAML.parse(headerYML)
}

function addMarkdownHeader(obj) {
	return _(function (push, next) {
		readMarkdown(obj.filePath)
		.map(onlyHeader)
		.toCallback((err, result) => {
			obj.header = result
			push(err, obj)
			push(null, _.nil)
		})
	})
}

function readMarkdown(filePath) {
    // create a new Stream
    return _(function (push, next) {
        // do something async when we read from the Stream
        fs.readFile(filePath, 'utf8', function (err, data) {
            push(err, data)
            push(null, _.nil)
        });
    });
};

function onlyHeader(file) {
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
