const pref = require('./prefix')
const credits = require('./credits')
const spin = require('./spin')
const rand = require('../functions/randomInt')

module.exports = {
    commands(messageContent, message, connection, discordServerId, discordClientId, prefix, userData, db) {
        if(messageContent.startsWith(`${prefix}changeprefix`))
            pref.setPrefix(messageContent, message, connection, discordServerId)

        if(messageContent.startsWith(`${prefix}daily`)) 
            credits.dailyCredits(connection, userData, discordClientId, db, message)

        if(messageContent.startsWith(`${prefix}flip`))
            spin.spin(message, rand.random(0,10))

        if(messageContent.startsWith(`${prefix}nh`) &&
           messageContent.split(' ').length == 1) {
            let rich = await nhm.getBookInfo(newestBook.toString(), true)
            rich = await nhm.sendInfo(rich)
            message.channel.send(rich)
         }
        if(messageContent.startsWith(`${prefix}nh`) &&
           messageContent.split(' ').length == 2) {
            var rich = await nhm.getBookInfo(messageContent.split(' ')[1], false)
            rich = await nhm.sendInfo(rich)
            message.channel.send(rich)
        }
    }
}