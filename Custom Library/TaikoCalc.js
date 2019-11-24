const osu = require("node-osu")
var osuApi = new osu.Api('d3bb61f11b973d6c2cdc0dd9ea7998c2a0b15c1e', {
    // baseUrl: sets the base api url (default: https://osu.ppy.sh/api)
    notFoundAsError: true, // Reject on not found instead of returning nothing. (default: true)
    completeScores: false // When fetching scores also return the beatmap (default: false)
})

class taikoCalc {
    constructor(num300, num100, num50, numMiss, rating) {
        this.num300 = num300
        this.num100 = num100
        this.num50 = num50
        this.numMiss = numMiss
        this.rating = rating
    }
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
    static getStrainValue() {
        var _strainValue = pow(5.0 * Math.max(1.0, rating / 0.0075) - 4.0, 2.0) / 100000.0

        // Longer maps are worth more
        var lengthBonus = 1 + 0.1 * Math.min(1.0, TotalHits() / 1500.0)
        _strainValue *= lengthBonus

        _strainValue *= pow(0.985, numMiss);
        maxCombo = beatmap.DifficultyAttribute(_mods, MaxCombo);
    }
    static TotalHits()
    {
	    return num50 + num100 + num300 + numMiss;
    }
}


module.exports = taikoCalc


