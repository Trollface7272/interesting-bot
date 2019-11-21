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
            await osuApi.getBeatmaps({b: beatmapId, m: gamemod, a: converts}).then(async beatmap => {
                var counts = score[0].counts
                let gainedCombo = score[0].maxCombo
                let maxCombo = beatmap[0].maxCombo
                var accuracy
                var fcPerformence
                var fcAccuracy
                if(gamemod == 0) {

                }
                if(gamemod == 1) {

                }
                if(gamemod == 2) {
                    await osuApi.apiCall('/get_beatmaps?mods='+score[0].raw_mods,{b: beatmapId, m: '2', a: '1'}).then(async beatmap1 => {
                        fcpp =  new ctbpp(counts['300'] + counts['miss'], counts['100'], counts['50'], counts['katu'], 0, beatmap1[0].difficultyrating, gainedCombo, beatmap[0].difficulty.approach, score[0].raw_mods, beatmapId)
                        
                        await Promise.resolve(fcpp.info).then(function(result){
                            fcPerformence = result.pp
                            fcAccuracy = Math.round(result.accuracy * 10000) / 100
                        })
                    })
                    let totalHits = parseInt(counts['50']) + parseInt(counts['100']) + parseInt(counts['300']) + parseInt(counts['katu']) + parseInt(counts['miss'])
                    let hits = parseInt(counts['50']) + parseInt(counts['100']) + parseInt(counts['300'])
                    accuracy = ((hits / totalHits) * 100).toFixed(2)
                }
                if(gamemod == 3) {

                }
                if(score[0].counts.miss > 0 || gainedCombo < maxCombo - maxCombo * 0.05) fcppDisplay = `(${(Math.round(fcPerformance * 100) / 100).toFixed(2)}PP for ${fcAccuracy}% FC) `
                else fcppDisplay = ''
                let beatmapName = beatmap[0].title
                let diffName = beatmap[0].version
                let rankingEmoji = bot.emojis.get(osuStuff.getRankingEmote(score[0].rank))
                let performance = parseInt(score[0].pp)
                let mods = osuStuff.getMods(osuStuff.getModsFromRaw(score[0].raw_mods))

                let author = `Top osu! ${mod} Plays for Trollface on ${beatmapName} [${diffName}]`
                let userPicture = `https://a.ppy.sh/${score[0].user.id}`
                let beatmapLink = `https://osu.ppy.sh/b/${beatmapId}`
                let description = 
`**1. \`${mods}\`** []
▸ ${rankingEmoji} ▸ **${performance.toFixed(2)}PP** ${fcppDisplay}▸ ${accuracy}%
▸ ${score[0].score} ▸ x${gainedCombo}/${maxCombo} ▸ [${counts['300']}/${counts['100']}/${counts['50']}/${counts['miss']}]`
                
    
                var rich = new Discord.RichEmbed()
                .setAuthor(author, userPicture, beatmapLink)
                .setDescription(description)
                message.channel.send(rich)
            })
        })
    }
}
function modName(modNum) {
    if(modNum == 0) return 'Standart'
    if(modNum == 1) return 'Taiko'
    if(modNum == 2) return 'Catch The Beat!'
    if(modNum == 3) return 'Mania'

}