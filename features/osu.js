const Discord = require('discord.js')
const ctbpp = require("../Custom Library/CtbCalc")
const osu = require("node-osu")
const osuStuff = require("../functions/getOsuStuff")
const moment = require('moment')
const db = require('../functions/database')
var osuApi = new osu.Api('d3bb61f11b973d6c2cdc0dd9ea7998c2a0b15c1e', {
    // baseUrl: sets the base api url (default: https://osu.ppy.sh/api)
    notFoundAsError: true, // Reject on not found instead of returning nothing. (default: true)
    completeScores: false // When fetching scores also return the beatmap (default: false)
})
module.exports = {
    async compare(message, bot, connection, uid) {
        compareF(connection, message, uid, bot, 3, false, '')
    }
}
function modName(modNum) {
    if(modNum == 0) return 'Standart'
    if(modNum == 1) return 'Taiko'
    if(modNum == 2) return 'Catch The Beat!'
    if(modNum == 3) return 'Mania'

}

async function compareF(connection, message, uid, bot, playsLimiter, edit, botMsg) {
    if(playsLimiter < 0) return
    let name = message.content.split(' ')[1]
        if(name == undefined) {
            let userData = await db.getData(connection, uid, 'osu')
            name = userData.osu_username
            if(name == null) return message.channel.send(`Please set your osu username or specify user.`)
        }
    var data = await db.getData(connection, message.guild.id, 'servers')
        var beatmapId = data.last_map_id
        var gamemod = data.last_map_game_mod
        var mod = modName(gamemod)

        var converts = 0
        if(gamemod > 0) converts = 1
        if(beatmapId == null || gamemod == null) return message.channel.send('So scores found in chat.')
    await osuApi.getScores({u: name, b: beatmapId, m: gamemod, a: converts}).then(async score => {
        var description = ''
        if(playsLimiter-3 >= score.length) return
        let plays = (score.length > playsLimiter) ? playsLimiter : score.length
        await osuApi.getBeatmaps({b: beatmapId, m: gamemod, a: converts}).then(async beatmap => {
            for(i = playsLimiter - 3; i < plays; i++) {
                var scoreLength = score.length
                var counts = score[i].counts
                let gainedCombo = score[i].maxCombo
                let maxCombo = beatmap[0].maxCombo
                var accuracy
                var fcPerformence
                var fcAccuracy
                var rating
                if(gamemod == 0) {

                }
                if(gamemod == 1) {

                }
                if(gamemod == 2) {
                    await osuApi.apiCall('/get_beatmaps?mods='+score[i].raw_mods,{b: beatmapId, m: '2', a: '1'}).then(async beatmap1 => {
                        fcpp =  new ctbpp(parseInt(counts['300']) + parseInt(counts['miss']), parseInt(counts['100']), parseInt(counts['50']), parseInt(counts['katu']), 0, beatmap1[0].difficultyrating, gainedCombo, beatmap[0].difficulty.approach, score[i].raw_mods, beatmapId)
                        
                        await Promise.resolve(fcpp.info).then(function(result){
                            fcPerformence = result.pp
                            fcAccuracy = (result.accuracy * 100).toFixed(2)
                            rating = parseFloat(result.rating).toFixed(2)
                        })
                    })
                    let totalHits = parseInt(counts['50']) + parseInt(counts['100']) + parseInt(counts['300']) + parseInt(counts['katu']) + parseInt(counts['miss'])
                    let hits = parseInt(counts['50']) + parseInt(counts['100']) + parseInt(counts['300'])
                    accuracy = ((hits / totalHits) * 100).toFixed(2)
                }
                if(gamemod == 3) {

                }
                fcppDisplay = (score[i].counts.miss > 0 || gainedCombo < maxCombo - maxCombo * 0.05) ? `(${fcPerformence.toFixed(2)}PP for ${fcAccuracy}% FC) ` : ''

                let playDate = moment(score[i].raw_date) //Play Date
                let now = moment(new Date())             //Now Date
                let diffAr = []

                //Get Date Differences
                diffObj = moment.duration(now.diff(playDate))
                yearDiff = diffObj._data.years
                monthDiff = diffObj._data.months
                dayDiff = diffObj._data.days
                hourDiff = diffObj._data.hours
                minuteDiff = diffObj._data.minutes
                secondDiff = diffObj._data.seconds

                //Fill diffAr if difference > 0
                if(yearDiff > 0) yearDiffFin = diffAr[diffAr.length] = yearDiff + ' Years '
                if(monthDiff > 0) diffAr[diffAr.length] = monthDiff + ' Months '
                if(dayDiff > 0) diffAr[diffAr.length] = dayDiff + ' Days '
                if(hourDiff > 0) diffAr[diffAr.length] = hourDiff + ' Hours '
                if(minuteDiff > 0) diffAr[diffAr.length] = minuteDiff + ' Minutes '
                if(secondDiff > 0) diffAr[diffAr.length] = secondDiff + ' Seconds '

                //Put 2 diffs into 1 final var
                let diffFin = diffAr[1] === undefined ? diffAr[0] : diffAr[0] + diffAr[1]

                let beatmapName = beatmap[0].title
                let diffName = beatmap[0].version
                let rankingEmoji = bot.emojis.get(osuStuff.getRankingEmote(score[i].rank))
                let performance = parseInt(score[i].pp)
                let mods = osuStuff.getMods(osuStuff.getModsFromRaw(score[i].raw_mods))
                
                var author = `Top ${mod} Plays for Trollface on ${beatmapName} [${diffName}]`
                var userPicture = `https://a.ppy.sh/${score[i].user.id}`
                var beatmapLink = `https://osu.ppy.sh/b/${beatmapId}`
                var thumbnail = `https://b.ppy.sh/thumb/${beatmap[0].beatmapSetId}.jpg`
                var footer = `On osu! Official Server | Page ${parseInt(plays / 3) + 1} of ${parseInt(score.length / 3) + 1}`

                description += 
`**${i+1}. \`${mods}\` Score** [${rating}★]
▸ ${rankingEmoji} ▸ **${performance.toFixed(2)}PP** ${fcppDisplay}▸ ${accuracy}%
▸ ${score[i].score} ▸ x${gainedCombo}/${maxCombo} ▸ [${counts['300']}/${counts['100']}/${counts['50']}/${counts['miss']}]
▸ Score Set ${diffFin} Ago\n`
            }
            var rich = new Discord.RichEmbed()
            .setAuthor(author, userPicture, beatmapLink)
            .setDescription(description)
            .setThumbnail(thumbnail)
            .setFooter(footer)
            if(!edit) send(rich, message, bot, connection, uid, playsLimiter, scoreLength, botMsg)
            else if(edit) editMsg(rich, botMsg)
            
        })
    })
}
function send(rich, msg, bot, connection, uid, playsLimiter, scoreLength, botMsg) {
    msg.channel.send(rich).then(function(message) {
        if(scoreLength < 3) return
        message.react('◀️').then(() => message.react('▶️'))
        let filter = (reaction, user) =>{ 
            return ['◀️', '▶️'].includes(reaction.emoji.name) && user.id != bot.user.id
        }
        const collector = message.createReactionCollector(filter, { time: 15000 })
        collector.on('collect', (reaction, reactionCollector) => {
            if(reaction._emoji.name == '▶️') {
                playsLimiter += 3
                compareF(connection, msg, uid, bot, playsLimiter, true, message)
            }
            if(reaction._emoji.name == '◀️') {
                playsLimiter -= 3
                compareF(connection, msg, uid, bot, playsLimiter, true, message)
            }
            
        })
    })
}
function editMsg(rich, message) {
    message.edit(rich)
}