const {MessageEmbed, MessageButton, MessageActionRow} = require("discord.js")

module.exports = {
  name: "guildMemberAdd",
  run: async(client, member) => {
    
    if (member.user.bot == false) {
      
      member.roles.add("933695310016937987")
    
      client.channels.cache.get("937686127207403580").send({content: `<a:helloo:964500141589557318> Aramıza hoş geldin <@${member.user.id}>! Seninle beraber **${member.guild.memberCount} kişilik** bir aile olduk!`})
    } else if (member.user.bot) {
      
      member.roles.add("967351707883438140")
      
    }
      
  }
}