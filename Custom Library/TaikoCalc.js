const osu = require("node-osu")
var osuApi = new osu.Api('d3bb61f11b973d6c2cdc0dd9ea7998c2a0b15c1e', {
    // baseUrl: sets the base api url (default: https://osu.ppy.sh/api)
    notFoundAsError: true, // Reject on not found instead of returning nothing. (default: true)
    completeScores: false // When fetching scores also return the beatmap (default: false)
})

class taikoCalc {
    
    async static getInfo() {
        return await getTotalpp()
        
    }
    static getTotalpp() {
        var HD,FL,NF
        var multiplier = 1.1

        if(NF) multiplier *= 0.90
        if(HD) multiplier *= 1.10
        
        var _totalValue = Math.pow(
            Math.pow(_strainValue, 1.1) +
            Math.pow(_accValue, 1.1), 1.0 / 1.1
        ) * multiplier
        return _totalValue
    }
}


module.exports = taikoCalc