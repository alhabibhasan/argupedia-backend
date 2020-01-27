const isDeleted = (id, session) => {
    let checkDeletedCypher = `MATCH (arg:Argument) 
                        WHERE ID(arg) = toInteger($id)
                        RETURN arg.deleted`
    
    return session.run(checkDeletedCypher, {id})
    .catch(err => {
        throw err
    })
}

module.exports = {
    isDeleted
}