const {MessageEmbed, MessageButton, MessageActionRow} = require("discord.js")
const db = require("croxydb")

module.exports = {
  name: "guildMemberRemove",
  run: async(client, member) => {
    
    var bots = db.get(`botlist`)
    if (bots[`${member.user.id}`]) {
      db.delete(`botlist.${member.user.id}`)
      if (Object.keys(bots).filter(a => a !== member.user.id && bots[a].userID == bots[`${member.user.id}`].userID).length == 0) {
        client.members(bots[`${member.user.id}`]).roles.remove("967360934223949865")
      }
    }
    
  }
}