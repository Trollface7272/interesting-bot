const pref = require('./prefix')
const credits = require('./credits')
const spin = require('./spin')
const rand = require('../functions/randomInt')
const help = require('./help')
const nhm = require('./nh')
const booru = require('./boorus')

module.exports = {
    async commands(messageContent, message, connection, discordServerId, discordClientId, prefix, userData, db, newestBook) {
        if(messageContent.startsWith(`${prefix}changeprefix`))
            pref.setPrefix(messageContent, message, connection, discordServerId)

        if(messageContent.startsWith(`${prefix}daily`)) 
            credits.dailyCredits(connection, userData, discordClientId, db, message)

        if(messageContent.startsWith(`${prefix}flip`))
            spin.spin(message, messageContent, rand.random(0,10), userData, connection, discordClientId)

        if(messageContent == `${prefix}help`)
            help.help(message, prefix)

        if(messageContent == `${prefix}invite`)
            message.channel.send('https://discordapp.com/oauth2/authorize?client_id=585173544963670027&scope=bot&permissions=8')

        if(messageContent.startsWith(`${prefix}rule34`))
            booru.search(message, messageContent, 'rule34')

        if(messageContent.startsWith(`${prefix}safebooru`))
            booru.search(message, messageContent, 'safebooru.org')

        if(messageContent == `${prefix}messages`)
            message.channel.send(`You sent ${userData.message_count} messages.`)

        if(messageContent == `${prefix}credits`)
            message.channel.send(`You have ${userData.credits} credits.`)

        if(messageContent == `${prefix}nwords`)
            message.channel.send(`You said the nword ${userData.nwords} times`)

        if(messageContent == `${prefix}disablepms` || messageContent == `${prefix}disabledms`)
            db.update(connection, 'users', discordClientId, {disable_dms: !userData.disable_dms})

        if(messageContent.startsWith(`${prefix}nh`) &&
           messageContent.split(' ').length == 1) {
            if(!message.channel.nsfw){ message.channel.send('This channel in not NSFW channel'); return }
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