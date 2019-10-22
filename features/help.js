const Discord = require('discord.js')
module.exports = {
    help(message, prefix) {
        var embed = new Discord.RichEmbed()
        .setTitle(
            `List of all commands:`
        )
        .setDescription(
            `
            \`${prefix}nh, ${prefix}flip, ${prefix}rule34, ${prefix}safebooru, ${prefix}danbooru
            ${prefix}changeprefix, $resetprefix
            ${prefix}daily, ${prefix}credits
            ${prefix}messages
            ${prefix}help\`
            `
        ) 
        message.channel.send(embed)
    }
}