var pgp = require("pg-promise")();
var db = pgp("postgres://postgres:qwerty@localhost:5432/postgres");

function transFormArticleResponseToResult(article) {
    return {
        id: article.id,
        title: article.title,
        content: article.content,
        authorId: article.author_id,
        author: article.author,
        dateCreated: article.date_created,
        rating: article.rating,
    }
}

function transFormArticlesResponseToResult(response) {
    return response.map(article => {
        return transFormArticleResponseToResult(article)
    });
}

var selectArcticles = async function() {
    const db_accounts = require('./db_accounts')
    const query = 'SELECT * FROM blog.articles WHERE is_deleted=false'
    return await db
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

var addArcticles = async function(data) {
    const query = `
        INSERT INTO blog.articles (title, content, author_id) 
        VALUES ('${data.title}', '${data.content}', ${data.author_id})
    `;

    return await db
        .query(query)
        .then(res => res)
}

var deleteArcticles = async function(data) {
    const query = `UPDATE INTO blog.articles SET is_deleted=true WHERE id=${data.id}`;

    return await db
        .query(query)
        .then(res => res)
}

var updateRating = async function(data) {
    const existLike = await db
        .query(`SELECT * FROM blog.article_liked WHERE ${data.authorId} = author_id`)
        .then(res => {
            console.log(res)
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

module.exports.selectArcticles = selectArcticles
module.exports.addArcticles = addArcticles
module.exports.deleteArcticles = deleteArcticles
module.exports.updateRating = updateRating