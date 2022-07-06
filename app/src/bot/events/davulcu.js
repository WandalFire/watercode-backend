const db = require("croxydb")
const {MessageEmbed, MessageButton, MessageActionRow} = require("discord.js")
const ms = require("parse-ms")

module.exports = {
  name: "interactionCreate",
  run: async(client, interaction) => {
    
    if (!interaction.isButton()) return
    
    if (interaction.message.id == "970639460943417374") {
      
      if (interaction.customId == "vurdavula") {
        
        var userThankData = db.get(`user.${interaction.user.id}.davul.cooldown`)
        var cooldownTime = 300000
        var kalan;
        var cevap = Math.floor(Math.random() * 11)

        if (userThankData !== null && cooldownTime - (Date.now() - userThankData) > 0) {

          kalan = ms(cooldownTime - (Date.now() - userThankData));
          
          return interaction.reply({content: `> Davula vurmak için **${kalan.minutes} dakika ${kalan.seconds} saniye** bekle!`, ephemeral: true})
          
        } else {
          
          db.add(`user.${interaction.user.id}.davul.gxcoin`, cevap)
          db.set(`user.${interaction.user.id}.davul.cooldown`, Date.now())
          db.add(`user.${interaction.user.id}.davul.vurus`, 1)
          
          var data = db.get("user")
          data = Object.keys(data).filter(a => data[a].davul).sort((a, b) => data[b].davul.gxcoin - data[a].davul.gxcoin).map(a => {
            return {user: client.users.cache.get(a), data: data[a].davul}
          })
          
          var newEmb = interaction.message.embeds[0]
          newEmb.fields = [{name: "• Sıralama", value: data.slice(0, 10).map(a => `${{1: "🥇", 2: "🥈", 3: "🥉"}[data.indexOf(a)+1] || "🏅"} > **${a.user.username}**: \`${a.data.gxcoin} gxc\``).join("\n"), inline: false}]
          
          interaction.reply({content: `<:davulcu:970629613510344714> Davula vurdun ve halk sana **${cevap} gxcoin** verdi!`, ephemeral: true})
          return interaction.message.edit({embeds: [newEmb], components: [interaction.message.components[0]]})
          
        }
        
      } else if (interaction.customId == "viewstats") {
        
        var data = db.get(`user`)
        data = Object.keys(data).filter(a => data[a].davul).sort((a, b) => data[b].davul.gxcoin - data[a].davul.gxcoin)
        
        const embed = new MessageEmbed().setColor("YELLOW").setAuthor(interaction.user.username, interaction.user.displayAvatarURL({dynamic: true}))
        .setTitle("Davulcu İstatistiğin")
        .setDescription(`> Toplamda **${db.get(`user.${interaction.user.id}.davul.gxcoin`) || 0} GXCoin**'in var.\n> Toplamda **${db.get(`user.${interaction.user.id}.davul.vurus`) || 0} kere** davula vurdun.\n> Davulcu sıralamasında **${(data.indexOf(interaction.user.id) == -1) ? "Bilinmiyor" : data.indexOf(interaction.user.id)+1}.** sıradasın!`)
        .addField("• Nasıl davulcu sıralamam artar?", "> 5 dakika arayla davula vurabilir ve halktan rastgele 0-10 arası GXCoin kazan! Sıralamaya giren kişilerin ödülleri etkinlik mesajında yazmaktadır.")
        .setFooter("CodeGX - 2022", client.user.avatarURL())
        return interaction.reply({embeds: [embed], ephemeral: true})
        
      }
      
    }
    
  }
}