const Discord = require('discord.js'),
mysql = require('mysql'),
nh = require('nhentai-js'),
async = require('async'),
db = require('./functions/database.js'),
rand = require('./functions/randomInt.js'),
nhf = require('./functions/nh.js'),
nhm = require('./features/nh.js')
var token = require('./token.js')
token = token.token


const bot = new Discord.Client()


var connection


function handleDisconnect() {
    var login = {
        host     : 'remotemysql.com',
        user     : 'lWlguk3gRa',
        password : 'M1rSnLmV6K',
        database : 'lWlguk3gRa'
    }

    connection = mysql.createConnection(login)

    connection.connect(function(err) {
    if(err) {
        console.log('error when connecting to db:', err)
        setTimeout(handleDisconnect, 2000)
    }
    })

    connection.on('error', function(err) {
    if(err.code === 'PROTOCOL_CONNECTION_LOST') {
        handleDisconnect()
    } else {
        throw err
    }
    })
}
handleDisconnect()

var serverData
var userData
var set
var sql
var newestBook

bot.on('ready', () => 
{
    console.log( `Logged in as  ${bot.user.tag}` )

} )

bot.on('message', function(message)
{
/**//**//**//**//**//**//**//**//**//**//**//**//**//**//**//**//**//**//**//**//**//**//**//**//**//**//**//**//**//**//**//**//**//**//**//**//**//**//**//**/
    if(message.author.bot) return

    var messageContent = message.content.toLowerCase(), discordClientId = message.author.id, discordServerId = message.channel.id

    connection.query({sql: "SELECT * FROM `servers` WHERE `discord_id` = "+discordServerId},
    function(error, results, fields) {
        if(error) throw error

        if(results[0] == undefined) {
            set = {discord_id: discordServerId}
            db.insert(connection, set, "servers") 
        }
    })
    connection.query({sql: "SELECT * FROM `users` WHERE `discord_id` = "+discordClientId},
    function(error, results, fields) {
        if(error) throw error
        
        if(results[0] == undefined) {
            set = {discord_id: discordClientId}
            db.insert(connection, set, "users")
        }
    })
    connection.query({sql: "SELECT * FROM `nh`"},
    async function(error, results, fields) {
        if(results[0] == undefined) {
            let id = await nhf.getNewestBook(nh)

            set = {newest_id: id, date: new Date()}
            db.insert(connection, set, "nh")
            newestBook = id

        }else if(results[0].date.getDay() != new Date().getDay()){
            let id = await nhf.getNewestBook(nh)

            set = {newest_id: id, date: new Date()}
            connection.query("UPDATE `nh` SET ? WHERE id = 1", set)
            newestBook = id
        }else {
            newestBook = results[0].newest_id
        }
    })
/*All Commands*/

/*User*/
    sql = "SELECT * FROM `users` WHERE `discord_id` = "+discordClientId
    connection.query( {
        sql
    }, function(error, results, fields) {
        if(error) throw error
        userData = results[0] //All data from database about user


/*Server*/
    sql = "SELECT * FROM `servers` WHERE `discord_id` = " + discordServerId
    connection.query( {
        sql
    }, function(error, results, fields) {
        if(error) throw error
        serverData = results[0] //All data from database about server

        
/*Message Count Server*/
    set =  {message_count: serverData.message_count + 1}
    db.update(connection, 'servers', discordServerId, set)
    var prefix = serverData.prefix

    
/*Message Count User*/
    set = {message_count: userData.message_count + 1} 
    db.update(connection, 'users', discordClientId, set)


/*User Tag*/
    if(userData.tag != message.author.tag) {
        set = {tag: message.author.tag}
        db.update(connection, 'users', discordClientId, set)
    }


/*Server Name*/
    if(serverData.server_name != message.guild.name) {
        set = {server_name: message.guild.name}
        db.update(connection, 'servers', discordServerId, set)
    }
/*----------------------------Prefix only----------------------------*/
if(!(messageContent.substring(0,prefix.length) == prefix)) return


/*Change Prefix*/
    if(messageContent.includes(`${prefix}changeprefix`)) {
        pref = require('./features/prefix.js')
        prefix = pref.setPrefix(messageContent, message, connection, discordServerId)
    }


/*Daily credits*/
    if(messageContent.includes(`${prefix}daily`)) {
        var date = new Date()
        var dateOld = userData.daily_date
        if(Math.abs(date - dateOld) >= 86400000) {
            set = {credits: userData.credits + 50, daily_date: date}
            db.update(connection, 'users', discordClientId, set)
            let credits = userData.credits + 50
            message.channel.send(`Succesfully claimed your 50 daily credits you now have ${credits} credits`)
        }else 
        message.channel.send('No')
    }


/*Flip*/
    if(messageContent === `${prefix}flip`)
    {
        var spin = require('./features/spin.js')
        spin.spin(message, rand.random(0,10))
    }


/*yes*/
    if(messageContent.startsWith(`${prefix}nh`)) {
        (async () => {
            let rich = await nhm.getBookInfo(newestBook.toString())
            rich = await nhm.sendInfo(rich)
            message.channel.send(rich)
        })()
        
    }
    })
})
    
})








bot.login(token)