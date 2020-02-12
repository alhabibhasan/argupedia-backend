const {firebase} = require('../firebase/firebase')
const database = firebase.database()

const getSchemes = () => {
    return database.ref('/').once('value')
    .then(snapshot => {
        let values = snapshot.val()
        return values
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

module.exports = {
    addScheme,
    getSchemes
}