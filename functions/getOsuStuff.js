module.exports = {
    getMods(rawMods) {
        let result = ''
        rawMods.forEach(mod => {
            if(mod == 'Easy') result += 'EZ' 
            if(mod == 'NoFail') result += 'NF'
            if(mod == 'HalfTime') result += 'HT'
            if(mod == 'HardRock') result += 'HR'
            if(mod == 'SuddenDeath') result += 'SD'
            if(mod == 'Perfect') result += 'PF'
            if(mod == 'DoubleTime') result += 'DT'
            if(mod == 'NightCore') result += 'NC'
            if(mod == 'Hidden') result += 'HD'
            if(mod == 'Flashlight') result += 'FL'
            if(mod == 'No Mod') result += 'No Mod'
        });
        return result
    },
    getModsFromRaw(rawMods) {
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
    },
    getRankingEmote(ranking) {
        var emoteRaw
        if(ranking == 'XH') emoteRaw = '585737970816909322'
        if(ranking == 'SH') emoteRaw = '585737970246615050'
        if(ranking == 'X') emoteRaw = '585737970384896017'
        if(ranking == 'S') emoteRaw = '585737969885904897'
        if(ranking == 'A') emoteRaw = '585737969927716866'
        if(ranking == 'B') emoteRaw = '585737970150277131'
        if(ranking == 'C') emoteRaw = '585737970200477696'
        if(ranking == 'F') emoteRaw = '585737969877385217'
        return emoteRaw
    },
    getAmmountOfRetries(score) {
        var retries = 1
        for(i = 1; i < 10; i++) {
            if(score[0].beatmapId === score[i].beatmapId) retries++
            else return retries
            if(retries == 10) return retries
        }
    },
    getDtAr(ar) {
        let ms
        let newAR;
        if (ar > 5) {
            ms = 200 + (11 - ar) * 100
        }
        else {
            ms = 800 + (5 - ar) * 80
        }

        if (ms < 300) {
            newAR = 11
        }
        else if (ms < 1200) {
            newAR = Math.round((11 - (ms - 300) / 150) * 100) / 100
        }
        else {
            newAR = Math.round((5 - (ms - 1200) / 120) * 100) / 100
        }
        return newAR;
    }
}