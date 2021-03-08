var connection = require('./connection')

function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
 }

function transformQueryResultToResponse(account) {
    return {
        firstname: account.firstname,
        lastname: account.lastname,
        login: account.login,
        id: account.id,
    }
}

var authAccount = async function(response) {
    const query = `SELECT * FROM blog.accounts WHERE login='${response.login}' AND password='${response.password}'`
    return await connection.db
        .query(query)
        .then(async res => {
            if (res.length == 0) {
                throw new Error('Неверный логин/пароль')
            }
            res[0].token = await genToken(response.login)
            res[0].roles = await getRoles(res[0].id)
            console.log(res[0])
            return res[0]
        })
}

var regAccount = async function(request) {
    let query = `SELECT * FROM blog.accounts WHERE login='${request.login}'`
    const exist = await connection.db
        .query(query)
        .then(res => {
            return res[0]
        })
    if (exist != null) {
        return false;
    }
    query = `INSERT INTO blog.accounts (firstname, lastname, login, password) VALUES ('${request.firstname}', '${request.lastname}', '${request.login}', '${request.password}')`
    const response = await connection.db
        .query(query)
        .then(res => {
            return true;
        })
    if (response === true) {
        return { token: await genToken(request.login) }
    } else {
        return false
    }
}

var genToken = async function(login) {
    remToken(login)
    
    const token = makeid(8);
    let query = `INSERT INTO blog.auth_tokens (login, token) VALUES ('${login}', '${token}')`
    return await connection.db
        .query(query)
        .then(res => {
            return token
        })
}

var remToken = async function(login) {
    let query = `DELETE FROM blog.auth_tokens WHERE login='${login}'`
    return await connection.db
        .query(query)
        .then(res => {
            return res[0]
        })
}

var checkToken = async function(token) {
    let query = `SELECT login FROM blog.auth_tokens WHERE token='${token.token}'`
    let temp = await connection.db
        .query(query)
        .then(res => {
            if (res && res[0]) {
                return res[0].login;
            }
            else
            {
                return false;
            }
        }).catch(err => {
            console.log(err)
        });
    if (temp === false) {
        return false;
    }
    query = `SELECT * FROM blog.accounts WHERE login='${temp}'`
    return await connection.db
        .query(query)
        .then(async res => {
            res[0].roles = await getRoles(res[0].id)
            return res[0];
        }).catch(err => {
            console.log(err)
        });
}

var getRoles = async function(id) {
    let query = `select role_code
    from blog.accounts left join blog.account_roles on account_id = id
    left join blog.roles on blog.roles.id = blog.account_roles.role_id
    where blog.accounts.id=${id}`
    return await connection.db
        .query(query)
        .then(res => {
            return res.map(el => el.role_code)
        })
}

module.exports.authAccount = authAccount
module.exports.regAccount = regAccount
module.exports.checkToken = checkToken
module.exports.getRoles = getRoles
