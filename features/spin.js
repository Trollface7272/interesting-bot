const Discord = require('discord.js')
const bot = new Discord.Client()
const db = require('../functions/database')
module.exports = {
    spin(message, messageContent, x, userData, connection, clientId){
        var msg = messageContent.split(' ')
        let credits = userData.credits
        if(msg.length != 1)
        {
            if(credits < msg[1]) return message.channel.send('Not enough credits.')
            if(x <= 5) credits = credits - msg[1]
            if(x > 5) credits = credits + msg[1]
            db.update(connection, 'users', clientId, {credits: credits})
        }

        const spin = new Discord.RichEmbed()
        .setTitle('Flipping a Dildo')
        if(x < 1) spin.setImage('https://i.imgur.com/Uso14fn.gif')
        if(x < 5 && x >= 1) spin.setImage('https://i.imgur.com/HRzBAB5.gif')
        if(x == 5) spin.setImage('https://i.imgur.com/ACBDimh.gif')
        if(x > 5) spin.setImage('https://i.imgur.com/qfwAbgL.gif')
        
        
        message.channel.send(spin)
    }
}