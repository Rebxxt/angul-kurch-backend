var pgp = require("pg-promise")();
var db = pgp("postgres://postgres:qwerty@localhost:5432/postgres");

module.exports.db = db