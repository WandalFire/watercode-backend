const {MessageEmbed, MessageButton, MessageActionRow} = require("discord.js")
const db = require("croxydb")

module.exports = {
  name: "reboot",
  description: "API ve bot sistemini yeniden başlatırsınız.",
  options: [],
  type: "CHAT_INPUT",
  run: async(client, interaction) => {
  
    if (interaction.user.id !== "642752306441617417") return interaction.reply({content: `<:hayir:933702602363928626> Bu komutu kullanmak için **Just Nyde kadar profesyonel** olmalısınız.`, ephemeral: true})
  
    var yes = new MessageButton().setCustomId("yes").setLabel("Onayla").setStyle("SUCCESS")
    var red = new MessageButton().setCustomId("no").setLabel("İptal Et").setStyle("DANGER")

    var row = new MessageActionRow().addComponents(yes, red)
    
    const embed = new MessageEmbed().setColor("#9C0C2C").setAuthor("Yeniden Başlatma", client.user.avatarURL())
    .setTitle("CodeGX - Reboot")
    .setDescription(`> Bu işlemi yaparsan **CodeGX API** ve **Bot Sistemi** yeniden başlatılacaktır. Bunu yapmak istediğinden emin misin?`)
    .setFooter(interaction.user.username, interaction.user.displayAvatarURL({dynamic: true}))
    return interaction.reply({embeds: [embed], components: [row], fetchReply: true}).then((msg) => {
      
      let filter = (interact) => interact.user.id == interaction.user.id
      let collector = msg.createMessageComponentCollector({filter, time: 60000, componentType: "BUTTON"})
      
      collector.on("collect", async(collected) => {
        
        if (collected.user.id !== "642752306441617417") return collected.reply({content: "<:hayir:933702602363928626> Bu işlem için **Just Nyde kadar profesyonel** olmalısınız.", ephemeral: true})
                
        if (collected.customId == "yes") {
        
          embed.setDescription("> ✅ İşlem onaylandı ve sistem yeniden başlatılıyor.")
          yes = new MessageButton().setCustomId("yes").setLabel("Onayla").setStyle("SUCCESS").setDisabled(true)
          red = new MessageButton().setCustomId("no").setLabel("İptal Et").setStyle("DANGER").setDisabled(true)

          row = new MessageActionRow().addComponents(yes, red)
          collected.deferUpdate()
          msg.edit({embeds: [embed], components: [row]})
                    
        } else {
          
          embed.setDescription("> :x: Yeniden başlatma işlemi iptal edildi.")
          yes = new MessageButton().setCustomId("yes").setLabel("Onayla").setStyle("SUCCESS").setDisabled(true)
          red = new MessageButton().setCustomId("no").setLabel("İptal Et").setStyle("DANGER").setDisabled(true)

          row = new MessageActionRow().addComponents(yes, red)
          collected.deferUpdate()
          msg.edit({embeds: [embed], components: [row]}) 
          
        }
      
      })
  
    })
    
  }
}