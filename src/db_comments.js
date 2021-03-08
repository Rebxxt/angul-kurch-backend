var connection = require('./connection')


var selectComments = async function(articleId) {
    let query = `SELECT * FROM blog.comments WHERE article_id=${articleId}`
    const result = await connection.db
        .query(query)
        .then(res => {
            return res
        })
        .catch(e => console.error(e.stack))
    return Promise.all(result.map(async comment => {
        const query = `SELECT * FROM blog.accounts WHERE id=${comment.author_id}`
        const account = await connection.db
            .query(query)
            .then(res => {
                return res[0];
            })
        comment.author = account;
        return comment;
    }))
}

var addComments = async function(body, token) {
    const getAuthorQuery = `SELECT blog.accounts.id FROM blog.auth_tokens LEFT JOIN blog.accounts ON blog.accounts.login = blog.auth_tokens.login WHERE token='${token}'`
    const authorId = await connection.db
        .query(getAuthorQuery)
        .then(res => {
            if (res.length == 0) {
                throw new Error('bad token')
            }
            return res[0].id
        })
    if (typeof authorId !== "number") {
        throw new Error('bad token')
    }
    
    let query = `INSERT INTO blog.comments (author_id, article_id, text, comment_id) VALUES (${authorId}, ${body.article_id}, '${body.text}', ${body.comment_id ? body.comment_id : null})`
    return await connection.db
        .query(query)
        .then(res => {
            return res
        })
}

module.exports.selectComments = selectComments
module.exports.addComments = addComments