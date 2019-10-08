const Discord = require('discord.js')
const mysql = require('mysql')
const rand = require('./functions/randomInt.js')
const dateFormat = require('dateformat');
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






bot.on('ready', () => 
{
    console.log( `Logged in as  ${bot.user.tag}` )
} )

bot.on('message', function(message)
{
/**//**//**//**//**//**//**//**//**//**//**//**//**//**//**//**//**//**//**//**//**//**//**//**//**//**//**//**//**//**//**//**//**//**//**//**//**//**//**//**/
    var messageContent = message.content.toLowerCase()
    var discordClientId = message.author.id
    var discordServerId = message.channel.id

    connection.query({sql: "SELECT * FROM `servers` WHERE `discord_id` = "+discordServerId},
        function(error, results, fields) {
        if(error) throw error
        if(results[0] == undefined) {
            connection.query( "INSERT INTO `servers` SET ?",
                {discord_id: discordServerId}, 
                function(error, results, fields) {
                    if(error) throw error
                }
            )
        }
    })
    connection.query({sql: "SELECT * FROM `users` WHERE `discord_id` = "+discordClientId},
    function(error, results, fields) {
        if(error) throw error
        if(results[0] == undefined) {
            connection.query( "INSERT INTO `users` SET ?",
                {discord_id: discordClientId}, 
                function(error, results, fields) {
                    if(error) throw error
                }
            )
        }
    })
/*All Commands*/

/*User*/
    sql = "SELECT * FROM `servers` WHERE `discord_id` = " + discordServerId
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


/*Define database for server*/
    sql = "UPDATE `servers` SET ? WHERE discord_id = " + discordServerId
    connection.query( sql, {message_count: serverData.message_count + 1} )
    var prefix = serverData.prefix


/*Define database for users*/
    sql = "UPDATE `users` SET ? WHERE discord_id = " + discordClientId
    connection.query( sql, {message_count: userData.message_count + 1} )


    if(!(messageContent.substring(0,prefix.length) == prefix)) return


    /*Change Prefix*/
    if(messageContent.includes(prefix + 'changeprefix')) {
        pref = require('./features/prefix.js')
        prefix = pref.setPrefix(messageContent, message, connection, discordServerId)
    }


    /*Daily credits*/
    /*if(messageContent.includes(prefix + 'daily')) {
        var date = dateFormat(new Date(), "yyyy-mm-dd h:MM:ss");
        sql = "UPDATE `users` SET ? WHERE discord_id = " + discordClientId
        connection.query( sql, {credits: userData.credits + 50, daily_date: } )
    }*/


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