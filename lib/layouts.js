/**
 *   Apply wrap content into a layout.
 *
 *   By default this uses simple ES6 template literals.
 *
 *   @module filepress/layouts
 */

const fs = require('fs-extra')

//Lets have a cache for template we already read once.
const templateCache = new Map()

//The general Layout should be present from the start.
templateCache.set('layout', fs.readFileSync('./layouts/layout.html'))

const layouts = () => (page, site) => {
    if (!page.layout) return page
	if(!templateCache.has(page.layout)) {

		//Load not cached template.
		//TODO default to some template when searched template does not exist.
		const template = fs.readFileSync(`./layouts/${page.layout}.html`)
		templateCache.set(page.layout, template)
	}

	//First use the template then apply the general layout.
	const template = templateCache.get(page.layout)
    page.content = eval(`\`${template}\``)
	const layout = templateCache.get('layout')
	page.content = eval(`\`${layout}\``)

    return page
}

module.exports = layouts
