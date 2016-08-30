const start = Date.now()
process.on('exit', function logTime() {
    const end = Date.now()
    let dur = (end - start) / 1000
    console.log('Ran for:', dur)
})

const _ = require('highland')
const Stream = require('stream')
const path = require('path')
const fs = require('fs')

module.exports = function filePressStarter(sourceFolder) {
	const sourcePath = path.resolve(sourceFolder)
	console.log(sourcePath);
	let fileStream = startStream(sourcePath)
	.map(filepath => ({
		path: filepath,
		extension: path.parse(filepath).ext
	}))

	function currentPress() {
		return {
			use: (changer) => {
				fileStream = fileStream.map(changer)
				return currentPress()
			},
			run: () => {
				fileStream.done(() => {})
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
