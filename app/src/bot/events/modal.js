const {MessageEmbed, MessageButton, MessageActionRow} = require("discord.js")

module.exports = {
  name: "modalSubmit",
  run: async(client, modal) => {
    if(modal.customId === 'talebol'){
      const firstResponse = modal.getTextInputValue('talepkonu')
      await modal.deferReply({ ephemeral: true })
      var c = await modal.guild.channels.create("support-" + modal.user.id)
      var emb = new MessageEmbed().setColor("#9C0C2C").setAuthor(modal.user.username + " - Talep", modal.user.displayAvatarURL({dynamic: true})).setTitle("Destek Talebi")
      .setDescription("> Merhaba, <@" + modal.user.id + ">! " + firstResponse + " adlı talep başlığın burada değerlendirilecektir. Lütfen yetkilileri boş yere etiketleyip rahatsız etme.")
      .setFooter("CodeGX - Talebin", client.user.avatarURL())
      var btn = new MessageButton().setStyle("DANGER").setLabel("Talebi Kapat").setCustomId("talepkapat-" + modal.user.id)
      var row = new MessageActionRow().addComponents(btn)
      c.setParent("957636250574131300")
      c.permissionOverwrites.create(modal.user.id, {
        VIEW_CHANNEL: true,
        SEND_MESSAGES: true
      })
      c.permissionOverwrites.create("933684815692181534", {
        VIEW_CHANNEL: false
      })
      c.send({content: `<@&936170346569154621> - <@${modal.user.id}>`, components: [row], embeds: [emb]})
      modal.followUp({ content: 'Destek talebin başarıyla oluşturuldu. Lütfen <#' + c.id + "> kanalına göz at!", ephemeral: true })
    }  
  }
}