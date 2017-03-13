const filepress = require('./lib/filepress')
const frontmatter = filepress.frontmatter
const markdown = filepress.markdown
const layouts = filepress.layouts
const buildIndex = filepress.buildIndex
const write = filepress.write

//Define a logger which can have it's formatting configured.
const logger = (indents) => (obj) => {
    console.log('logging:', JSON.stringify(obj, null, indents))
    return obj
}

filepress('./source')
    .use(frontmatter())
    .use(markdown())
    .use(layouts())
	.use(logger(4))
    .use(write('./dist'))
	.collect()
	.use(buildIndex())
	.seperate()
	.use(layouts())
	.use(write('./dist'))
	.end()
