var connection = require('./connection')

function transFormAccountResponseToResult(account) {
    return {
        firstname: account.firstname,
        lastname: account.lastname,
        login: account.login,
        id: account.id,
        companyId: account.company_id
    }
}
function transFormAccountsResponseToResult(accounts) {
    return accounts.map(account => {
        transFormAccountResponseToResult(account)
    });
}

var selectAccounts = async function() {
    const query = 'SELECT * FROM blog.accounts'
    return await connection.db
        .query(query)
        .then(res => {
            return transFormAccountsResponseToResult(res)
        })
        .catch(e => console.error(e.stack))
}

var getAccount = async function(id) {
    const query = `SELECT * FROM blog.accounts WHERE id=${id}`
    return await connection.db
        .query(query)
        .then(res => {
            return transFormAccountResponseToResult(res[0])
        })
        .catch(e => console.error(e.stack))
}

var addAccount = async function(data) {
    const query = `
        INSERT INTO blog.accounts 
        (firstname, lastname, login, password, company_id) 
        VALUES ('${data.firstname}', '${data.lastname}', ${data.login}, ${data.password}, ${data.company_id})
    `;

    return await connection.db
        .query(query)
        .then(res => res)
}

var banAccount = async function(data) {
    const query = `
        UPDATE INTO blog.accounts SET is_banned=true WHERE id=${data.id}
    `;

    return await connection.db
        .query(query)
        .then(res => res)
}

module.exports.selectAccounts = selectAccounts
module.exports.getAccount = getAccount
module.exports.addAccount = addAccount
module.exports.banAccount = banAccount