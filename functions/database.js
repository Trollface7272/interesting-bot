const mysql = require('mysql')
module.exports = {
    insert(connection, set, table) {
        let sql = "INSERT INTO " + table + " SET ?"
        connection.query( sql, set )
    },
    update(connection, table, id, set) {
        let sql = "UPDATE " + table + " SET ? WHERE discord_id = " + id
        connection.query( sql, set )
    },
    handleDisconnect() {
        var connection = {
            host     : 'remotemysql.com',
            user     : 'lWlguk3gRa',
            password : 'M1rSnLmV6K',
            database : 'lWlguk3gRa'
        }
    
        connection = mysql.createConnection(connection)
  
        connection.connect(function(err) {
        if(err) {
            console.log('error when connecting to db:', err)
            setTimeout(module.exports.handleDisconnect, 2000)
        }
        })

        connection.on('error', function(err) {
        console.log('db error', err);
        if(err.code === 'PROTOCOL_CONNECTION_LOST') {
            module.exports.handleDisconnect()
        } else {
            throw err
        }
        })
        return connection
    }

}