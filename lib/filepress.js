//Let's do some statistics.
const start = Date.now()
process.on('exit', function logTime() {
    const end = Date.now()
    let dur = (end - start) / 1000
    console.log('Ran for:', dur)
})

//Require a few things we need.
const _ = require('highland')
const Stream = require('stream')
const path = require('path')
const fs = require('fs-extra')

module.exports = function filepressStarter (sourceFolder) {
	const site = {
		title: 'FilePress'
	}
    const sourcePath = path.resolve(sourceFolder)
    console.log(sourcePath);
    let fileStream = startStream(sourcePath)
        .map(filePath => ({
            sourcePath: filePath,

            //Path to file without extension
            path: path.relative(sourcePath, filePath).replace(/\..*$/, ''),
			link: path.relative(sourcePath, filePath).replace(/\\/g, '/').replace(/\..*$/, ''),
            extension: path.parse(filePath).ext
        }))
        .flatMap(file => addMarkdown(file))

    function currentPress() {
        return {
            use: (transform) => {
                fileStream = fileStream.map((obj) => transform(obj, site))
                return currentPress()
            },
            run: () => {
                fileStream.done(() => {})
            },
            collect: () => {
                fileStream = fileStream.collect()
                return currentPress()
            },
			seperate: () => {
				fileStream = fileStream.sequence()
				return currentPress()
			},
			end: () => {
				fileStream.toArray(() => {})
			}
        }
    }
    return currentPress()
}

function startStream(root) {
    return _(function(push, next) {
        walk(root, push, () => {
            push(null, _.nil)
        })
    })
}

/**
 *   Walks a filestructure starting from a given root and pushes all found
 *   files onto a given stream.
 *   @param  {String}   dir    - Root directory
 *   @param  {Function} push   - Push function for a highland stream
 *   @param  {Function} done   - Callback will be called with (err, foundFiles)
 */
function walk(dir, push, done) {
    fs.readdir(dir, function(err, list) {
        if (err) return done(err)
        var pending = list.length
        list.forEach(function(file) {
            file = path.resolve(dir, file)
            fs.stat(file, function(err, stat) {
                if (stat && stat.isDirectory()) {
                    walk(file, push, function() {
                        if (!--pending) done()
                    })
                } else {
                    push(null, file)
                    if (!--pending) done()
                }
            })
        })
    })
}

/**
 *   Reads a given markdwon file and emits it's content in an event.
 *   @param  {String} filePath - Path to markdwon file to read
 *   @return {Stream}          - A stream with the read file
 */
function readMarkdown(filePath) {
    return _(function(push, next) {
        fs.readFile(filePath, 'utf8', function(err, data) {
            push(err, data)
            push(null, _.nil)
        });
    });
};

/**
 *   Adds config and body of the markdwon file to mdInfos object.
 *   @param {mdInfos} obj - The Infos to work on
 */
function addMarkdown(obj) {
    return _(function(push, next) {
        readMarkdown(obj.sourcePath)
            .toCallback((err, result) => {
                obj.content = result
                push(err, obj)
                push(null, _.nil)
            })
    })
}

//Export submodules that are part of the core.
//Needs to be down here so that the main export doesn't overwrite them, I think.
module.exports.buildIndex = require('./buildIndex')
module.exports.frontmatter = require('./frontmatter')
module.exports.layouts = require('./layouts')
module.exports.markdown = require('./markdown')
module.exports.write = require('./write')
