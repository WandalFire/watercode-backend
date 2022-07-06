const db = require("croxydb")
const ms = require("parse-ms")

module.exports = {
  name: "teşekkür",
  description: "Bir kullanıcıya teşekkür edersiniz.",
  options: [{name: "üye", description: "Teşekkür edeceğiniz üye. Gereksiz kullanmayınız!", type: "USER", required: true}],
  type: "CHAT_INPUT",
  run: async(client, interaction) => {
  
    var member = interaction.options.getMember("üye")
    var userThankData = db.get(`user.${interaction.user.id}.thanks.cooldown`)
    var cooldownTimestamp = 43200000
    var kalan;
    var cevap = Math.floor(Math.random() * 11)
    
    if (member.user.bot) return interaction.reply({ephemeral: true, content: `<:hayir:933702602363928626> Lütfen geçerli bir üye belirtin. Teşekkürünüzü gereksiz yere harcamayın!`})
    if (userThankData !== null && cooldownTimestamp - (Date.now() - userThankData) > 0) {
    
      kalan = ms(cooldownTimestamp - (Date.now() - userThankData));
      
      return interaction.reply({content: `<:hayir:933702602363928626> Birine teşekkür etmek için 1 gün beklemelisiniz. Kalan süre: **${kalan.hours} saat, ${kalan.minutes} dakika, ${kalan.seconds} saniye.**`})
      
    } else {
      
      db.set(`user.${interaction.user.id}.thanks`, {
        cooldown: Date.now()
      })
      
      db.add(`user.${member.user.id}.stats.thanks`, cevap)
      
      console.log(Date.now()+cooldownTimestamp)
      
      setTimeout(() => {
        
        db.delete(`user.${interaction.user.id}.thanks.cooldown`)
        
        try {
          client.users.cache.get(interaction.user.id).send({content: `:tada: Yaşasın! Teşekkür hakkın artık yenilendi.`})
        } catch(err) {}
        
      }, (cooldownTimestamp))
      
      return interaction.reply({content: `<:evet:933702567408578620> <@${member.id}> adlı kullanıcıya teşekkür ettin! Kullanıcı **${cevap}** teşekkür puanı kazandı.`})
      
    }
    
    
  }
}