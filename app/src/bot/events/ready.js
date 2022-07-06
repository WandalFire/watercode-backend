const database = require("croxydb")
const {MessageEmbed, MessageButton, MessageActionRow} = require("discord.js")

module.exports = {
  name: "ready",
  run: async(client) => {
    
    var databaseObject = database.get("user")
    var databaseObjectFiltered = Object.keys(databaseObject).filter(data => databaseObject[data].thanks && databaseObject[data].thanks.cooldown)
    for(var i = 0;i < databaseObjectFiltered.length;i++) {
            
      const userProps = databaseObject[databaseObjectFiltered[i]]
            
      setTimeout(() => {
        
        database.delete(`user.${databaseObjectFiltered[i]}.thanks.cooldown`)
        
        try {
          client.users.cache.get(databaseObjectFiltered[i]).send({content: `:tada: Yaşasın! Teşekkür hakkın artık yenilendi.`})
        } catch(err) {}
        
      }, (userProps.thanks.cooldown+43200000)-Date.now())
      
    }
    
    setInterval(function(){
    
      const data = database.get("user")
      const filteredMemberships = Object.keys(databaseObject).filter(dt => data[dt].membership && Date.now() > data[dt].membership.expiredTimestamp)
        
      filteredMemberships.forEach((d) => {
        const member = client.members(d)
        var events = database.get("events") || {}
        events = Object.keys(events).map(a => events[a])
        if (!member) return database.delete(`user.${d}.membership`)
        member.roles.remove((data[d].membership.type == "vip") ? "936517634244096050" : "936517441134141440")
        database.delete(`user.${d}.membership`)
        const emb = new MessageEmbed().setColor((data[d].membership.type == "vip") ? "#9C0C2C" : "#574fa5").setAuthor(member.user.username, member.user.displayAvatarURL({dynamic: true}))
        .setTitle(`Üyelik Bildirimi`).setDescription(`> <t:${Math.floor(data[d].membership.createdTimestamp/1000)}:d> vaktinde almış olduğunuz **${{vip: "CodeGX VIP", ultra: "CodeGX ULTRA"}[data[d].membership.type]}** üyeliğiniz şimdi son bulmuştur.`)
        .setURL("https://codegx.xyz/pricing")
        .addField("• Kampanyalar", `${(events.length == 0) ? "∟ Kampanya bulunmuyor." : ((events.map(data => `∟ ${data.description.slice(0, 10)}.. <t:${Math.floor(data.expired/1000)}:R>`).join("\n")))}`)
        .setFooter(`CodeGX - #2022`, client.user.avatarURL())
        const btn = new MessageActionRow().addComponents(new MessageButton().setLabel("Kampanyaları Görüntüle").setURL("https://discord.com/channels/933684815692181534/967687413629583370").setStyle("LINK"))
        client.channels.cache.get(`967683987390726164`).send({content: `<:evet:933702567408578620> <@${d}> adlı üyenin **${{vip: "CodeGX VIP", ultra: "CodeGX ULTRA"}[data[d].membership.type]}** üyeliği şimdi son bulmuştur.`})
        try {
          client.users.cache.get(d).send({embeds: [emb], components: [btn]})
        } catch(err) {}
      })
        
    }, 2000)
        
  }
}