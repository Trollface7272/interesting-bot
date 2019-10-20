const Discord = require('discord.js'),
nh = require('nhentai-js'),
rand = require('../functions/randomInt.js')
arr = require('../functions/arrayHelper')

module.exports = {
    async getBookInfo(newestBook, doRand) {
        if(doRand) var num = rand.random(1,newestBook)
        else var num = newestBook
        num = num.toString()
        if(nh.exists(num)) {
            return await nh.getDoujin(num)
            
        }else {
            module.exports.getBookInfo(newestBook)
        }
    },
    sendInfo(data) {
        if(data.details.tags != undefined) var tags = arr.arrayToString(data.details.tags)
        else var tags = 'None'
        if(data.details.characters != undefined) var characters = arr.arrayToString(data.details.characters)
        else var characters = 'None'
        if(data.details.parodies != undefined) var parodies = arr.arrayToString(data.details.parodies)
        else var parodies = 'None'
        if(data.details.artists != undefined) var artists = arr.arrayToString(data.details.artists)
        else var artists = 'None'
        if(data.details.languages != undefined) var languages = arr.arrayToString(data.details.languages)
        else var languages = 'None'
        if(data.details.categories != undefined) var categories = arr.arrayToString(data.details.categories)
        else var categories = 'None'


        var id = data.link.replace(/[^0-9]/g, '')
        var pages = data.pages.length
        var rich = new Discord.RichEmbed()
        .setTitle(data.title.replace(/ *\([^)]*\) */g, ""))
        .setURL(data.link)
        .setThumbnail(data.pages[0])
        .setDescription(
            `
            **ID:** \`${id}\`
            **Pages:** \`${pages}\`
            **Parodies:** \`${parodies}\`
            **Characters:** \`${characters}\`
            **Tags:** \`${tags}\`
            **Artists:** \`${artists}\`
            **Languages:** \`${languages}\`
            **Categories:**  \`${categories}\`
            `
        )
        return rich
    }
}