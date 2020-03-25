const camelCaseToSentenceCase = string => {
    let finalResult = ''
    if (string && string.length) {
        let result = string.replace( /([A-Z])/g, " $1" );
        finalResult = result.charAt(0).toUpperCase() + result.slice(1);
    }
    return finalResult
}

module.exports = {
    camelCaseToSentenceCase
}