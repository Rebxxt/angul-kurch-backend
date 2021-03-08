var db_articles = require('./db_articles')
var db_accounts = require('./db_accounts')
var db_auth = require('./db_auth')
var bodyParser = require('body-parser')
let multer = require('multer');
let upload = multer();

var express = require('express')
const { db } = require('./connection')
var app = express()
var port = 3000;

app.use(bodyParser.urlencoded({limit: '10mb', extended: true}));
app.use(bodyParser.json({limit: '10mb', extended: true}));

// ARTICLES
app.get('/api/articles', async (req, res) => {
    var result = await db_articles.selectArcticles(req.query).then(result => {
        return result
    });
    res.status(200).send(result);
})
app.post('/api/articles', async (req, res) => {
    var body = req.body;
    if (body.title && body.content && typeof parseInt(body.author_id) === "number") {
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
app.delete('/api/articles', async (req, res) => {
    var result = await db_articles.deleteArcticles(req.query).then(result => {
        return result
    });
    res.status(200).send(result);
})
app.put('/api/articles/rating', async (req, res) => {
    var result = await db_articles.updateRating(req.body).then(result => {
        return result
    });
    res.status(200).send(result);
})
app.put('/api/articles/status', async (req, res) => {
    var result = await db_articles.setStatusArticle(req.body).then(result => {
        return result
    });
    res.status(200).send(result);
})
//ARTICLE
app.get('/api/article', async (req, res) => {
    var result = await db_articles.selectArcticle(req.query.id).then(result => {
        return result
    });
    res.status(200).send(result);
})

//ACCOUNT
app.get('/api/account', async (req, res) => {
    var result = await db_accounts.getAccount(req.query.id, req.query.takePic).then(result => {
        return result
    });
    res.status(200).send(result);
})
app.post('/api/account/pic', upload.fields([]), async (req, res) => {
    var result = await db_accounts.setAccountPic(req.body.file, req.body.id).then(result => {
        return result
    }, err => {
        throw err;
    });
    res.send('true');
})

//AUTH
app.get('/api/auth', async (req, res) => {
    var result = await db_auth.authAccount(req.query).then(result => {
        return result
    }).catch(e => {
        return false;
    });
    
    if (result)
        res.send(result);
    else
        res.status(400).send(result)
})
app.post('/api/auth', async (req, res) => {
    var result = await db_auth.regAccount(req.body).then(result => {
        return result
    }).catch(e => {
        return false;
    });
    if (result)
        res.send(result);
    else
        res.status(400).send(result)
})

app.get('/api/token', async (req, res) => {
    var result = await db_auth.checkToken(req.query).then(result => {
        return result
    }).catch(e => {
        return false;
    });
    
    if (result)
        res.send(result);
    else
        res.status(400).send(result)
})

app.listen(port, () => {
    console.log('Listening in localhost:' + port);
})
