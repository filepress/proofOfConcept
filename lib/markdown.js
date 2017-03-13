const hljs = require('highlight.js')

//Configure Markdown-it
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

/**
 *   Transform to convert markdown to html.
 *   @return {[type]} Stream object
 */
const markdown = () => (obj) => {
	if(!obj.extension === '.md') return obj
    const markdown = obj.body
    obj.content = md.render(markdown)
    obj.extension = '.html'
    return obj
}

module.exports = markdown
