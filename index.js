require('custom-env').env(true)

const express = require('express')
const app = express()
let port = 8080
const path = require('path');
const cors = require('cors')
const bodyParser = require('body-parser')
const SWITCH_PORT_IF_IN_USE = process.env.SWITCH_PORT_IF_IN_USE

const api = require('./api/routes')
const admin = require('./admin/index')

app.use(bodyParser.json())
app.set('view engine', 'pug')
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/admin', cors(), admin)
app.use('/api', cors(), api)

const handlePortError = (err) => {
    if (err.code === 'EADDRINUSE' && SWITCH_PORT_IF_IN_USE === true) {
        port++
        app.listen(port, () => console.log(`App running on port ${port}!`)).on('error', handlePortError)
    } else {
        console.log(`Port ${port} is already in use, please close other instances to continue.`)
    }
}

app.listen(port, () => console.log(`App running on port ${port}!`)).on('error', handlePortError)


module.exports = app // for testing