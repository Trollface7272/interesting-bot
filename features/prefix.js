module.exports = {
    setPrefix(messageContent, message, connection, discordServerId)
    {
    var messageArray = messageContent.split(' ')
        if(messageArray.length > 2 && messageArray.length < 2 && messageArray[1].length > 3) return
        prefix = messageArray[1];
        var sql = "UPDATE `servers` SET ? WHERE discord_id = " + discordServerId
        connection.query( sql, {prefix: prefix} )
        message.channel.send('Prefix changed to \"'+prefix+'\"')
        return prefix
    }
}