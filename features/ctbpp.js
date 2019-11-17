const Discord = require('discord.js')
const ctbpp = require("../Custom Library/ctbpp")
const osu = require("node-osu")
const osuStuff = require("../functions/getOsuStuff")
const moment = require('moment')
var osuApi = new osu.Api('d3bb61f11b973d6c2cdc0dd9ea7998c2a0b15c1e', {
    // baseUrl: sets the base api url (default: https://osu.ppy.sh/api)
    notFoundAsError: true, // Reject on not found instead of returning nothing. (default: true)
    completeScores: false // When fetching scores also return the beatmap (default: false)
})
module.exports = {
    async getCtbpp(message, bot) {
        let name = message.content.split(' ')[1]
        var rating, performance, title, accuracy, s300, s100, s50, miss, s50miss, difficulty, userCombo, approachRate, retries, 
            footer, playDate, now, pp, fcpp, fcPerformance, fcRating, fcAccuracy, fcppDisplay
        await osuApi.getUserRecent({u: name, m: '2', a: '1'}).then(async score => {
            let beatmapId = score[0].beatmapId
            await osuApi.getBeatmaps({b: beatmapId, m: '2', a: '1'}).then(async beatmap => {
                s300 = parseInt(score[0].counts['300']),
                s100 = parseInt(score[0].counts['100']),
                s50 = parseInt(score[0].counts['50']),
                miss = parseInt(score[0].counts['miss']),
                s50miss = parseInt(score[0].counts['katu']),
                difficulty = parseFloat(beatmap[0].difficulty.rating),
                userCombo = parseInt(score[0].maxCombo),
                approachRate = parseInt(beatmap[0].difficulty.approach),
                pp = new ctbpp(s300, s100, s50, s50miss, miss, difficulty, userCombo, approachRate, score[0]._mods, beatmapId)
                fcpp = new ctbpp(s300 + miss, s100, s50, s50miss, 0, difficulty, beatmap[0].maxCombo, approachRate, score[0]._mods, beatmapId)

                rankingEmoji = bot.emojis.get(osuStuff.getRankingEmote(score[0].rank))

                await Promise.resolve(pp.info).then(function(result) {
                    performance = result.pp
                    rating = result.rating.substring(0, 4)
                    accuracy = Math.round(result.accuracy * 10000) / 100
                })

                await Promise.resolve(fcpp.info).then(function(result) {
                    fcPerformance = result.pp
                    fcRating = result.rating.substring(0, 4)
                    fcAccuracy = Math.round(result.accuracy * 10000) / 100
                })
                
                if(score[0].counts.miss > 0 || score[0].maxCombo < beatmap[0].maxCombo - beatmap[0].maxCombo * 0.05) fcppDisplay = `(${(Math.round(fcPerformance * 100) / 100).toFixed(2)}PP for ${fcAccuracy}% FC) `
                else fcppDisplay = ''
                playDate = moment(score[0].raw_date)
                now = moment(new Date())
                hourDiff = now.diff(playDate, 'hours')
                minuteDiff = now.diff(playDate, 'minutes')
                secondDiff = now.diff(playDate, 'seconds')

                retries = osuStuff.getAmmountOfRetries(score)
                if(hourDiff > 0) footer =        `Try #${retries} | ${hourDiff} Hours ${minuteDiff % 60} Minutes ${secondDiff % 60} Seconds On osu! Official Server`
                else if(minuteDiff > 0) footer = `Try #${retries} | ${minuteDiff % 60} Minutes ${secondDiff % 60} Seconds On osu! Official Server`
                else if(secondDiff > 0) footer = `Try #${retries} | ${secondDiff % 60} Seconds On osu! Official Server`

                title = `${beatmap[0].title} [${beatmap[0].version}] +${osuStuff.getMods(osuStuff.getModsFromRaw(score[0].raw_mods))} [${rating}★]`

                var rich = new Discord.RichEmbed()
                .setAuthor(title, `https://a.ppy.sh/${score[0].user.id}`, `https://osu.ppy.sh/b/${beatmap[0].id}`)  
                .setDescription(`
                    ▸ ${rankingEmoji} ▸ **${(Math.round(performance * 100) / 100).toFixed(2)}PP** ${fcppDisplay}▸ ${accuracy}%
                    ▸ ${score[0].score} ▸ x${score[0].maxCombo}/${beatmap[0].maxCombo} ▸ [${score[0].counts['300']}/${score[0].counts['100']}/${score[0].counts['50']}/${score[0].counts['miss']}]
                `)
                .setThumbnail(`https://b.ppy.sh/thumb/${beatmap[0].beatmapSetId}.jpg`)
                .setFooter(footer)
                message.channel.send(`**Most Recent Catch the Beat! Play for ${name}:**`, rich)
            })
        })
        
    }
}