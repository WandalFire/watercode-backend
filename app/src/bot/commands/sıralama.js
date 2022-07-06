const {MessageEmbed} = require("discord.js")
const db = require("croxydb")

module.exports = {
  name: "sıralama",
  description: "Belirtilen kategorideki sıralamayı gösterir.",
  options: [{name: "kategori", description: "Sıralama yapacağınız kategorinin adı.", type: "STRING", required: true, choices: [{name: "teşekkür", value: "thanks"}]}],
  type: "CHAT_INPUT",
  run: async(client, interaction) => {
    
    var usersDb = db.get("user")
    
    var seçenek = interaction.options.getString("kategori")
    var embed = new MessageEmbed().setColor("#9C0C2C").setAuthor({name: interaction.user.username, iconURL: interaction.user.displayAvatarURL({dynamic: true})})
    .setDescription(`<:info:955892888477253682> ${seçenek.replace("thanks", "Teşekkür")} kategorisine ait sıralama aşağıda verilmiştir.`)
    .setFooter("CodeGX - En iyi kod paylaşım sunucusu!", client.user.avatarURL())
    
    if (seçenek == "thanks") {

      var number = 0
      
      var top = Object.keys(usersDb).filter(data => usersDb[data].stats && usersDb[data].stats.thanks).sort((a, b) => usersDb[b].stats.thanks - usersDb[a].stats.thanks).slice(0, 10)
      var mapped = top.map(data => {
        return {user:client.users.cache.get(data), points: usersDb[data].stats.thanks, top: top.indexOf(data)+1}
      })
            
      embed.setTitle("Teşekkür Sıralaması")
      
      for(var i in mapped) {
        embed.addField(`${({1: ":first_place:", 2: ":second_place:", 3: ":third_place:"}[mapped[i].top]) || ":medal:"} ${mapped[i].user.username}`, `> Toplam puan: ${mapped[i].points}`, true)
      }
      
      interaction.reply({embeds: [embed]})
      
    }
    
    
  }
}