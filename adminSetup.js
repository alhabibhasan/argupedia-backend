require('custom-env').env(true)
const Confirm = require('prompt-confirm');
const neo4j = require('neo4j-driver').v1
const driver = neo4j.driver(process.env.NEO_HOST, neo4j.auth.basic(process.env.NEO_USERNAME, process.env.NEO_PASS))
let args = process.argv
let email = args[2]
let flag = args[3]

if (!flag) {
    console.log(flag)
    console.log('Please pass a --create or --revoke parameter.')
    process.exit(1)
}

if (!email || !email.includes('@')) {
    console.log('Ensure that you enter a valid email address like so `node admin.js "admin@email.com" --create or --revoke(email in quotes)`')
    process.exit(0)
}

const promptAdminCreation = new Confirm(`Are you sure you want to grant/revoke '${email}' admin rights, this is a potentially SYSTEM CRITICAL action.`)

const secondPromptAdminCreation = new Confirm(`Will now grant/revoke '${email}' admin rights. Are you sure you want to continue?`)

promptAdminCreation.ask((answer) => {
    if (answer) {
        checkIfEmailExists(email)
        .then(exists => {
            if (!exists) {
                console.log(`User with email ${email} not found. Ensure that this user has created an account via the website`)
                process.exit(0)
            } else {
                secondPromptAdminCreation.ask(answer => {
                    if (answer) {
                        console.log(`Okay, lets do this...`)
                        let isAdmin = addOrDeleteAdmin(flag)
                        setAdminRights(email, isAdmin)
                        .then(done => {
                            if (done) {
                                if (isAdmin) {
                                    console.log(`${email} is now an admin`)
                                } else {
                                    console.log(`${email} is no longer an admin`)
                                }
                                process.exit(0)
                            } else {
                                console.log(`Something went wrong, please try again`)
                                process.exit(1)
                            }
                        })
                    } else {
                        console.log(`So you changed your mind, don't worry we don't judge.`)
                        process.exit(1)
                    }
                })
            }
            
        }) 
    }
})

const addOrDeleteAdmin = (flag) => {
    if (flag === '--revoke') return false
    if (flag === '--create') return true
    console.log('Flag not found, specify required flag')
    process.exit(1)
}

const setAdminRights = (email, isAdmin) => {
    const session = driver.session()
    const cypherToCheckIfEmailExists = `MATCH (user:User) WHERE user.email = $email SET user.admin = $isAdmin RETURN user {email: user.email, admin: user.admin}`
    return session.run(cypherToCheckIfEmailExists, {email, isAdmin})
    .then(resp => {
        return resp.records[0]
    })
    .catch(err => {
        console.log('Process failed and didnt complete for some reason, try again or contact support.')
        process.exit(1)
    })
}

const checkIfEmailExists = (email) => {
    const session = driver.session()
    const cypherToCheckIfEmailExists = `MATCH (user:User) WHERE user.email = $email RETURN user {email: user.email}`
    return session.run(cypherToCheckIfEmailExists, {email})
    .then(resp => {
        return resp.records[0]
    })
    .catch(err => {
        console.log(err)
        process.exit(1)
    })
}