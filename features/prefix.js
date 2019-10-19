module.exports = {
    setPrefix(messageContent, message, connection, discordServerId)
    {
        var messageArray = messageContent.split(' ')
        if(messageArray.length != 2) return
        if(messageArray[1].length > 4){ message.channel.send('Prefix too long retard - max length 3'); return}
        prefix = messageArray[1]

        var sql = "UPDATE `servers` SET ? WHERE discord_id = " + discordServerId
        connection.query( sql, {prefix: prefix} )
        message.channel.send('Prefix changed to \"'+prefix+'\"')
    }
}