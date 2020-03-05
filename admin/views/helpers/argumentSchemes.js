const fb = require('../../firebase/firebase').firebase

const getSchemes = () => {
    return fb.database().ref('/').once('value')
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
    var newSchemeKey = fb.database().ref().child('scheme').push().key;
    return fb.database().ref('/schemes/' + newSchemeKey).set({
        label: scheme.label,
        criticalQuestions: scheme.criticalQuestions
    })
}

const editScheme = (id, newScheme) => {
    return fb.database().ref('/schemes/' + id).update(newScheme)
}

const getScheme = (id) => {
    return fb.database().ref('/schemes/' + id).once('value').then(snapshot => {
        return snapshot.val()
    })
}

const deleteScheme = (id) => {
    return fb.database().ref('/schemes/' + id).remove()
}

module.exports = {
    addScheme,
    getSchemes,
    editScheme,
    getScheme,
    deleteScheme
}