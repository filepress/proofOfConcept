const filepress = require('./lib/filepress')

function logger(item) {
    console.log(item)
    return item
}

const YAML = require('yamljs')
const frontmatter = () => (obj) => {
    const parsed = /^\s*---([\s\S]*)---[\r\n]*([\s\S]*)/.exec(obj.content)
    const rawYML = parsed[1]
    const body = parsed[2]
    const config = YAML.parse(rawYML)
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
    const markdown = `# ${obj.title}\n\n${obj.body}`
    obj.content = md.render(markdown)
    obj.extension = 'html'
    return obj
}

const fs = require('fs-extra')
const layouts = () => (page) => {
    if (page.layout !== 'post') return page
	console.log(page.title);
    const content = `<article>
			${page.content}
		</article>`
    page.content = `<html>
		<head>
			<title>Test</title>
		</head>
		<body>
			${content}
		</body>
		</html>`

    return page
}

filepress('./source')
    .use(frontmatter())
    .use(markdown())
    .use(layouts())
    .write('./dist')


/*	.use(frontmatter('yml'))
	.use(markdown)
	.use(layouts('js'))
	.build()
	.write('./build')
*/
