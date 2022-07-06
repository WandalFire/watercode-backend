const {MessageEmbed} = require("discord.js")

module.exports = {
  name: "Avatar",
  options: [],
  type: "USER",
  run: async(client, interaction) => {
    
    const user = client.users.cache.get(interaction.targetId)
    const embed = new MessageEmbed().setAuthor({name: interaction.user.username, iconURL: interaction.user.displayAvatarURL({dynamic: true})}).setThumbnail(user.displayAvatarURL({dynamic: true, size: 1024})).setTitle(user.username).setDescription("> Kullanıcının avatarı alındı!")
    .setImage(user.displayAvatarURL({dynamic: true, size: 2048}).replace(".webp", ".png"))
    .setFooter({text: "CodeGX - Sizin için, 2022", iconURL: client.user.avatarURL()})
    .setColor("#574fa5")
    return interaction.reply({embeds: [embed], ephemeral: true})
    
  }
}