const filepress = require('./lib/filepress')

filepress('./source')
//	.use(logger)


function logger(item) {
	console.log(item)
}

/*	.use(frontmatter('yml'))
	.use(markdown)
	.use(layouts('js'))
	.build()
	.write('./build')
*/