var connection = require('./connection')

function transFormAuthResponseToResult(account) {
    return {
        firstName: account.firstname,
        lastName: account.lastname,
        login: account.login,
        id: account.id,
    }
}

var authAccount = async function(response) {
    const query = `SELECT * FROM blog.accounts WHERE login='${response.login}' AND password='${response.password}'`
    return await connection.db
        .query(query)
        .then(res => {
            return res[0]
        })
        .catch(e => console.error(e.stack))
}

module.exports.authAccount = authAccount
