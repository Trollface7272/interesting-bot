const Discord = require('discord.js'),
booru = require('booru'),
arr = require('../functions/arrayHelper')
module.exports = {
    async search(message, messageContent, site) {
        if(!message.channel.nsfw){ message.channel.send('This channel in not NSFW channel'); return }
        let messageArray = messageContent.split(' ')
        if(messageArray.length == 1)
        await booru.search(site,['cute'],{random: true}).then(images => {
            for (let image of images) {
                let embed = new Discord.RichEmbed()
                .setImage(image.fileUrl)
                .setTitle(
                    `( ͡° ͜ʖ ͡°)`
                )
                .setURL(
                    `https://rule34.xxx/index.php?page=post&s=view&id=${image.id}`
                )
                message.channel.send(embed)
            }
        })
        else
        await booru.search(site,arr.removeFirst(messageContent),{random: true}).then(images => {
            for (let image of images) {
                let embed = new Discord.RichEmbed()
                .setImage(image.fileUrl)
                .setTitle(
                    `( ͡° ͜ʖ ͡°)`
                )
                .setURL(
                    `https://rule34.xxx/index.php?page=post&s=view&id=${image.id}`
                )
                message.channel.send(embed)
            }
        })
    }
}