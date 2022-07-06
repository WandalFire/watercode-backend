const {readdirSync} = require("fs"),
      {Collection} = require("discord.js"),
      { Modal, TextInputComponent, showModal } = require('discord-modals')

module.exports = (client) => {
  
  client.commands = new Collection()
  
  var files = readdirSync("./src/bot/commands/")
  var events = readdirSync("./src/bot/events/")
  for(var i = 0;i < files.length;i++) {
    var props = require("../commands/" + files[i])
    client.commands.set(props.name, props)
  }
  for(var i = 0;i < events.length;i++) {
    const props = require("../events/" + events[i])
    client.on(props.name, (...data) => {
      props.run(client, ...data)
    })
  }
  var cmds = client.commands.map(a => {
    return {name: a.name, description: ((a.type == "USER") ? undefined : a.description), options: a.options, type: (a.type || "CHAT_INPUT")}
  })
  
  client.on("ready", () => {
    client.guilds.cache.get("933684815692181534").commands.set(cmds)
  })
    
  client.on("interactionCreate", (interaction) => {
    
    if (!interaction.isCommand() && !interaction.isContextMenu()) return
    
    client.commands.get(interaction.commandName).run(client, interaction)
    
  })
  
  client.on("interactionCreate", (interaction) => {
    
    if (!interaction.isButton()) return
    
    if (interaction.customId == "talepolustur") {
      
      if (interaction.guild.channels.cache.filter(a => a.name.startsWith("support")).find(a => a.name.split("-")[1] == interaction.user.id)) return interaction.reply({content: `<:hayir:933702602363928626> Zaten halihazırda bir başvuru talebin bulunuyor.`, ephemeral: true})
      
      const modal = new Modal().setCustomId("talebol").setTitle("Talep Oluştur").addComponents(new TextInputComponent().setRequired(true).setCustomId("talepkonu").setLabel("Talebinizin konusu").setMaxLength(30).setStyle("SHORT").setPlaceholder("Bu yüzden talep ediyorum..."))
    
      showModal(modal, {
        client: client,
        interaction: interaction
      })
      
    } else if (interaction.customId.startsWith("talepkapat")) {
      
      var id = interaction.customId.split("-")[1]
      interaction.guild.channels.cache.find(a => a.name == "support-" + id).delete()
      
    }
    
  })
  
}