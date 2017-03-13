//IDEA allow for frontmatter to start without --- ???

const YAML = require('yamljs')

const frontmatter = () => (obj) => {
	if(!obj.extension === '.md') return obj

	//Seperate frontmatter from body.
    const parsed = /^\s*(---|[\s\S]*)([\s\S]*)---[\r\n]*([\s\S]*)/.exec(obj.content)
    const rawYML = parsed[2]
    const body = parsed[3]
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
