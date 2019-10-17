const Discord = require('discord.js')
const nh = require('nhentai-js'),
rand = require('../functions/randomInt.js')

module.exports = {
    async getBookInfo(newestBook) {
        let num = rand.random(1,newestBook)
        num = num.toString()
        if(nh.exists(num)) {
            return await nh.getDoujin(num)
            
        }else {
            module.exports.getBookInfo(newestBook)
        }
    },
    sendInfo(data) {
        var rich = new Discord.RichEmbed()
        .setTitle(data.title)
        .setURL(data.link)
        module.exports.tagsToString(data.details.tags)
        return rich
    },
    tagsToString(tags) {
        var list = ''
        for(var i = 0; i < tags.length; i++) {
            list = `${list},${tags[i]}` 
        }
        list.replace('()123456789', '')
        console.log(list)
        return list
    }
}