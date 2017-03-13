const html = require('./html')

//TODO really generate something indexing all posts
const buildIndex = () => (pages, site) => {
	const content = html`<ul>
		${pages.filter(page => page.layout === 'post').map(post => {
			return html`<li><a href="${post.link}${post.extension}"><h1>${post.title}</h1></a>${post.content}</li>`
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
