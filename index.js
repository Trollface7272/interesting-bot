const Discord = require('discord.js')
const mysql = require('mysql')
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







bot.on('ready', () => 
{
    console.log( `Logged in as  ${bot.user.tag}` )
} )

bot.on('message', function(message)
{
    
    var messageContent = message.content.toLowerCase()
    var discordClientId = message.author.id
    var discordServerId = message.channel.id
    connection.query( { 
        sql: "SELECT * FROM `servers` WHERE `discord_id` = "+discordServerId
    }, function(error, results, fields) {
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
    sql = "SELECT * FROM `servers` WHERE `discord_id` = " + discordServerId
    connection.query( {
        sql
    }, function(error, results, fields) {
        serverData = results[0]
    
        sql = "UPDATE `servers` SET ? WHERE discord_id = " + discordServerId
        connection.query( 
            sql, {message_count: serverData.message_count + 1}
        )


        //var prefix =
        if(messageContent === '$flip')
        {
            var spin = require('./features/spin.js')
            var rand = require('./functions/randomInt.js')
            x = rand.random(0,10)
            spin.spin(message, x)
        }  
    })
})









bot.login(token);