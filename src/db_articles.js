var pgp = require("pg-promise")();
var db = pgp("postgres://postgres:qwerty@localhost:5432/postgres");

function transFormArticleResponseToResult(article) {
    return {
        id: article.id,
        title: article.title,
        content: article.content,
        authorId: article.author_id,
        author: article.author,
        dateCreated: article.date_created
    }
}

function transFormArticlesResponseToResult(response) {
    return response.map(article => {
        return transFormArticleResponseToResult(article)
    });
}

var selectArcticles = async function() {
    const db_accounts = require('./db_accounts')
    const query = 'SELECT * FROM blog.articles'
    return await db
        .query(query)
        .then(async res => {
            await res.map(async article => {
                await db_accounts.getAccount(article.author_id).then(account => {
                    article.author = account;
                })
            })
            console.log(res)
            return transFormArticlesResponseToResult(res)
        })
        .catch(e => console.error(e.stack))
}

var addArcticles = async function(data) {
    const query = `
        INSERT INTO blog.articles 
        (title, content, author_id) 
        VALUES ('${data.title}', '${data.content}', ${data.author_id})
    `;

    return await db
        .query(query)
        .then(res => res)
}

var deleteArcticles = async function(data) {
    const query = `
        UPDATE INTO blog.articles SET is_deleted=true WHERE id=${data.id}
    `;

    return await db
        .query(query)
        .then(res => res)
}

module.exports.selectArcticles = selectArcticles
module.exports.addArcticles = addArcticles
module.exports.deleteArcticles = deleteArcticles