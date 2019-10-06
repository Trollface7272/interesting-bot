const Discord = require('discord.js')
const bot = new Discord.Client()
const token = 'NjMwNDQwMDE1NDk0NjQzNzE2.XZoVEA.M-bT3NzYj9ifs1YOxtqCnsibdCs'

bot.on('ready', () => 
{
    console.log( `Logged in as  ${bot.user.tag}` )
} )

bot.on('message', function(message)
{
    function getRndInteger(min, max) {
        return Math.floor(Math.random() * (max - min) ) + min;
    }


    var messageContent = message.content.toLowerCase();
    if(messageContent === '$flip')
    {
        x = getRndInteger(0,10)
        console.log(x)

        const spin = new Discord.RichEmbed()
        .setTitle('Flipping a Dildo')
        if(x < 1) spin.setImage('https://i.imgur.com/Uso14fn.gif')
        if(x < 5 && x >= 1) spin.setImage('https://i.imgur.com/HRzBAB5.gif')
        if(x == 5) spin.setImage('https://i.imgur.com/ACBDimh.gif')
        if(x > 5) spin.setImage('https://i.imgur.com/qfwAbgL.gif')

        message.channel.send(spin)
    }
}
)











bot.login(token);