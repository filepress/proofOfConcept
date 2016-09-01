
//http://www.2ality.com/2015/01/template-strings-html.html
const html = (literalSections, ...substs) => {
    let raw = literalSections.raw
    let result = ''
    substs.forEach((subst, i) => {
        let lit = raw[i]

        if (Array.isArray(subst)) {
            subst = subst.join('')
        }

        if (lit.endsWith('$')) {
            subst = htmlEscape(subst)
            lit = lit.slice(0, -1)
        }
        result += lit
        result += subst
    })
    result += raw[raw.length - 1]
    return result
}

module.exports = html
