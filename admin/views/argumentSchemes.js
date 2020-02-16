const {firebase} = require('../firebase/firebase')
const database = firebase.database()

const getSchemes = () => {
    return database.ref('/').once('value')
    .then(snapshot => {
        let values = snapshot.val()
        let formattedValues = []
        for (let field in values.schemes) {
            let record = {
                id: field,
                label: values.schemes[field].label,
                criticalQuestions:  values.schemes[field].criticalQuestions,
            }
            formattedValues.push(record)
        }
        return formattedValues
    })
}

/**
 * Expects {id: '...' , label: '..', criticalQuestions: []}
 * @param {} scheme 
 */
const addScheme = (scheme) => {
    var newSchemeKey = firebase.database().ref().child('scheme').push().key;
    return database.ref('/schemes/' + newSchemeKey).set({
        label: scheme.label,
        criticalQuestions: scheme.criticalQuestions
    })
}

const editScheme = (id, newScheme) => {
    return database.ref('/schemes/' + id).update(newScheme)
}

const getScheme = (id) => {
    return database.ref('/schemes/' + id).once('value').then(snapshot => {
        return snapshot.val()
    })
}

const deleteScheme = (id) => {
    return database.ref('/schemes/' + id).remove()
}

module.exports = {
    addScheme,
    getSchemes,
    editScheme,
    getScheme,
    deleteScheme
}