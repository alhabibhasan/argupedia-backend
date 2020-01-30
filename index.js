require('custom-env').env(true)

const express = require('express')
const app = express()
const port = 8080
const cors = require('cors')
const bodyParser = require('body-parser')

const api = require('./api/routes')

app.use(bodyParser.json())

app.use('/api', cors(), api)



app.listen(port, () => console.log(`App running on port ${port}!`))

module.exports = app // for testing