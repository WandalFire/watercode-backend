const {MessageEmbed, MessageSelectMenu, MessageActionRow} = require("discord.js")

module.exports = {
  name: "yardım",
  description: "Yardım menüsünü gösterir.",
  options: [],
  type: "CHAT_INPUT",
  run: async(client, interaction) => {
    
    var select = new MessageSelectMenu().setCustomId("cmds").setPlaceholder("Kategori seçiminizi buradan yapabilirsiniz.").setOptions([
      {label: "Kullanıcı Aktiviteleri", description: "Siz değerli kullanıcılarımız için en güzel komutları derledik!", value: "activities", emoji: "🎉", default: false},
      {label: "Yetkili İşlemleri", description: "Yetkililerimiz için işlerini kolaylaştıracak işlemler.", value: "moderation", default: false, emoji: "🛠️"}    
    ])
    var row = new MessageActionRow().addComponents(select)
    
    const embed = new MessageEmbed().setAuthor({name: "CodeGX", iconURL: client.user.avatarURL({dynamic: true})}).setTitle("CodeGX Menü")
    .setDescription("<:info:943220597511569428> Merhaba! Sayın <@" + interaction.user.id + ">, görüntülemek istediğiniz kategoriyi seçerek komutlara bakabilirsiniz.")
    .addField(`🎉 Kullanıcı Aktiviteleri!`, `> Siz değerli kullanıcılarımız için en güzel komutları derledik!`)
    .addField(":tools: Yetkili İşlemleri!", `> CodeGX'de çalışmak artık çok kolay!`)
    .setColor("#9C0C2C")
    .setFooter({text: "CodeGX - En iyi kod paylaşım platformu!", iconURL: client.user.avatarURL({dynamic: true})})
    return interaction.reply({embeds: [embed], components: [row], fetchReply: true}).then((msg) => {
      
      let filter = (interact) => interact.user.id == interaction.user.id
      let collector = msg.createMessageComponentCollector({filter, time: 60000, componentType: "SELECT_MENU"})
      
      collector.on("collect", (collected) => {
        
        if (collected.values[0] == "activities") {
          
          embed.fields = []
          embed.setDescription(`<:info:943220597511569428> Kullanıcı Aktiviteleri\n\n> \`/teşekkür\` - Bir kullanıcıya teşekkür edersiniz.\n> \`/sıralama\` - Belirtilen kategorinin sıralamasını gösterir.`)
          
          select = select.setOptions([
            {label: "Kullanıcı Aktiviteleri", description: "Siz değerli kullanıcılarımız için en güzel komutları derledik!", value: "activities", emoji: "🎉", default: true},
            {label: "Yetkili İşlemleri", description: "Yetkililerimiz için işlerini kolaylaştıracak işlemler.", value: "moderation", default: false, emoji: "🛠️"}    
          ])
          row = row.setComponents(select)
          msg.edit({embeds: [embed], components: [row]})
          collected.deferUpdate()
          
        } else if (collected.values[0] == "moderation") {
          
          embed.fields = []
          embed.setDescription(`<:info:943220597511569428> Yetkili İşlemleri\n\n> \`/reboot\` - Sistemi yeniden başlatır. **Just Nyde Özel**\n> \`/üyelik\` - Bir kullanıcıya üyelik verirsiniz.`)
          
          select = select.setOptions([
            {label: "Kullanıcı Aktiviteleri", description: "Siz değerli kullanıcılarımız için en güzel komutları derledik!", value: "activities", emoji: "🎉", default: false},
            {label: "Yetkili İşlemleri", description: "Yetkililerimiz için işlerini kolaylaştıracak işlemler.", value: "moderation", default: true, emoji: "🛠️"}    
          ])
          row = row.setComponents(select)
          msg.edit({embeds: [embed], components: [row]})
          collected.deferUpdate()          
        }
        
      })
      
      collector.on("end", () => {
        embed.fields = []
        embed.setDescription("<:hayir:933702602363928626> Zaman aşımı, lütfen tekrar komutu kullanmayı deneyin.")
        msg.edit({embeds: [embed]})
      })
      
    })
    
  }
}