const db = require("croxydb")
const ms = require("ms")

module.exports = {
  name: "üyelik",
  description: "Kurucuya özel, üyelere ücretli üyelik verilmek için kullanılır.",
  options: [{name: "ver", description: "Kullanıcıya ücretlendirme üyeliklerinden verirsiniz.", type: "SUB_COMMAND", options: [{name: "üye", description: "Üyelik vereceğiniz üyeyi girin.", type: "USER", required: true}, {name: "üyelik_türü", description: "Vereceğiniz üyelik türü.", type: "STRING", required: true, choices: [{name: "VIP", value: "vip"}, {name: "ULTRA", value: "ultra"}]}, {name: "süre", description: "Üyeliğin bitiş süresi.", type: "STRING", required: true, choices: [{name: "1 gün", value: "86400000"}, {name: "1 hafta", value: "604800000"}, {name: "1 ay", value: "2629800000"}, {name: "1 yıl", value: "31557600000"}]}]}, {name: "al", description: "Kullanıcıdan üyeliğini geri alırsınız.", type: "SUB_COMMAND", options: [{name: "üye", description: "Üyeliğini alacağınız kullanıcı.", type: "USER", required: true}]}],
  type: "CHAT_INPUT",
  run: async(client, interaction) => {
  
    if (!client.fetchAdmins("owner").find(a => a.id == interaction.user.id)) return interaction.reply({content: `<:hayir:933702602363928626> Bu komutu kullanmak için **KURUCU** yetkisine sahip olmalısınız.`, ephemeral: true})

    if (interaction.options._subcommand == "ver") {
      
      var user = interaction.options.getUser("üye")
      var date = interaction.options.getString("süre") 
      var type = interaction.options.getString("üyelik_türü")
      
      if (date == 0) return interaction.reply({content: `<:hayir:933702602363928626> Geçerli bir zaman kodu giriniz!`})
      if (db.has(`user.${user.id}.membership`)) return interaction.reply({content: `<:hayir:933702602363928626> Kullanıcının mevcut bir aboneliği var ve süresi dolmamış.`})
      
      db.set(`user.${user.id}.membership`, {
        type: type,
        createdTimestamp: Date.now(),
        expiredTimestamp: Date.now()+Number(date),
        givedBy: interaction.user.id,
        subscriptionCode: client.createToken(35)
      })
      db.push(`user.${user.id}.pricing`, {
        type: type,
        createdTimestamp: Date.now(),
        expiredTimestamp: Date.now()+Number(date),
        givedBy: interaction.user.id,
        subscriptionCode: client.createToken(35),
        price: (type == "vip") ? "5TL" : "10TL"
      })
      client.members(user.id).roles.add((type == "vip") ? "936517634244096050" : "936517441134141440")
      
      return interaction.reply({content: `<:evet:933702567408578620> <@${user.id}> adlı üyeye başarıyla **${(type == "vip") ? "CodeGX VIP" : "CodeGX ULTRA"}** üyeliği verildi. Üyeliğin ortalama bitiş tarihi: <t:${Math.floor((Date.now()+Number(date))/1000)}:R>`})
      
    } else if (interaction.options._subcommand == "al") {
      
      var user = interaction.options.getUser("üye")
      
      if (!db.has(`user.${user.id}.membership`)) return interaction.reply({content: `<:hayir:933702602363928626> Bu kullanıcıda zaten üyelik bulunmuyor!`, ephemeral: true})
      
      db.delete(`user.${user.id}.membership`)
      
      return interaction.reply({content: `<:hayir:933702602363928626> Kullanıcının üyeliği başarıyla iptal edildi.`})
      
    }
  
  }
}