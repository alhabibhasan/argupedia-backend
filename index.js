require('dotenv').config()

const express = require('express')
const app = express()
const port = 8080
const cors = require('cors')
const bodyParser = require('body-parser')

const neo4j = require('neo4j-driver').v1

const api = require('./api/routes')

app.use(bodyParser.json())

app.use('/api', cors(), api)

const driver = neo4j.driver(process.env.NEO_HOST, neo4j.auth.basic(process.env.NEO_USERNAME, process.env.NEO_PASS))


app.listen(port, () => console.log(`App running on port ${port}!`))