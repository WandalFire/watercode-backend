const {MessageEmbed, MessageButton, MessageActionRow} = require("discord.js")
const db = require("croxydb")

module.exports = {
  name: "modalSubmit",
  run: async(client, modal) => {
    if(modal.customId === 'botadding'){
      await modal.deferReply({ ephemeral: true })
      const id = modal.getTextInputValue('botid')
      if (client.members(id) || db.has(`botlist.${id}`)) return modal.followUp({content: `<:hayir:933702602363928626> Bu bot sistemimizde var/beklemede veya sunucuda bulunuyor.`, ephemeral: true})
      const user = await client.users.fetch(id)
      if (!user || user.bot == false) return modal.followUp({content: `<:hayir:933702602363928626> Böyle bir bot yok veya bu bir bot değil.`})
      const datas = db.get("botlist")
      
      db.set(`botlist.${id}`, {
        createdTimestamp: Date.now(),
        userID: modal.user.id,
        status: "WAIT"
      })
      
      var buttons = {
        add: new MessageButton().setURL(`https://discord.com/oauth2/authorize?client_id=${id}&scope=bot&permissions=0`).setStyle("LINK").setLabel("Onayla"),
        red: new MessageButton().setStyle("DANGER").setLabel("Reddet").setCustomId("decline-"+id)
      }
      var row = new MessageActionRow().addComponents(buttons.add, buttons.red)
      var embed = new MessageEmbed().setColor("AQUA").setAuthor(modal.user.username + " - Bot eklendi!", modal.user.displayAvatarURL({dynamic: true})).setTitle("CodeGX - Bot Eklendi!").setDescription("> `" + user.username + "` adlı bot **" + modal.user.username + "** tarafından sistemimize eklendi. Bu bot beklemede **" + (Object.keys(datas).filter(a => datas[a].status && datas[a].status == "WAIT").length+1) + "**. sırada yer alıyor.").setFooter(modal.user.username + " tarafından.", modal.user.displayAvatarURL({dynamic: true}))
      
      client.channels.cache.get("966358423681794138").send({content: `<@${modal.user.id}>`, embeds: [embed], components: [row]})
      modal.followUp({ content: '<:evet:933702567408578620> Bot ekleme talebin bizlere iletildi. Lütfen sakince başvurunun cevaplanmasını bekle. :coffee:', ephemeral: true })
    }  
  }
}