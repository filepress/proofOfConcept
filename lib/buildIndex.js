const html = require('./html')

const buildIndex = () => (pages, site) => {
	const content = html`<ul>
		${pages.filter(page => page.layout === 'post').map(post => {
			return html`<li>${post.title}</li>`
		})}
	</ul>`
	pages.push({
		title: site.title,
		date: Date.now(),
		layout: 'index',
		content,
		extension: '.html',
		path: 'index'
	})
	return pages
}

module.exports = buildIndex
