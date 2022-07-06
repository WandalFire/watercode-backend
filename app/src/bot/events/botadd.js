const { Modal, TextInputComponent, showModal } = require('discord-modals')
const db = require("croxydb")
const {MessageEmbed} = require("discord.js")

module.exports = {
  name: "interactionCreate",
  run: async(client, interaction) => {

    if (!interaction.isButton()) return
    
    if (interaction.customId == "addbot") {
  
      const modal = new Modal().setCustomId("botadding").setTitle("Botunu Ekle").addComponents(new TextInputComponent().setRequired(true).setCustomId("botid").setLabel("Botun ID'si").setMaxLength(18).setStyle("SHORT").setPlaceholder("Botunuzun kimlik numarası. (ID)"), new TextInputComponent().setRequired(true).setCustomId("botprefix").setLabel("Botun ön eki").setMaxLength(18).setStyle("SHORT").setPlaceholder("Botunuzun prefixi/ön eki. (Örneğin !)"))
    
      showModal(modal, {
        client: client,
        interaction: interaction
      })
      
    } else if (interaction.customId.startsWith("decline")) {
      
      if (!interaction.member.permissions.has("MANAGE_GUILD")) return interaction.reply({content: `<:hayir:933702602363928626> Bu komutu kullanmak için **Sunucuyu Yönet** iznine sahip olmalısın.`, ephemeral: true})
      
      var id = interaction.customId.split("-")[1]
      if (client.members(id)) return interaction.reply({ephemeral: true, content: `<:hayir:933702602363928626> Bu bot sistemde onaylı duruyor. Botu atmayı deneyin.`})
      interaction.deferUpdate()
      const userr = await client.users.fetch(id)
      const embed = new MessageEmbed().setColor("RED").setAuthor(`${interaction.user.username} - Bot reddedildi!`, interaction.user.displayAvatarURL({dynamic: true}))
      .setTitle("CodeGX - Bot Reddedildi!")
      .setDescription(`> \`${client.users.cache.get(db.get(`botlist.${id}.userID`)).username}\` eklediği \`${userr.username}\` adlı bot **${interaction.user.username}** adlı yetkili tarafından reddedildi.`)
      .setFooter(interaction.user.username + " tarafından.", interaction.user.displayAvatarURL({dynamic: true}))
      client.channels.cache.get("966358423681794138").send({content: `<@${db.get(`botlist.${id}.userID`)}>`, embeds: [embed]})
      db.delete(`botlist.${id}`)
      
    }
    
  }
}