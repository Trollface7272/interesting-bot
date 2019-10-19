module.exports = {
    dailyCredits(connection, userData, discordClientId, db, message) {
        var date = new Date()
        var day = date.getDay()
        var dateOld = userData.daily_date.getDay()
        if(day != dateOld) {
            set = {credits: userData.credits + 50, daily_date: date}
            db.update(connection, 'users', discordClientId, set)
            let credits = userData.credits + 50
            message.channel.send('Succesfully claimed your 50 daily credits you now have ' + credits + ' credits')
        }else  message.channel.send('No')
        
    }
}