/*
    Generate static HTML pages from markdwon.
 */

/**
 *   @typedef {Object} mdInfos
 *
 */

const start = Date.now()
process.on('exit', logTime)

const path = require('path')
const fs = require('fs')
const Stream = require('stream')
const _ = require('highland')
const YAML = require('yamljs')
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
                    '</code></pre>';
            } catch (__) {}
        }
        return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>';
    }
})

//Get all the md files.
let sourceFolder = path.join(__dirname, 'source')
generateMardownStream(sourceFolder)
    .map(filePath => ({
        filePath
    }))
    .flatMap(addMarkdown)
    .map(parseFrontmatter)
    .map(generateHTML)
    .each(saveToHTML)

/**
 *   Saved an mdInfos html to a file.
 *   @param  {mdInfos} obj - File that the html should be changed for
 */
function saveToHTML(obj) {
    fs.writeFile(`public/${obj.config.title.replace(/\s/g,'-')}.html`, obj.html, () => {

    })
}

/**
 *   Converts markdown to HTML.
 *   @param  {mdInfos} obj - The infos to work with
 *   @return {mdInfos}     - With added .html field
 */
function generateHTML(obj) {
    const markdown = `# ${obj.config.title}\n\n${obj.body}`
    obj.html = md.render(markdown)
    return obj
}

function logTime() {
    const end = Date.now()
    let dur = (end - start) / 1000
    console.log('Ran for:', dur);
}

/**
 *   Parses the given frontmatter of a markdown file.
 *   @param  {mdInfos} obj - mdInfos object to work on
 */
function parseFrontmatter(obj) {
    obj.config = parseYMLFrontmatter(obj.config)
    return obj
}

/**
 *   Parse frontmatter in YML format.
 *   @param  {String} header - The Frontmatter to parse
 */
function parseYMLFrontmatter(header) {
    let headerYML = header.replace(/^.*\n/, '')
    return YAML.parse(headerYML)
}

/**
 *   Adds config and body of the markdwon file to mdInfos object.
 *   @param {mdInfos} obj - The Infos to work on
 */
function addMarkdown(obj) {
    return _(function(push, next) {
        readMarkdown(obj.filePath)
            .map(markdown => ({
                config: onlyFrontmatter(markdown),
                body: removeFrontmatter(markdown)
            }))
            .toCallback((err, result) => {
                obj.config = result.config
                obj.body = result.body
                push(err, obj)
                push(null, _.nil)
            })
    })
}

/**
 *   Reads a given markdwon file and emits it's content in an event.
 *   @param  {String} filePath - Path to markdwon file to read
 *   @return {Stream}          - A stream with the read file
 */
function readMarkdown(filePath) {
    return _(function(push, next) {
        fs.readFile(filePath, 'utf8', function(err, data) {
            push(err, data)
            push(null, _.nil)
        });
    });
};

/**
 *   Extracts the frontmatter from a file.
 *   Frontmatter should be enclosed in '---'.
 *   Will keep the first line but remove the closing '---'.
 *   @param  {String} file - The file to work on
 *   @return {String}      - The frontmatter of the given file
 */
function onlyFrontmatter(file) {
    return file.split('\n')
        .reduce((infos, line) => {
            if (infos.markers >= 2) return infos
            if (/^---/.test(line)) {
                infos.markers += 1
                if (infos.markers === 1) infos.header.push(line)
            } else {
                infos.header.push(line)
            }
            return infos
        }, {
            markers: 0,
            header: []
        })
        .header.join('\n')
}

/**
 *   Removes the frontmatter from a markdown file.
 *   Frontmatter assumed to be marked with [--- somthing ---].
 *   @param  {String} file - Markdown file to work on
 *   @return {String}      - The body of the given Markdown file
 */
function removeFrontmatter(file) {

    //Replace the frontmatter. [\s\S] matches any character including whitespaces.
    file = file.replace(/---[\s\S]*---/, '')
    return file
}

/**
 *   Creates a stream of markdown files in a directory.
 *   Looks into subdirectories recursively.
 *   @param  {String} dir - Directory to start from
 *   @return {Stream}     - A highland stream with the found files
 */
function generateMardownStream(dir) {
    return _(function(push, next) {
        walk(dir, /\.md$/, push, () => {
            push(null, _.nil)
        })
    });
}

/**
 *   Walks a filestructure starting from a given root and pushes all found
 *   files onto a given stream. Compares all files against a filter.
 *   @param  {String}   dir    - Root directory
 *   @param  {RegEx}    filter - RegEx to test found files against
 *   @param  {Function} push   - Push function for a highland stream
 *   @param  {Function} done   - Callback will be called with (err, foundFiles)
 */
function walk(dir, filter, push, done) {
    fs.readdir(dir, function(err, list) {
        if (err) return done(err)
        var pending = list.length
        if (!pending) return done(null, results);
        list.forEach(function(file) {
            file = path.resolve(dir, file)
            fs.stat(file, function(err, stat) {
                if (stat && stat.isDirectory()) {
                    walk(file, filter, push, function(err, res) {
                        results = results.concat(res)
                        if (!--pending) done()
                    });
                } else {
                    if (filter.test(file)) {
                        push(null, file)
                    }
                    if (!--pending) done()
                }
            })
        })
    })
}
