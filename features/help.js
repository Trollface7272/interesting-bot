const Discord = require('discord.js')
module.exports = {
    help(message, prefix) {
        var embed = new Discord.RichEmbed()
        .setTitle(
            `List of all commands:`
        )
        .setDescription(
            `
            \`${prefix}nh, ${prefix}flip 
            ${prefix}changeprefix, $resetprefix
            ${prefix}daily 
            ${prefix}help\`
            `
        ) 
        message.channel.send(embed)
    }
}