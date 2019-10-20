const Discord = require('discord.js'),
mysql = require('mysql'),
async = require("async"),
nh = require('nhentai-js'),
commands = require('./features/commands'),
db = require('./functions/database'),
rand = require('./functions/randomInt'),
nhf = require('./functions/nh.js'),
nhm = require('./features/nh.js'),
pref = require('./features/prefix')

var token = require('./token')
token = token.token


const bot = new Discord.Client()

var newestBook
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
    console.log('db error', err);
    if(err.code === 'PROTOCOL_CONNECTION_LOST') {
        handleDisconnect()
    } else {
        throw err
    }
    })
}
handleDisconnect();

bot.on('ready', () => 
{
    console.log( `Logged in as  ${bot.user.tag}` )
    bot.user.setStatus('available')
    bot.user.setActivity('$help', {type: 'PLAYING'})
})

bot.on('message', async function(message)
{
/**//**//**//**//**//**//**//**//**//**//**//**//**//**//**//**//**//**//**//**//**//**//**//**//**//**//**//**//**//**//**//**//**//**//**//**//**//**//**//**/
    if(message.author.bot) return
    if(message.guild === null) return
    if(bot.token == 'NTg1MTczNTQ0OTYzNjcwMDI3.XaqoAA.h1_5teqsYgWVwD86vUMdddCuiGs')
        if (message.guild.member('630440015494643716')) return

    var messageContent = message.content.toLowerCase()
    var discordClientId = message.author.id
    var discordServerId = message.guild.id
    var serverData
    var userData

    db.define(connection, discordServerId, 'servers')
    db.define(connection, discordClientId, 'users');
    
/*All Commands*/

/*User*/
async function getData() {
    let data = db.getData(connection, discordClientId, 'users')
    await data.then(async function success(result) {
        userData = await result
    })
    data = db.getData(connection, discordServerId, 'servers')
    await data.then(async function success(result) {
        serverData = await result
    })
    data = db.updateNh(connection, nh)
    await data.then(async function success(result) {
        newestBook = result
    })
        
/*Message Count & Name Server*/ 
    db.update(connection, 'servers', discordServerId, {message_count: serverData.message_count + 1, server_name: message.guild.name})
    
/*Message Count & Tag User*/
    db.update(connection, 'users', discordClientId, {message_count: userData.message_count + 1, tag: message.author.tag})


/*----------------------------Prefix only----------------------------*/
    var prefix = serverData.prefix

    if(messageContent.startsWith(prefix)) 
        commands.commands(messageContent, message, connection, discordServerId, discordClientId, prefix, userData, db, newestBook)

    if(messageContent == '$resetprefix') 
        pref.setPrefix(`${prefix}changeprefix $`, message, connection, discordServerId)

    if(messageContent.startsWith('https://nhentai.net')) {
        if(!message.channel.nsfw) return 
        message.delete()
        let rich = await nhm.getBookInfo(messageContent.replace(/[^0-9]/g, ''), false)
        rich = await nhm.sendInfo(rich)
        message.channel.send(rich)
    }

    if(messageContent.includes('cornflaek') || messageContent.includes('cornflake'))
        message.author.send(new Discord.RichEmbed().setImage('https://cdn.discordapp.com/attachments/584466941817913364/598854232749375489/flaekfix.png'))

    
}   
getData()
})
bot.login(token)