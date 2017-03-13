/**
 *   Parse YML formatted frontmatter in a markdown file.
 *   Frontmatter needs to end with "---" and may also start with "---".
 *   Using this transform will require all source files to supply frontmatter.
 *   Otherwise content might be tried to be parsed and cause an error.
 *
 *   All found configurations will be added to the object processed.
 *   A provided date will also be split into components which will be
 *   added sperately.
 *
 *   @module filepress/frontmatter
 */

//TODO improve error messaging. Detect no frontmatter.

const YAML = require('yamljs')

const frontmatter = () => (obj) => {
	if(!obj.extension === '.md') return obj

	//Seperate frontmatter from body.
    const parsed = /^\s*(?:---|\s*)([\s\S]*)---[\r\n]*([\s\S]*)/.exec(obj.content)
    const rawYML = parsed[1]
    const body = parsed[2]
    const config = YAML.parse(rawYML)

	//If there is a date parse it into its components.
	if(config.date) {
		const date = new Date(config.date)
		config.year = date.getFullYear()
		config.month = date.getMonth() + 1
		config.day = date.getDate()
	}

	//Put it all together and return it.
    return Object.assign({}, obj, config, {
        body
    })
}

module.exports = frontmatter
