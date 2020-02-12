const errorMessages = {
    'auth/invalid-email' : 'Please enter a correct email address.',
    'auth/wrong-password': 'The email and password combination you entered is incorrect, please try again.',
    'auth/user-not-found': 'The email and password combination you entered is incorrect, please try again.',
    'auth/email-already-in-use': 'The email you entered already has an account, please sign in or reset your password.',
    'auth/weak-password':'The password you entered is too weak, please enter another password, using a combination of upper and lowercase characters and numbers.',
    'default' : 'Please try again, if you cannot login, try resetting your password or use the alternative methods below to sign in.'
}

module.exports = {
    errorMessages
}