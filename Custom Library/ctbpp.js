class ctbplaypp {
    constructor(num300, num100, num50, num50Miss, numMiss, rating, _combo, approachRate, mods) {
        this.num300 = num300
        this.num100 = num100
        this.num50 = num50
        this.num50Miss = num50Miss
        this.numMiss = numMiss
        this.rating = rating
        this._combo = _combo
        this.approachRate = approachRate
        this.mods = mods
        this.pp = this.getPPFromPlay()
    }
    getPPFromPlay() {
        var _value,
        maxCombo,
        lengthBonus,
        approachRateFactor,
        HD,
        FL,
        NF

        let num300 = this.num300,
        num100 = this.num100,
        num50 = this.num50,
        num50Miss = this.num50Miss,
        numMiss = this.numMiss,
        rating = this.rating,
        _combo = this._combo,
        approachRate = this.approachRate,
        mods = this.mods
        
        //Get Mods Used
        GetMods()

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

        return _value

        function GetMods() {
            mods.forEach(mod => {
                if(mod == 'Hidden') HD = true
                else HD = false 
                if(mod == 'Flashlight') FL = true
                else FL = false 
                if(mod == 'No-Fail') NF = true 
                else NF = false
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

