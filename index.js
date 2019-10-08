const Discord = require('discord.js')
const mysql = require('mysql')
const rand = require('./functions/randomInt.js')
const dateFormat = require('dateformat');
const async = require("async");
const db = require('./functions/database.js')
var token = require('./token.js')
token = token.token


const bot = new Discord.Client()
const connection = mysql.createConnection({
    host     : 'remotemysql.com',
    user     : 'lWlguk3gRa',
    password : 'M1rSnLmV6K',
    database : 'lWlguk3gRa'
})
connection.connect(function(err) {
    if (err) {
        console.error('error connecting: ' + err.stack)
        return;
    }
    console.log('connected as id ' + connection.threadId)
})

var serverData
var userData
var set
var sql

bot.on('ready', () => 
{
    console.log( `Logged in as  ${bot.user.tag}` )
} )

bot.on('message', function(message)
{
/**//**//**//**//**//**//**//**//**//**//**//**//**//**//**//**//**//**//**//**//**//**//**//**//**//**//**//**//**//**//**//**//**//**//**//**//**//**//**//**/
    if(message.author.bot) return
    var messageContent = message.content.toLowerCase()
    var discordClientId = message.author.id
    var discordServerId = message.channel.id

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

/*----------------------------Prefix only----------------------------*/
    if(!(messageContent.substring(0,prefix.length) == prefix)) return


/*Change Prefix*/
    if(messageContent.includes(prefix + 'changeprefix')) {
        pref = require('./features/prefix.js')
        prefix = pref.setPrefix(messageContent, message, connection, discordServerId)
    }


/*Daily credits*/
    if(messageContent.includes(prefix + 'daily')) {
        var date = new Date()
        var dateOld = userData.daily_date
        if(Math.abs(date - dateOld) >= 86400000) {
            set = {credits: userData.credits + 50, daily_date: date}
            db.update(connection, 'users', discordClientId, set)
            let credits = userData.credits + 50
            message.channel.send('Succesfully claimed your 50 daily credits you now have ' + credits + ' credits')
        }
    }


/*Flip*/
    if(messageContent === prefix + 'flip')
    {
        var spin = require('./features/spin.js')
        spin.spin(message, rand.random(0,10))
    }  
    })
    })
})








bot.login(token);