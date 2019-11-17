const osu = require("node-osu")
var osuApi = new osu.Api('d3bb61f11b973d6c2cdc0dd9ea7998c2a0b15c1e', {
    // baseUrl: sets the base api url (default: https://osu.ppy.sh/api)
    notFoundAsError: true, // Reject on not found instead of returning nothing. (default: true)
    completeScores: false // When fetching scores also return the beatmap (default: false)
})
class ctbplaypp {
    constructor(num300, num100, num50, num50Miss, numMiss, rating, _combo, approachRate, mods, beatmapId) {
        this.num300 = num300
        this.num100 = num100
        this.num50 = num50
        this.num50Miss = num50Miss
        this.numMiss = numMiss
        this.rating = rating
        this._combo = _combo
        this.approachRate = approachRate
        this.mods = mods
        this.beatmapId = beatmapId
        this.info = this.getInfo()
    }
    async getInfo() {
        var _value,
        maxCombo,
        lengthBonus,
        starMods,
        HD,
        FL,
        NF,
        DT,
        HR,
        EZ,
        HT,
        NC

        let num300 = this.num300,
        num100 = this.num100,
        num50 = this.num50,
        num50Miss = this.num50Miss,
        numMiss = this.numMiss,
        rating = this.rating,
        _combo = this._combo,
        approachRate = this.approachRate,
        mods = this.mods,
        beatmapId = this.beatmapId
        HD = false,
        FL = false,
        NF = false,
        DT = false,
        HR = false,
        EZ = false,
        HT = false,
        NC = false

        //Get Mods Used
        await GetRating()

        //pp For Aim
        _value = Math.pow(5.0 * max(1.0, rating / 0.0049) - 4.0, 2.0) / 100000.0

        maxCombo = TotalComboHits()
        
        //Calculate Length Bonus
        lengthBonus = 0.95 + 0.4 * Math.min(1.0, maxCombo / 3000.0) + (maxCombo > 3000 ? Math.log10(maxCombo / 3000.0) * 0.5 : 0.0)
        
        //Add Length Bonus
        _value *= lengthBonus

        //Miss Punishment
        _value *= Math.pow(0.97, numMiss);

        //Combo Break Penalty
        _value *= (Math.pow(_combo / maxCombo, 0.8))

        //Approach rate bonus
        if(approachRate > 9) _value *= 1 + 0.1 * (approachRate - 9)
        else if(approachRate < 8) _value *= 1 + 0.025 * (8 - approachRate)

        //Mods Multiplayers
        if(HD) _value *= 1.05 + 0.075 * (10.0 - min(10, approachRate))
        if(FL) _value *= 1.35 * lengthBonus
        if(NF) _value *= 0.90

        //Scale Accuracy
        _value *= Math.pow(Accuracy(), 5.5)

        return {
            pp: _value,
            rating: rating,
            accuracy: Accuracy()
        }  

        async function GetRating() {
            await osuApi.apiCall('/get_beatmaps?mods='+mods, {b: beatmapId, m: 2, a: 1}).then(score => {
                rating = score[0].difficultyrating
            });
        }

        function TotalComboHits() {
            return num300 + num100 + numMiss;
        }

        function Accuracy() {
            return TotalSuccessfulHits() / TotalHits()
        }

        function TotalSuccessfulHits() {
            return num50 + num100 + num300
        }

        function TotalHits() {
            return num50 + num100 + num300 + num50Miss + numMiss
        }
    } 
}
module.exports = ctbplaypp;


function max(a, b) {
    if (a > b) return a
    else return b
}

function min(a, b) {
    if (a < b) return a
    else return b
}

