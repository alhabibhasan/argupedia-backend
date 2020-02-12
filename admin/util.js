const path = require('path');

const getTemplate = (route) => {
    return path.join(__dirname+route)
}

module.exports = {
    getTemplate
}