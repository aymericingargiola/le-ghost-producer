module.exports = {
    today: function(roundStartOfTheDay) {
        const d = new Date();
        if (roundStartOfTheDay) {
            d.setHours(0)
            d.setMinutes(0)
            d.setSeconds(0)
            d.setMilliseconds(0)
        }
        return d.getTime()
    },
    beginingOfTheWeek: function() {
        d = new Date()
        const day = d.getDay()
        const diff = d.getDate() - day + (day == 0 ? -6:1)
        return new Date(d.setDate(diff)).getTime()
    }
}