var db_articles = require('./db_articles')
var db_accounts = require('./db_accounts')
var bodyParser = require('body-parser')

var express = require('express')
var app = express()
var port = 3000;

app.use(bodyParser.urlencoded());
app.use(bodyParser.json());

// ARTICLES
app.get('/api/articles', async (req, res) => {
    var result = await db_articles.selectArcticles().then(result => {
        return result
    });
    res.status(200).send(result);
})
app.post('/api/articles', async (req, res) => {
    var body = req.body;
    if (body.title && body.content && typeof body.author_id === 'number') {
        var result = await db_articles.addArcticles(body)
            .then(result => {
                res.status(200);
                return true
            })
            .catch(err => {
                res.status(400)
                return err
            });
    } else {
        result = {
            message: 'Columns are wrong!'
        }
        res.status(400);
    }
    res.send(result);
})
app.put('/api/articles/rating', async (req, res) => {
    var result = await db_articles.updateRating(req.body).then(result => {
        return result
    });
    res.status(200).send(result);
})

//ACCOUNT
app.get('/api/account', async (req, res) => {
    var result = await db_accounts.getAccount(req.query.id).then(result => {
        return result
    });
    res.status(200).send(result);
})

app.listen(port, () => {
    console.log('Listening in localhost:' + port);
})