module.exports = {
    arrayToString(tags) {
        tags.sort((a, b) => a.localeCompare(b))

        var list = ''
        for(var i = 0; i < tags.length; i++) {
            tags[i] = tags[i].replace(/ *\([^)]*\) */g, "")
            list = `${list}, ${tags[i]}` 
        }

        if(list.startsWith(',')) list = list.substring(2,list.length)
        return list
    },
    removeFirst(data){
        data = data.split(' ')
        for(let i = 1; i < data.length; i++) {
            data[i-1] = data[i]
        }
        data.pop()
        return data
    }
}