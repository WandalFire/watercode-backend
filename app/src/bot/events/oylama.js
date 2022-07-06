const {MessageEmbed, MessageButton, MessageActionRow} = require("discord.js")
const db = require("croxydb")

module.exports = {
  name: "interactionCreate",
  run: async(client, i) => {
        
    if (i.type == "MESSAGE_COMPONENT") {
      
      if (i.customId.startsWith("yes-")) {
        
        var id = i.customId.split("-")
        if (!id[1] || !db.has(`survey.${id[1]}`) || db.get(`survey.${id[1]}.yes`).includes(i.user.id) || db.get(`survey.${id[1]}.no`).includes(i.user.id)) return i.deferUpdate()
        
        db.push(`survey.${id[1]}.yes`, i.user.id)
        
        var yes = new MessageButton().setCustomId("yes-" + i.message.id).setLabel(`Evet (${db.get(`survey.${i.message.id}.yes`).length})`).setStyle("SUCCESS")
        var red = new MessageButton().setCustomId("no-" + i.message.id).setLabel(`Hayır (${db.get(`survey.${i.message.id}.no`).length})`).setStyle("DANGER")

        var row = new MessageActionRow().addComponents(yes, red)
        
        i.message.edit({embeds: i.message.embeds, components: [row]})
        i.reply({content: `<:evet:933702567408578620> Başarıyla **evet** olarak oy verdin.`, ephemeral: true})
        
      } else if (i.customId.startsWith("no-")) {
        
        var id = i.customId.split("-")
        if (!id[1] || !db.has(`survey.${id[1]}`) || db.get(`survey.${id[1]}.yes`).includes(i.user.id) || db.get(`survey.${id[1]}.no`).includes(i.user.id)) return i.deferUpdate()
        
        db.push(`survey.${id[1]}.no`, i.user.id)
        
        var yes = new MessageButton().setCustomId("yes-" + i.message.id).setLabel(`Evet (${db.get(`survey.${i.message.id}.yes`).length})`).setStyle("SUCCESS")
        var red = new MessageButton().setCustomId("no-" + i.message.id).setLabel(`Hayır (${db.get(`survey.${i.message.id}.no`).length})`).setStyle("DANGER")

        var row = new MessageActionRow().addComponents(yes, red)
        
        i.message.edit({embeds: i.message.embeds, components: [row]})
        i.reply({content: `<:evet:933702567408578620> Başarıyla **hayır** olarak oy verdin.`, ephemeral: true})
        
      }
      
    }
    
  }
}