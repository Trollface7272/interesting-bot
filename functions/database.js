const nhf = require('./nh')
module.exports = {
    insert(connection, set, table) {
        let sql = "INSERT INTO " + table + " SET ?"
        connection.query( sql, set )
    },
    update(connection, table, id, set) {
        let sql = "UPDATE " + table + " SET ? WHERE discord_id = " + id
        connection.query( sql, set )
    },
    define(connection, id, table) {
        connection.query({sql: "SELECT * FROM "+table+" WHERE `discord_id` = "+id},
        function(error, results, fields) {
            if(error) throw error

            if(results[0] == undefined) {
                set = {discord_id: id}
                module.exports.insert(connection, set, table) 
            }
        })
    },
    getData(connection, id, table) {
        return new Promise(function(resolve,reject) {
        let sql = "SELECT * FROM "+table+" WHERE `discord_id` = "+id
        connection.query( {
            sql
        }, function(error, results, fields) {
            if(error) throw error
            resolve(results[0])
        })
    })
    },
    updateNh(connection, nh) {
        return new Promise(function(resolve,reject) {
        connection.query({sql: "SELECT * FROM `nh`"},
        async function(error, results, fields) {
            if(results[0].date.getDay() != new Date().getDay()){
                let id = await nhf.getNewestBook(nh)
                connection.query("UPDATE `nh` SET ? WHERE id = 1", {newest_id: id, date: new Date()})
                resolve(id)
            }else{
                resolve(results[0].newest_id)
            }
        })
    })
    }

}