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
    async getCtbpp(message, bot, connection, uid) {
        let name = message.content.split(' ')[1]
        if(name == undefined) {
            let userData = await db.getData(connection, uid, 'osu')
            name = userData.osu_username
            if(name == null) return message.channel.send(`Please set your osu username or specify user.`)
        }

        await osuApi.getUserRecent({u: name, m: '2', a: '1'}).then(async score => {
            let beatmapId = score[0].beatmapId
            var diffAr = []
            db.update(connection, 'servers', message.guild.id, {last_map_id: beatmapId, last_map_game_mod: 2})
            await osuApi.getBeatmaps({b: beatmapId, m: '2', a: '1'}).then(async beatmap => {
                //Counts
                let s300 = parseInt(score[0].counts['300']),
                s100 = parseInt(score[0].counts['100']),
                s50 = parseInt(score[0].counts['50']),
                miss = parseInt(score[0].counts['miss']),
                s50miss = parseInt(score[0].counts['katu']),
                userCombo = parseInt(score[0].maxCombo),
                approachRate = parseInt(beatmap[0].difficulty.approach),
                difficulty = parseFloat(beatmap[0].difficulty.rating),

                pp = new ctbpp(s300, s100, s50, s50miss, miss, difficulty, userCombo, approachRate, score[0].raw_mods, beatmapId)
                
                //Emoji as Play Mark
                let rankingEmoji = bot.emojis.get(osuStuff.getRankingEmote(score[0].rank))

                //Get Play Info
                var performance, rating, accuracy
                await Promise.resolve(pp.info).then(function(result) {
                    performance = result.pp
                    rating = result.rating.substring(0, 4)
                    accuracy = Math.round(result.accuracy * 10000) / 100
                })

                //Get fc Info
                var fcPerformance, fcAccuracy
                await Promise.resolve(pp.fcinfo).then(function(result) {
                    fcPerformance = result.pp
                    fcAccuracy = Math.round(result.accuracy * 10000) / 100
                })

                var fcppDisplay
                if(score[0].counts.miss > 0 || score[0].maxCombo < beatmap[0].maxCombo - beatmap[0].maxCombo * 0.05) fcppDisplay = `(${(Math.round(fcPerformance * 100) / 100).toFixed(2)}PP for ${fcAccuracy}% FC) `
                else fcppDisplay = ''

                let playDate = moment(score[0].raw_date) //Play Date
                let now = moment(new Date())             //Now Date
                
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
                if(monthDiff > 0) diffAr[diffAr.length] = ' Months '
                if(dayDiff > 0) diffAr[diffAr.length] = dayDiff + ' Days '
                if(hourDiff > 0) diffAr[diffAr.length] = hourDiff + ' Hours '
                if(minuteDiff > 0) diffAr[diffAr.length] = minuteDiff + ' Minutes '
                if(secondDiff > 0) diffAr[diffAr.length] = secondDiff + ' Seconds '

                //Put 2 diffs into 1 final var
                let diffFin = diffAr[0] + diffAr[1]

                //Get retries
                let retries = osuStuff.getAmmountOfRetries(score)
                

                //Footer
                let footer =`Try #${retries} | ${diffFin}On osu! Official Server`
                
                //Title
                let title = `${beatmap[0].title} [${beatmap[0].version}] +${osuStuff.getMods(osuStuff.getModsFromRaw(score[0].raw_mods))} [${rating}★]`
                
                //User Picture
                let userPicture = `https://a.ppy.sh/${score[0].user.id}`

                //Beatmap Link
                let beatmapLink = `https://osu.ppy.sh/b/${beatmap[0].id}`

                //Description
                let description = 
`▸ ${rankingEmoji} ▸ **${(Math.round(performance * 100) / 100).toFixed(2)}PP** ${fcppDisplay}▸ ${accuracy}%
▸ ${score[0].score} ▸ x${score[0].maxCombo}/${beatmap[0].maxCombo} ▸ [${score[0].counts['300']}/${score[0].counts['100']}/${score[0].counts['50']}/${score[0].counts['miss']}]`
       
                //Thumbnail
                let thumbnail = `https://b.ppy.sh/thumb/${beatmap[0].beatmapSetId}.jpg`

                //Create Rich Embed and Style It
                var rich = new Discord.RichEmbed()
                .setAuthor(title, userPicture, beatmapLink)  
                .setDescription(description)
                .setThumbnail(thumbnail)
                .setFooter(footer)

                //Send The Rich Embed
                message.channel.send(`**Most Recent Catch the Beat! Play for ${name}:**`, rich)
            })
        })
        
    },
    async getCtbTopPlays(message, bot, connection, uid) {
        //Get Name From Message
        let name = message.content.split(' ')[1]

        //If Name is Not in Message Try to Get It From Database
        if(name == undefined) {
            let userData = await db.getData(connection, uid, 'osu')
            name = userData.osu_username
            //If There Isn't Name Set In Database Return
            if(name == null) return message.channel.send(`Please set your osu username or specify user.`)
        }
        await osuApi.getUserBest({u: name, m: '2', a: '1'}).then(async score => {
            db.update(connection, 'servers', message.guild.id, {last_map_id: score[0].beatmapId, last_map_game_mod: 2})            
            var j = 1,
            content = '',
            diffAr = []
            for(i = 0; i < 5; i++) {
                await osuApi.apiCall('/get_beatmaps?mods='+score[i].raw_mods,{b: score[i].beatmapId, m: '2', a: '1'}).then(async beatmap => {
                    //Get play accuracy 
                    let accuracy = Accuracy(score[i].counts['50'], score[i].counts['100'], score[i].counts['300'], score[i].counts['katu'], score[i].counts['miss'])
                    
                    //Get fc Data
                    let fcpp = new ctbpp(score[i].counts['300'] + score[i].counts['miss'], score[i].counts['100'], score[i].counts['50'], score[i].counts['katu'], 0, beatmap[0].difficultyrating, beatmap[0].maxCombo, beatmap[0].diff_approach, score[i]._mods, beatmap[0].beatmap_id)
                    
                    //Get emojis for play performance (X, XH, S, SH...)
                    let rankingEmoji = bot.emojis.get(osuStuff.getRankingEmote(score[0].rank))

                    //Get fc Values
                    let fcPerformance, fcAccuracy
                    await Promise.resolve(fcpp.info).then(function(result) {
                        fcPerformance = result.pp
                        fcAccuracy = Math.round(result.accuracy * 10000) / 100
                    })
                    
                    let playDate = moment(score[i].raw_date) //Date the play was set
                    let now = moment(new Date())             //Local time
                    
                    //Difference in dates
                    diffObj = moment.duration(now.diff(playDate))
                    yearDiff = diffObj._data.years
                    monthDiff = diffObj._data.months
                    dayDiff = diffObj._data.days
                    hourDiff = diffObj._data.hours
                    minuteDiff = diffObj._data.minutes
                    secondDiff = diffObj._data.seconds

                    //Fill array with values that are > 0 
                    if(yearDiff > 0) yearDiffFin = diffAr[diffAr.length] = yearDiff + ' Years '
                    if(monthDiff > 0) diffAr[diffAr.length] = ' Months '
                    if(dayDiff > 0) diffAr[diffAr.length] = dayDiff + ' Days '
                    if(hourDiff > 0) diffAr[diffAr.length] = hourDiff + ' Hours '
                    if(minuteDiff > 0) diffAr[diffAr.length] = minuteDiff + ' Minutes '
                    if(secondDiff > 0) diffAr[diffAr.length] = secondDiff + ' Seconds '

                    //Use first 2 values in time display
                    diffFin = diffAr[0] + diffAr[1]

                    //Display pp for fc only when play contains miss / has 5% lower combo then max combo
                    if(score[i].counts.miss > 0 || score[i].maxCombo < beatmap[0].maxCombo - beatmap[0].maxCombo * 0.05) fcppDisplay = `(${(Math.round(fcPerformance * 100) / 100).toFixed(2)}PP for ${fcAccuracy}% FC) `
                    else fcppDisplay = ''
                    
                    //Content of Rich Embed
                    content += 
`**${j}. [${beatmap[0].title} [${beatmap[0].version}]](https://osu.ppy.sh/beatmapsets/${beatmap[0].beatmapset_id}#fruits/${beatmap[0].beatmap_id}) +${osuStuff.getMods(osuStuff.getModsFromRaw(score[i].raw_mods))}** [${parseFloat(beatmap[0].difficultyrating).toFixed(2)}★]
▸ ${rankingEmoji} ▸ **${(Math.round(score[i].pp * 100) / 100).toFixed(2)}PP** ${fcppDisplay}▸ ${accuracy}%
▸ ${score[i].score} ▸ x${score[i].maxCombo}/${beatmap[0].max_combo} ▸ [${score[i].counts['300']}/${score[i].counts['100']}/${score[i].counts['50']}/${score[i].counts['miss']}]
▸ Score Set ${diffFin}Ago \n`
                    j++
                })
            }
            osuApi.getUser({u: name, m: '2'}).then(user => {
                let description = content
                let author = `Top 5 Catch the Beat! Plays for ${user.name}`
                let flag = `https://osu.ppy.sh//images/flags/${user.country}.png`
                let profile = `https://osu.ppy.sh/users/${user.id}/fruits`
                let thumb = `https://a.ppy.sh/${user.id}`
                let footer = `On osu! Official Server`
            
                //Define and Style Rich Embed
                let rich = new Discord.RichEmbed()
                .setAuthor(author, flag, profile)
                .setDescription(description)
                .setThumbnail(thumb)
                .setFooter(footer)

                //Send Riche Embed
                message.channel.send(rich)
            })
        })
    },
    async getCtbUser(message, bot, connection, uid) {
        let name = message.content.split(' ')[1]
        if(name == undefined) {
            let userData = await db.getData(connection, uid, 'osu')
            name = userData.osu_username
            if(name == null) return message.channel.send(`Please set your osu username or specify user.`)
        }
        osuApi.getUser({u: name, m: '2', a: '1'}).then(user => {
            let author = `Catch the Beat! Profile for ${user.name}`
            let flag = `https://osu.ppy.sh//images/flags/${user.country}.png`
            let profile = `https://osu.ppy.sh/users/${user.id}/fruits`
            let level = (parseFloat('0.' + user.level.split('.')[1]) * 100).toFixed(2)
            let footer = `On osu! Official Server`
            let thumb = `https://a.ppy.sh/${user.id}`
            let content = 
`▸ **Official Rank:** #${user.pp.rank} (CZ#${user.pp.countryRank})
▸ **Level:** ${user.level} (${level}%)
▸ **Total PP:** ${user.pp.raw}
▸ **Hit Accuracy:** ${parseFloat(user.accuracy).toFixed(2)}%
▸ **Playcount:** ${user.counts['plays']}`

            //Define and Style Rich Embed
            rich = new Discord.RichEmbed()
            .setThumbnail(thumb)
            .setAuthor(author, flag, profile)
            .setDescription(content)
            .setFooter(footer)

            //Send Rich Embed
            message.channel.send(rich)
        })
    }
}
function Accuracy(num50, num100, num300, num50Miss, numMiss) {
    return (((parseInt(num50) + parseInt(num100) + parseInt(num300)) / (parseInt(num50) + parseInt(num100) + parseInt(num300) + parseInt(num50Miss) + parseInt(numMiss))) * 100).toFixed(2)
}
