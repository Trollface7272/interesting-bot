const rand = require('../functions/randomInt')
module.exports = {
    roll(messageContent, message) {
        msg = messageContent.split(' ')
        if(msg.length == 2) {
            let num = rand.random(0, parseInt(msg[1])) 
            message.channel.send(`Number you rolled is **${num}**`)
        }else if(msg.length == 3) {
            let num = rand.random(parseInt(msg[1]), parseInt(msg[2])) 
            message.channel.send(`Number you rolled is **${num}**`)
        }else {
            let num = rand.random(0, 10) 
            message.channel.send(`Number you rolled is **${num}**`)
        }
    }
}