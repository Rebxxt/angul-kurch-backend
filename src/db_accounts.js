var connection = require('./connection')

function transFormAccountResponseToResult(account) {
    return {
        firstname: account.firstname,
        lastname: account.lastname,
        login: account.login,
        id: account.id,
        companyId: account.company_id,
        rating: account.rating,
        is_banned: account.is_banned,
        date_registrated: account.date_registrated,
        roles: account.roles,
        pic: account.pic
    }
}
function transFormAccountsResponseToResult(accounts) {
    return accounts.map(account => {
        transFormAccountResponseToResult(account)
    });
}

var selectAccounts = async function() {
    const query = 'SELECT firstname, lastname, login, id, company_id, rating, is_banned, date_registrated FROM blog.accounts'
    return await connection.db
        .query(query)
        .then(res => {
            return transFormAccountsResponseToResult(res)
        })
        .catch(e => console.error(e.stack))
}

var getAccount = async function(id, takePic) {
    let query = `SELECT firstname, lastname, login, id, company_id, rating, is_banned, date_registrated`
    if (takePic) {
        query += `, pic`
    }
    query += ` FROM blog.accounts WHERE id=${id}`
    let account = await connection.db
        .query(query)
        .then(res => {
            return transFormAccountResponseToResult(res[0])
        })
        .catch(e => console.error(e.stack))

    
    query = `select role_code
    from blog.accounts left join blog.account_roles on account_id = id
    left join blog.roles on blog.roles.id = blog.account_roles.role_id
    where blog.accounts.id=${id}`
    const roles = await connection.db
        .query(query)
        .then(res => {
            return res.map(el => el.role_code);
        })
    if (roles[0] != null) {
        account.roles = roles;
    }
    return account;
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

var setAccountPic = async function(req, id) {
    const query = `
        UPDATE blog.accounts SET pic='${req}' WHERE id=${id}
    `;

    return await connection.db
        .query(query)
        .then(res => {
            
        }, err => {
            console.log('err', err)
        })
}

module.exports.selectAccounts = selectAccounts
module.exports.getAccount = getAccount
module.exports.addAccount = addAccount
module.exports.banAccount = banAccount
module.exports.setAccountPic = setAccountPic