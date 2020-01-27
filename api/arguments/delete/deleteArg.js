const {updateArg} = require('../update/updateArg')

const deleteArg = (id) => {
    let parsedInt = parseInt(id)
    return updateArg(parsedInt, getDeletedArg(), true)
}

const getDeletedArg = () => {
    return {
        statement : 'The creator of this argument has deleted it.',
        argumentBasis : 'Deleted',
        circumstance : 'Deleted',
        action : 'Deleted',
        newCircumstance : 'Deleted',
        goal : 'Deleted',
        value : 'Deleted',
        sourceList : '[]'
    }
}

module.exports = {
    deleteArg,
}