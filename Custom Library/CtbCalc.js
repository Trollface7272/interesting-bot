const osu = require("node-osu")
var osuApi = new osu.Api('d3bb61f11b973d6c2cdc0dd9ea7998c2a0b15c1e', {
    // baseUrl: sets the base api url (default: https://osu.ppy.sh/api)
    notFoundAsError: true, // Reject on not found instead of returning nothing. (default: true)
    completeScores: false // When fetching scores also return the beatmap (default: false)
})
class ctbCalc {
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
        this.info = this.getInfo(false)
        this.fcinfo = this.getInfo(true)
    }
    async getInfo(fc) {
        var approachRate = this.approachRate,
        mods = this.mods,
        beatmapId = this.beatmapId,
        rating = this.rating,
        num100 = this.num100,
        num50 = this.num50,
        num50Miss = this.num50Miss

        var modsByNames = getModsFromRaw(mods)
    let HD = modsByNames.includes('Hidden') ? true : false,
        FL = modsByNames.includes('Flashlight') ? true : false,
        NF = modsByNames.includes('NoFail') ? true : false

        if(modsByNames.includes('NoFail')) mods -= 1
        if(modsByNames.includes('Hidden')) mods -= 8
        if(modsByNames.includes('Flashlight')) mods -= 1024


        if(!fc) {
            var num300 = this.num300,
            numMiss = this.numMiss,
            _combo = this._combo
        }else if(fc) {
            var num300 = this.num300 + this.numMiss,
            numMiss = 0,
            _combo = TotalComboHits()
        }

        //Get Mods Used
        await GetRating()

        //pp For Aim
        let _value = Math.pow(5.0 * max(1.0, rating / 0.0049) - 4.0, 2.0) / 100000.0

        let maxCombo = TotalComboHits()
        
        //Calculate Length Bonus
        let lengthBonus = 0.95 + 0.4 * Math.min(1.0, maxCombo / 3000.0) + (maxCombo > 3000 ? Math.log10(maxCombo / 3000.0) * 0.5 : 0.0)
        
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
        function getModsFromRaw(rawMods) {
            var result = []
            var None           = 0,
                NoFail         = 1,
                Easy           = 2,
                TouchDevice    = 4,
                Hidden         = 8,
                HardRock       = 16,
                SuddenDeath    = 32,
                DoubleTime     = 64,
                HalfTime       = 256,
                Nightcore      = 576,
                Flashlight     = 1024,
                Perfect        = 16416 
                if(rawMods == None) return ['No Mod']
                if(rawMods - Perfect >= 0){ result[result.length] = 'Perfect'; rawMods -= Perfect }
                if(rawMods - Flashlight >= 0){ result[result.length] = 'Flashlight'; rawMods -= Flashlight }
                if(rawMods - Nightcore >= 0){ result[result.length] = 'Nightcore'; rawMods -= Nightcore }
                if(rawMods - HalfTime >= 0){ result[result.length] = 'HalfTime'; rawMods -= HalfTime }
                if(rawMods - DoubleTime >= 0){ result[result.length] = 'DoubleTime'; rawMods -= DoubleTime }
                if(rawMods - SuddenDeath >= 0){ result[result.length] = 'SuddenDeath'; rawMods -= SuddenDeath }
                if(rawMods - HardRock >= 0){ result[result.length] = 'HardRock'; rawMods -= HardRock }
                if(rawMods - Hidden >= 0){ result[result.length] = 'Hidden'; rawMods -= Hidden }
                if(rawMods - TouchDevice >= 0){ result[result.length] = 'TouchDevice'; rawMods -= TouchDevice }
                if(rawMods - Easy >= 0){ result[result.length] = 'Easy'; rawMods -= Easy }
                if(rawMods - NoFail >= 0){ result[result.length] = 'NoFail'; rawMods -= NoFail }
                return result
            }
    } 
}
module.exports = ctbCalc;


function max(a, b) {
    if (a > b) return a
    else return b
}

function min(a, b) {
    if (a < b) return a
    else return b
}

