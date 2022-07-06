const {MessageEmbed, MessageButton, MessageActionRow} = require("discord.js")
const db = require("croxydb")

module.exports = {
  name: "oylama",
  description: "Bir oylama başlatırsınız.",
  options: [{name: "konu", description: "Oylamanızın konusu.", type: "STRING", required: true}, {name: "kanal", description: "Oylamanın gerçekleşeceği kanal.", type: "CHANNEL", channelTypes: ["GUILD_TEXT"], required: false}],
  type: "CHAT_INPUT",
  run: async(client, interaction) => {
    
    var konu = interaction.options.getString("konu")
    var kanal = interaction.options.getChannel("kanal") || interaction.channel
    if (!interaction.member.roles.cache.has("933714126209957999") && !interaction.member.roles.cache.has("937304471757799434") && !interaction.member.roles.cache.has("946471132423405618")) return interaction.reply({content: `<:hayir:933702602363928626> Bu komutu kullanmak için **KURUCU, BAŞ YÖNETİM VEYA GENEL YÖNETİM** yetkisine sahip olmalısınız.`, ephemeral: true})
    if (!konu) return interaction.reply({content: `<:hayir:933702602363928626> Lütfen bir oylama konusu seçin.`})
    
    var embed = new MessageEmbed().setColor("AQUA").setAuthor(client.user.username, client.user.avatarURL()).setTitle(konu).setDescription("> Oylamaya evet demek istiyorsan evet, hayır demek istiyorsan hayır butonuna tıkla.").setFooter(interaction.user.username + " tarafından", interaction.user.displayAvatarURL({dynamic: true}))
    
    interaction.reply({embeds: [embed], fetchReply: true}).then(async(msg) => {
      
      var yes = new MessageButton().setCustomId("yes-" + msg.id).setLabel("Evet (0)").setStyle("SUCCESS")
      var red = new MessageButton().setCustomId("no-" + msg.id).setLabel("Hayır (0)").setStyle("DANGER")

      var row = new MessageActionRow().addComponents(yes, red)
      
      db.set(`survey.${msg.id}`, {
        createdTimestamp: Date.now(),
        yes: [],
        no: [],
        by: interaction.user.id,
        topic: konu
      })
      
      await msg.edit({embeds: [embed], components: [row]})
      
    })
    
  }
}