const Discord = require("discord.js")
const Util = require("util")
const db = require("croxydb")

module.exports = (client, settings) => {
  
  client.on("ready", () => {
    
    client.user.setStatus("dnd")
    client.user.setActivity("Kodları ve sunucuyu", {type: "WATCHING"})
    client.guild = () => {return client.guilds.cache.get("933684815692181534")}
    client.members = (data) => {if (data) {return client.guild().members.cache.get(data)} else {return client.guild().members.cache}}
    client.fetchAdmins = (type) => {
      if (type == "owner") {
        var members = client.members().filter(a => a.roles.cache.has("933714126209957999")).map(a => a)
        return members
      } else if (type == "manager") {
        var members = client.members().filter(a => a.roles.cache.has("946471132423405618")).map(a => a)
        return members
      } else if (type == "generalmanage") {
        var members = client.members().filter(a => a.roles.cache.has("937304471757799434")).map(a => a)
        return members
      } else if (type == "communitymanage") {
        var members = client.members().filter(a => a.roles.cache.has("936170346569154621")).map(a => a)
        return members
      } else if (type == "staff") {
        var members = client.members().filter(a => a.roles.cache.has("934084717953810472")).map(a => a)
        return members
      } else if (type == "trial") {
        var members = client.members().filter(a => a.roles.cache.has("937304627047714826")).map(a => a)
        return members
      } else if (type == "all" || !type) {
        var admins = []
        client.fetchAdmins("owner").forEach(a => admins.push({user: a.user, roles: a.roles.cache.sort((a, b) => b.position - a.position).filter(a => a.id == "933714126209957999" || a.id == "937304471757799434" || a.id == "936170346569154621" || a.id == "934084717953810472" || a.id == "937304627047714826" || a.id == "946471132423405618").map(a => a.name)}))
        client.fetchAdmins("manager").filter(a => !admins.find(data => data.user.id == a.user.id)).forEach(a => admins.push({user: a.user, roles: a.roles.cache.sort((a, b) => b.position - a.position).filter(a => a.id == "933714126209957999" || a.id == "937304471757799434" || a.id == "936170346569154621" || a.id == "934084717953810472" || a.id == "937304627047714826" || a.id == "946471132423405618" || a.id == "396571938081865741").map(a => a.name)}))
        client.fetchAdmins("generalmanage").filter(a => !admins.find(data => data.user.id == a.user.id)).forEach(a => admins.push({user: a.user, roles: a.roles.cache.sort((a, b) => b.position - a.position).filter(a => a.id == "933714126209957999" || a.id == "937304471757799434" || a.id == "936170346569154621" || a.id == "934084717953810472" || a.id == "937304627047714826" || a.id == "946471132423405618").map(a => a.name)}))
        client.fetchAdmins("communitymanage").filter(a => !admins.find(data => data.user.id == a.user.id)).forEach(a => admins.push({user: a.user, roles: a.roles.cache.sort((a, b) => b.position - a.position).filter(a => a.id == "933714126209957999" || a.id == "937304471757799434" || a.id == "936170346569154621" || a.id == "934084717953810472" || a.id == "937304627047714826" || a.id == "946471132423405618").map(a => a.name)}))
        client.fetchAdmins("staff").filter(a => !admins.find(data => data.user.id == a.user.id)).forEach(a => admins.push({user: a.user, roles: a.roles.cache.sort((a, b) => b.position - a.position).filter(a => a.id == "933714126209957999" || a.id == "937304471757799434" || a.id == "936170346569154621" || a.id == "934084717953810472" || a.id == "937304627047714826" || a.id == "946471132423405618").map(a => a.name)}))
        client.fetchAdmins("trial").filter(a => !admins.find(data => data.user.id == a.user.id)).forEach(a => admins.push({user: a.user, roles: a.roles.cache.sort((a, b) => b.position - a.position).filter(a => a.id == "933714126209957999" || a.id == "937304471757799434" || a.id == "936170346569154621" || a.id == "934084717953810472" || a.id == "937304627047714826" || a.id == "946471132423405618").map(a => a.name)}))
        return admins
      }
    }
    client.createToken = function token(length){

      var a = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890,".split("");
      var b = [];  
      for (var i=0; i<length; i++) {
        var j = (Math.random() * (a.length-1)).toFixed(0);
        b[i] = a[j];
      }
      return b.join("");
      
    }
    
  })
  
  client.on("messageCreate",async (message) => {

    if (message.content.startsWith("!eval")) {
      
      var args = message.content.split(" ").slice(1)
      
  if (message.author.id !== "642752306441617417" && message.author.id !== "840217542400409630") return
  let arguman = args.join(" ");
  if (!arguman) return

  let executedIn = process.hrtime();
  
  function clean(msg) {
    if (typeof msg !== "string")
      msg = Util.inspect(msg, { depth: 0 });
    msg = msg
      .replace(/`/g, "`" + String.fromCharCode(8203))
      .replace(/@/g, "@" + String.fromCharCode(8203));
    
    executedIn = process.hrtime(executedIn);
    executedIn = executedIn[0] * Math.pow(10, 3) + executedIn[1] / Math.pow(10, 6);
    
    return msg
  }
  
  try {
    const evaled = clean(await eval(arguman));
   
    const embddddd = new Discord.MessageEmbed()
   .setTitle("🥳 Kod başarıyla çalıştırıldı")
      .setDescription(`
      > Kod parçacığı \`${executedIn.toFixed(3)} ms\` de **çalıştırıldı.**
      \`\`\`js\n${evaled}\`\`\`
      `)
      .setColor("GREEN")
     message.channel.send({embeds: [embddddd]});
  } catch(err) {
    console.log(err)
    message.channel.send({embeds: [
      new Discord.MessageEmbed()
      .setTitle("🤯 Bir hata ile karşılaşıldı")
      .setDescription(`
      \`\`\`js\n${err}\`\`\`
      `)
      .setColor("RED")
      .setTimestamp()
                         ]});
  }
      
    } 
  })
  
  require(".././bot/main.js")(client)
  
  client.login(settings.token)
  
}