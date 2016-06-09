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
//    parseMarkdownFile(files[0])
	const rs = new Stream.Readable
    files.forEach(file => {
		rs.push(file)
        //parseMarkdownFile(file)
    })
	rs.push(null)
	rs.pipe(markdownStream)
})



function parseMarkdownFile(filePath) {

    var headerStream = new Stream.Duplex({ decodeStrings: false })
    headerStream._write = function(chunk, enc, next) {
		let fileInfos = chunk.split('\n')
		.reduce((infos, line) => {
			if(infos.markers >= 2) return infos
			if(/^---/.test(line)) {
				infos.markers += 1
			} else {
				infos.header.push(line)
			}
			return infos
		}, {markers: 0, header: []})
		fileInfos = fileInfos.header.join('\n')
		console.log(fileInfos);
        next()
    };
    const fileStream = fs.createReadStream(filePath, 'utf8')
    fileStream.pipe(headerStream)
}

/*
function parseMarkdownFile(filePath) {
	const stream = fs.createReadStream(filePath, 'utf8')
	let header = []
	let markers = 0
	let readOnce = false
	stream.on('readable', function(){
		if(readOnce) return
		readOnce = true
		console.log('now readable');
		while(markers < 2) {
			let read = stream.read(50)
			if(read) {
				let lines = read.split('\n')
				lines.forEach(line => {
					if(/^---/.test(line)) (
						markers += 1
					)
					if(markers < 2) {
						header.push(line.replace('\r', ''))
					}
				})
			}
		}

	})
}
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
