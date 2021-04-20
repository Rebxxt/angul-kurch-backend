var connection = require('./connection')

function transFormArticleResponseToResult(article) {
    return {
        id: article.id,
        title: article.title,
        content: article.content,
        authorId: article.author_id,
        author: article.author,
        dateCreated: article.date_created,
        rating: article.rating,
        viewers: article.viewers,
        moderate_apply: article.moderate_apply,
        moderate_check: article.moderate_check,
    }
}

function transFormArticlesResponseToResult(response) {
    return response.map(article => {
        return transFormArticleResponseToResult(article)
    });
}

var selectArcticles = async function(filters) {
    const db_accounts = require('./db_accounts')
    let query = `SELECT * FROM blog.articles WHERE (moderate_apply=${filters.moderate_apply != null ? filters.moderate_apply : true} AND moderate_check=${filters.moderate_check != null ? filters.moderate_check : true})`
    if (filters.deleted != true) {
        query += ` AND is_deleted=false`
    }
    if (filters.account_id != null) {
        query += ` AND author_id=${filters.account_id}`
    }
    if (filters.search_text != null) {
        query += ` AND content LIKE '%${filters.search_text}%' `
    }
    return await connection.db
        .query(query)
        .then(async res => {
            for (let article in res) {
                await db_accounts.getAccount(res[article].author_id).then(account => {
                    res[article].author = account;
                })
            }
            return transFormArticlesResponseToResult(res)
        })
        .catch(e => console.error(e.stack))
}

var selectArcticle = async function(id) {
    const db_accounts = require('./db_accounts')
    const query = 'SELECT * FROM blog.articles WHERE is_deleted=false AND id=' + id
    return await connection.db
        .query(query)
        .then(async res => {
            for (let article in res) {
                await db_accounts.getAccount(res[article].author_id).then(account => {
                    res[article].author = account;
                })
            }
            return transFormArticlesResponseToResult(res)
        })
        .catch(e => console.error(e.stack))
}

var editArticle = async function(updatedBody) {
    const query = `
        UPDATE blog.articles SET moderate_check=false, title='${updatedBody.title}', content='${updatedBody.content}'
            WHERE id=${updatedBody.id}
    `;
    return await connection.db
        .query(query)
        .then(res => res)
}

var addArcticles = async function(data) {
    const query = `
        INSERT INTO blog.articles (title, content, author_id) 
        VALUES ('${data.title}', '${data.content[0]}', ${data.author_id})
    `;

    return await connection.db
        .query(query)
        .then(res => res)
}

var deleteArcticles = async function(data) {
    const query = `UPDATE blog.articles SET is_deleted=true WHERE id=${data.id}`;

    return await connection.db
        .query(query)
        .then(res => res)
}

var updateRating = async function(data) {
    const existLike = await connection.db
        .query(`SELECT * FROM blog.article_liked WHERE ${data.authorId} = author_id`)
        .then(res => {
            if (res.length > 0) {
                if (res[0].like) {

                }
            } else {
                let query;
                data.count
                    ? query = `UPDATE INTO blog.articles SET rating=rating+1 WHERE id=${data.id}`
                    : query = `UPDATE INTO blog.articles SET rating=rating-1 WHERE id=${data.id}`;
            }
            return false
        })
    // let query;

    // return await db
    //     .query(query)
    //     .then(res => res)
}

var setStatusArticle = async function(data) {
    const query = `UPDATE blog.articles SET moderate_check=true, moderate_apply=${data.status} WHERE id=${data.id}`;

    return await connection.db
        .query(query)
        .then(res => res)
}

module.exports.selectArcticle = selectArcticle
module.exports.selectArcticles = selectArcticles
module.exports.addArcticles = addArcticles
module.exports.deleteArcticles = deleteArcticles
module.exports.updateRating = updateRating
module.exports.setStatusArticle = setStatusArticle
module.exports.editArticle = editArticle