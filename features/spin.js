const Discord = require('discord.js')
const bot = new Discord.Client()
module.exports = {
    spin(message, x){
        const spin = new Discord.RichEmbed()
        .setTitle('Flipping a Dildo')
        if(x < 1) spin.setImage('https://i.imgur.com/Uso14fn.gif')
        if(x < 5 && x >= 1) spin.setImage('https://i.imgur.com/HRzBAB5.gif')
        if(x == 5) spin.setImage('https://i.imgur.com/ACBDimh.gif')
        if(x > 5) spin.setImage('https://i.imgur.com/qfwAbgL.gif')
        message.channel.send(spin)
    }
}