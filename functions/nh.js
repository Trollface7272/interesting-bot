const async = require('async')

module.exports = {
    async getNewestBook(nh) {
        let home = await nh.getHomepage(1)
        home = home.results[0].bookId
        return home
    }
}