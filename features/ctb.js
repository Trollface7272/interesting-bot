const Discord = require('discord.js')
const ctbpp = require("../Custom Library/ctbpp")
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
    async getCtbpp(message, bot, connection, uid) {
        let name = message.content.split(' ')[1]
        if(name == undefined) {
            let userData = await db.getData(connection, uid, 'osu')
            name = userData.osu_username
            if(name == null) return message.channel.send(`Please set your osu username or specify user.`)
        }
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
                hourDiffFin = ''
                minuteDiffFin = ''
                secondDiffFin = ''

                retries = osuStuff.getAmmountOfRetries(score)
                if(hourDiff > 0) hourDiffFin = hourDiff + ' Hours '
                else if(minuteDiff > 0 || hourDiff > 0) minuteDiffFin = minuteDiff % 60 + ' Minutes '
                else if(secondDiff > 0 || minuteDiff > 0 && hourDiff <  0 ) secondDiffFin = secondDiff % 60 + ' Seconds'
                diffFin = hourDiffFin + minuteDiffFin + secondDiffFin
                footer =`Try #${retries} | ${diffFin} Seconds On osu! Official Server`
                
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
        
    },
    async getCtbTopPlays(message, bot, connection, uid) {
        let name = message.content.split(' ')[1]
        if(name == undefined) {
            let userData = await db.getData(connection, uid, 'osu')
            name = userData.osu_username
            if(name == null) return message.channel.send(`Please set your osu username or specify user.`)
        }
        await osuApi.getUserBest({u: name, m: '2', a: '1'}).then(async score => {
            
            var title, content, rich, country, j, fcPerformance, fcRating, fcAccuracy, rankingEmoji, accuracy
            j = 1
            content = ''
            for(i = 0; i < 5; i++) {
                await osuApi.apiCall('/get_beatmaps?mods='+score[i].raw_mods,{b: score[i].beatmapId, m: '2', a: '1'}).then(async beatmap => {
                    accuracy = Accuracy(score[i].counts['50'], score[i].counts['100'], score[i].counts['300'], score[i].counts['katu'], score[i].counts['miss'])
                    fcpp = new ctbpp(score[i].counts['300'] + score[i].counts['miss'], score[i].counts['100'], score[i].counts['50'], score[i].counts['katu'], 0, beatmap[0].difficultyrating, beatmap[0].maxCombo, beatmap[0].diff_approach, score[i]._mods, beatmap[0].beatmap_id)
                    rankingEmoji = bot.emojis.get(osuStuff.getRankingEmote(score[0].rank))

                    await Promise.resolve(fcpp.info).then(function(result) {
                        fcPerformance = result.pp
                        fcRating = result.rating.substring(0, 4)
                        fcAccuracy = Math.round(result.accuracy * 10000) / 100
                    })
                    playDate = moment(score[i].raw_date)
                    now = moment(new Date())
                    now.subtract(1, 'hours')
                    diffObj = moment.duration(now.diff(playDate))
                    yearDiff = diffObj._data.years
                    monthDiff = diffObj._data.months
                    dayDiff = diffObj._data.days
                    hourDiff = diffObj._data.hours
                    minuteDiff = diffObj._data.minutes
                    secondDiff = diffObj._data.seconds
                    
                    console.log(diffObj._data)

                    yearDiffFin = ''
                    monthDiffFin = ''
                    dayDiffFin = ''
                    hourDiffFin = ''
                    minuteDiffFin = ''
                    secondDiffFin = ''
                    diffAr = []

                    if(yearDiff > 0) yearDiffFin = diffAr[diffAr.length] = yearDiff + ' Years '
                    if(monthDiff > 0) diffAr[diffAr.length] = ' Months '
                    if(dayDiff > 0) diffAr[diffAr.length] = dayDiff + ' Days '
                    if(hourDiff > 0) diffAr[diffAr.length] = hourDiff + ' Hours '
                    if(minuteDiff > 0) diffAr[diffAr.length] = minuteDiff + ' Minutes '
                    if(secondDiff > 0) diffAr[diffAr.length] = secondDiff + ' Seconds '
                    diffFin = diffAr[0] + diffAr[1]
                    
                    if(score[i].counts.miss > 0 || score[i].maxCombo < beatmap[0].maxCombo - beatmap[0].maxCombo * 0.05) fcppDisplay = `(${(Math.round(fcPerformance * 100) / 100).toFixed(2)}PP for ${fcAccuracy}% FC) `
                    else fcppDisplay = ''
                    content += 
                        `**${j}. [${beatmap[0].title} [${beatmap[0].version}]](https://osu.ppy.sh/beatmapsets/${beatmap[0].beatmapset_id}#fruits/${beatmap[0].beatmap_id}) +${osuStuff.getMods(osuStuff.getModsFromRaw(score[i].raw_mods))}** [${parseFloat(beatmap[0].difficultyrating).toFixed(2)}★]
                        ▸ ${rankingEmoji} ▸ **${(Math.round(score[i].pp * 100) / 100).toFixed(2)}PP** ${fcppDisplay}▸ ${accuracy}%
                        ▸ ${score[i].score} ▸ x${score[i].maxCombo}/${beatmap[0].max_combo} ▸ [${score[i].counts['300']}/${score[i].counts['100']}/${score[i].counts['50']}/${score[i].counts['miss']}]
                        ▸Score Set ${diffFin}Ago \n`
                    j++
                })
            }
            osuApi.getUser({u: name, m: '2'}).then(user => {
                country = user.country
                rich = new Discord.RichEmbed()
                .setAuthor(`Top 5 Catch the Beat! Plays for ${user.name}`, `https://osu.ppy.sh//images/flags/${country}.png`, `https://osu.ppy.sh/users/${user.id}/fruits`)
                .setDescription(content)
                .setThumbnail(`https://a.ppy.sh/8398988${user.id}`)
                .setFooter('On osu! Official Server')
                message.channel.send(rich)
            })
        })
    }
}

function Accuracy(num50, num100, num300, num50Miss, numMiss) {
    return (((parseInt(num50) + parseInt(num100) + parseInt(num300)) / (parseInt(num50) + parseInt(num100) + parseInt(num300) + parseInt(num50Miss) + parseInt(numMiss))) * 100).toFixed(2)
}
