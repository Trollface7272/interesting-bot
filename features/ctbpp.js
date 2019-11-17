const Discord = require('discord.js')
const ctbpp = require("../Custom Library/ctbpp")
const osu = require("node-osu")
var osuApi = new osu.Api('d3bb61f11b973d6c2cdc0dd9ea7998c2a0b15c1e', {
    // baseUrl: sets the base api url (default: https://osu.ppy.sh/api)
    notFoundAsError: true, // Reject on not found instead of returning nothing. (default: true)
    completeScores: false // When fetching scores also return the beatmap (default: false)
})
module.exports = {
    getCtbpp(message) {
        let name = message.content.split(' ')[1]
        
        osuApi.getUserRecent({u: name, m: '2', a: '1'}).then(score => {
            let beatmapId = score[0].beatmapId
            osuApi.getBeatmaps({b: beatmapId, m: '2', a: '1'}).then(beatmap => {
                var s300 = parseInt(score[0].counts['300']),
                s100 = parseInt(score[0].counts['100']),
                s50 = parseInt(score[0].counts['50']),
                miss = parseInt(score[0].counts['miss']),
                s50miss = parseInt(score[0].counts['katu']),
                difficulty = parseFloat(beatmap[0].difficulty.rating),
                userCombo = parseInt(score[0].maxCombo),
                approachRate = parseInt(beatmap[0].difficulty.approach)
                var pp = new ctbpp(s300, s100, s50, s50miss, miss, difficulty, userCombo, approachRate, [''])
                var rich = new Discord.RichEmbed()
                .setTitle(`Most Recent Play For ${name}`)
                .setDescription(`
                    map: ${beatmap[0].title}
                    pp: ${pp.pp}
                `)
                message.channel.send(rich)
            })
        })
        
    }
}