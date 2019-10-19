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
    }
}