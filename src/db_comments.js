var connection = require('./connection')

var getCurrentAccount = async function(token) {

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
    return authorId;
}

var selectComments = async function(articleId) {
    let query = `SELECT * FROM blog.comments WHERE article_id=${articleId}`
    const result = await connection.db
        .query(query)
        .then(res => {
            return res
        })
        .catch(e => console.error(e.stack))
    const temp = await Promise.all(result.map(async comment => {
        let query = `SELECT * FROM blog.accounts WHERE id=${comment.author_id}`
        const account = await connection.db
            .query(query)
            .then(res => {
                return res[0];
            })
        comment.author = account;
        
        query = `SELECT count(0) as rating, comment_like FROM blog.comment_liked WHERE comment_id=${comment.id} GROUP BY comment_like`
        const rating = await connection.db
            .query(query)
            .then(res => {
                let result = 0;
                if (res.length > 0) {
                    const dislikes = res.filter(el => el.comment_like === false)[0];
                    const likes = res.filter(el => el.comment_like === true)[0];
                    result -= dislikes ? parseInt(dislikes.rating) : 0
                    result += likes ? parseInt(likes.rating) : 0
                }
                return result;
            })
        comment.rating = rating;
        return comment;
    }))

    return temp.sort((f, s) => f.rating - s.rating || f.date_created < s.date_created).reverse()
}

var selectCommentById = async function(commentId) {
    let query = `SELECT * FROM blog.comments WHERE id=${commentId}`
    const result = await connection.db
        .query(query)
        .then(res => {
            return res
        })
        .catch(e => console.error(e.stack))
    return Promise.all(result.map(async comment => {
        let query = `SELECT * FROM blog.accounts WHERE id=${comment.author_id}`
        const account = await connection.db
            .query(query)
            .then(res => {
                return res[0];
            })
        comment.author = account;
        
        query = `SELECT count(0) as rating, comment_like FROM blog.comment_liked WHERE comment_id=${comment.id} GROUP BY comment_like`
        const rating = await connection.db
            .query(query)
            .then(res => {
                let result = 0;
                if (res.length > 0) {
                    const dislikes = res.filter(el => el.comment_like === false)[0];
                    const likes = res.filter(el => el.comment_like === true)[0];
                    result -= dislikes ? parseInt(dislikes.rating) : 0
                    result += likes ? parseInt(likes.rating) : 0
                }
                return result;
            })
        comment.rating = rating;
        return comment;
    }))
}

var addComments = async function(body, token) {
    authorId = await getCurrentAccount(token);
    console.log(body.comment_id)
    let query = `INSERT INTO blog.comments (author_id, article_id, text, comment_id) VALUES (${authorId}, ${body.article_id}, '${body.text}', ${body.comment_id ? body.comment_id : null})`
    return await connection.db
        .query(query)
        .then(res => {
            return res
        })
}

var likeComment = async function(body, token) {
    accountId = await getCurrentAccount(token);

    let query = `SELECT comment_id, comment_like FROM blog.comment_liked WHERE comment_id=${body.comment_id} AND account_id=${accountId}`;
    const check = await connection.db.query(query).then(res => {
        if (res.length > 0) {
            if (res[0].comment_like.toString() === body.like) {
                return 'exist';
            }
            return 'update'
        } else {
            return 'insert';
        }
    })

    if (check === 'insert') {
        query = `INSERT INTO blog.comment_liked (account_id, comment_id, comment_like) VALUES (${accountId}, ${body.comment_id}, ${body.like})`
        return await connection.db
            .query(query)
            .then(res => {
                return res
            }).catch(err => {
                console.log(err)
            })
    } else if (check === 'update') {
        query = `UPDATE blog.comment_liked SET comment_like=${body.like} WHERE comment_id=${body.comment_id} AND account_id=${accountId}`
        return await connection.db
            .query(query)
            .then(res => {
                return res
            })
    }
    return false

}

var getLikedComments = async function(articleId, token) {
    let query = `SELECT blog.comments.id, comment_like FROM blog.comments right join blog.comment_liked on blog.comments.id=blog.comment_liked.comment_id where article_id=${articleId} AND account_id=${await getCurrentAccount(token)}`
    return await connection.db
        .query(query)
        .then(res => {
            return res
        }).catch(err => console.log(err))
}

module.exports.selectCommentById = selectCommentById
module.exports.selectComments = selectComments
module.exports.addComments = addComments
module.exports.likeComment = likeComment
module.exports.getLikedComments = getLikedComments