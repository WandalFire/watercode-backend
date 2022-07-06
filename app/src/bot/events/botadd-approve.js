const db = require("croxydb")
const {MessageEmbed, MessageButton, MessageActionRow} = require("discord.js")

module.exports = {
  name: "guildMemberAdd",
  run: async(client, member) => {
        
    if (member.user.bot && db.has(`botlist.${member.user.id}`)) {
      
      var memb = await member.guild.fetchAuditLogs({
        limit: 1,
        type: "BOT_ADD"
      })
      memb = memb.entries.first()
      memb = memb.executor
      
      db.delete(`botlist.${member.user.id}.status`)
      const embed = new MessageEmbed().setColor("AQUA").setAuthor(`${memb.username} - Bot onaylandı!`, memb.displayAvatarURL({dynamic: true}))
      .setTitle("CodeGX - Bot Onaylandı!")
      .setDescription(`> \`${client.users.cache.get(db.get(`botlist.${member.user.id}.userID`)).username}\` eklediği \`${member.user.username}\` adlı bot **${memb.username}** adlı yetkili tarafından onaylandı!`)
      .setFooter(memb.username + " tarafından.", memb.displayAvatarURL({dynamic: true}))
      client.members(db.get(`botlist.${member.user.id}.userID`)).roles.add("967360934223949865")
      client.channels.cache.get("966358423681794138").send({content: `<@${db.get(`botlist.${member.user.id}.userID`)}>`, embeds: [embed]})
      
    }
    
  }
}