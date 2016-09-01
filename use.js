const filepress = require('./lib/filepress')
const frontmatter = filepress.frontmatter
const markdown = filepress.markdown
const layouts = filepress.layouts
const buildIndex = filepress.buildIndex

function logger(item) {
    console.log('logging:', item)
    return item
}



filepress('./source')
    .use(frontmatter())
    .use(markdown())
    .use(layouts())
    .write('./dist')
	.collect()
	.use(buildIndex())
	.seperate()
	.use(layouts())
	.write('./dist')
	.end()


/*	.use(frontmatter('yml'))
	.use(markdown)
	.use(layouts('js'))
	.build()
	.write('./build')
*/
