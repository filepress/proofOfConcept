const filepress = require('./lib/filepress')

function logger(item) {
    console.log('logging:', item)
    return item
}

const YAML = require('yamljs')
const frontmatter = () => (obj) => {
    const parsed = /^\s*---([\s\S]*)---[\r\n]*([\s\S]*)/.exec(obj.content)
    const rawYML = parsed[1]
    const body = parsed[2]
    const config = YAML.parse(rawYML)
	if(config.date) {
		const date = new Date(config.date)
		config.year = date.getFullYear()
		config.month = date.getMonth() + 1
		config.day = date.getDate()
	}
    return Object.assign({}, obj, config, {
        body
    })
}

const hljs = require('highlight.js')
const md = require('markdown-it')({
    html: true,
    linkify: true,
    typographer: true,
    highlight: function(str, lang) {
        if (lang && hljs.getLanguage(lang)) {
            try {
                return '<pre class="hljs"><code>' +
                    hljs.highlight(lang, str, true).value +
                    '</code></pre>'
            } catch (__) {}
        }
        return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>'
    }
})
const markdown = () => (obj) => {
	if(!obj.extension === '.md') return obj
    const markdown = `# ${obj.title}\n\n${obj.body}`
    obj.content = md.render(markdown)
    obj.extension = '.html'
    return obj
}

const fs = require('fs-extra')
const layoutCache = new Map()
layoutCache.set('layout', fs.readFileSync('./layouts/layout.html'))
const layouts = () => (page, site) => {
    if (!page.layout) return page
	if(!layoutCache.has(page.layout)) {

		//Load the layout
		const template = fs.readFileSync(`./layouts/${page.layout}.html`)
		layoutCache.set(page.layout, template)
	}
	const template = layoutCache.get(page.layout)
    page.content = eval(`\`${template}\``)
	const layout = layoutCache.get('layout')
	page.content = eval(`\`${layout}\``)

    return page
}

filepress('./source')
    .use(frontmatter())
    .use(markdown())
    .use(layouts())
    .write('./dist')
	.collect()
	.use(logger)
	.end()


/*	.use(frontmatter('yml'))
	.use(markdown)
	.use(layouts('js'))
	.build()
	.write('./build')
*/
