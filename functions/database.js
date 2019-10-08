module.exports = {
    insert(connection, set, table) {
        let sql = "INSERT INTO " + table + " SET ?"
        connection.query( sql, set )
    },
    update(connection, table, id, set) {
        let sql = "UPDATE " + table + " SET ? WHERE discord_id = " + id
        connection.query( sql, set )
    }

}