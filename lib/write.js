const fs = require('fs-extra')
const path = require('path')

const write = function(destination) {

	//Write all files. If they are collected iterate over the array.
	return (obj) => {
		if (Array.isArray(obj)) {
			return obj.map(singleFile => writeFile(singleFile, destination))
		} else {
			return writeFile(obj, destination)
		}
	}

}

function writeFile(obj, destination) {
	if(obj.written) return obj
    fs.outputFile(`${path.join(destination, obj.path)}${obj.extension}`, obj.content, (err) => {
        if (err) {
            throw err
        }
    })
	obj.written = true
	return obj
}

module.exports = write
