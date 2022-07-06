const express = require("express")
const db = require("croxydb")
const jwt = require("jsonwebtoken")
const moment = require("moment")
const axios = require('axios').default;
const rateLimit = new Map()
const {MessageEmbed} = require("discord.js")

moment.locale("tr")

module.exports = (client, app) => {
  
  app.get("/app/v1/status", async(req, res) => {
    return res.sendStatus(200)
  })
  
  app.get("/discord", (req, res) => {
    res.redirect("https://discord.gg/nmp8dn3MDN")
  })
  
  app.get("/discord/support", (req, res) => {
    res.redirect("https://discord.gg/HCcku57DT9")
  })
  
  app.get("/twitter", (req, res) => {
    res.redirect("https://twitter.com/@codegx2022")
  })

  app.get("/app/v1/blacklist/:type", async(req, res) => {
  
    var type = req.params.type
    var jwt_token = req.headers.authorization.split(":")[1].trim();
    var userID = await jwt.verify(jwt_token, "secret_key_auth_system", async(err,decoded) => {
      if (err){
        return res.status(406).json({success:false,errorCode:"UNAUTHORIZED", errorDesc: "Giriş yetkilendirme başarısız."});
      }
      return decoded.id
    });
    var member = client.members(userID)
    if (!jwt_token || !userID) return res.json({success: false, errorCode: "AUTHORIZATION", errorDesc: "Giriş yetkilendirme doğrulanamadı."})
    if (!member || (!member.roles.cache.has("933714126209957999") && !member.roles.cache.has("946471132423405618") && !member.roles.cache.has("937304471757799434"))) return res.json({success: false, errorCode: "PERMISSION", errorDesc: "Bunu yapmaya iznin yok."})

    if (type == "get") {
      
      var data = db.get("blacklist")
      
    }
    
  })
  
  app.post("/app/v1/staff/moderate/:type", async(req, res) => {
    
    var type = req.params.type
    var types = ["staffapplies"]
    var jwt_token = req.headers.authorization.split(":")[1].trim();
    var userID = await jwt.verify(jwt_token, "secret_key_auth_system", async(err,decoded) => {
      if (err){
        return res.status(406).json({success:false,errorCode:"UNAUTHORIZED", errorDesc: "Giriş yetkilendirme başarısız."});
      }
      return decoded.id
    });
    if (!jwt_token || !userID) return res.json({success: false, errorCode: "AUTHORIZATION", errorDesc: "Giriş yetkilendirme doğrulanamadı."})
    if (!type || !types.includes(type)) return res.json({success: false, errorCode: "UNDEFINED_FORM_TYPE", errorDesc: "Geçersiz form türü."})

    if (type == types[0]) {
      
      var member = client.members(userID)
      if (!member || (!member._roles.includes("933714126209957999") && !member._roles.includes("946471132423405618"))) return res.json({success: false, errorCode: "PERMISSION", errorDesc: "Yetkili formlarını sadece Kurucu ve Baş yönetim alabilir."})

      var id = req.body.id
      var process = req.body.process
      if (!id) return res.json({success: false, errorCode: "UNDEFINED_USER", errorDesc: "Kullanıcıyı belirtmelisiniz."})
      if (!db.has(`apply.${id}`)) return res.json({success: false, errorCode: "UNDEFINED_FORM", errorDesc: "Bu kullanıcının başvurusu yok!"})
      if (!process || !["confirm", "ignore"].includes(process)) return res.json({success: false, errorCode: "UNDEFINED_PROCESS", errorDesc: "Lütfen geçerli bir işlem girin."})
      if (client.fetchAdmins().find(a => a.user.id == id)) {db.delete(`apply.${id}`); return res.json({success: false, errorCode: "ALREADY_ADMIN", errorDesc: "Bu kullanıcı zaten yetkili olduğu için formu silindi."})}
      
      db.delete(`apply.${id}`)
      var forms = db.get("apply")
      forms = Object.keys(forms).filter(a => forms[a]).map(a => {
        var userData = client.users.cache.get(a)
        return {user: {id: a, name: userData.username, avatarLink: userData.displayAvatarURL({dynamic: true}), data: (db.get(`user.${a}.profile`) || {})}, formData: forms[a].data, createdAt: forms[a].createdTimestamp}
      })
      if (process == "confirm") {
        client.members(id).roles.add("937304627047714826")
        client.channels.cache.get("962986116351410186").send({content: `<:evet:933702567408578620> <@${id}> adlı kullanıcının yetkili başvurusu <@${userID}> tarafından kabul edildi! Kullanıcı deneme yetkili olarak işe başladı.`})
        return res.json({success: true, successDesc: "Kullanıcı başarıyla onaylandı ve deneme yetkili oldu.", data: forms})
      } else if (process == "ignore") {
        client.channels.cache.get("962986116351410186").send({content: `<:evet:933702567408578620> <@${id}> adlı kullanıcının yetkili başvurusu <@${userID}> tarafından reddedildi... Sebep: **${req.body.reason || "Belirtilmemiş."}**`})
        return res.json({success: true, successDesc: "Kullanıcı başarıyla reddedildi.", data: forms})
      }
      
    }    
    
  })
  
  app.get("/app/v1/getForms/:type", async(req, res) => {
    
    var type = req.params.type
    var types = ["staffapplies"]
    var jwt_token = req.headers.authorization.split(":")[1].trim();
    var userID = await jwt.verify(jwt_token, "secret_key_auth_system", async(err,decoded) => {
      if (err){
        return res.status(406).json({success:false,errorCode:"UNAUTHORIZED", errorDesc: "Giriş yetkilendirme başarısız."});
      }
      return decoded.id
    });
    if (!jwt_token || !userID) return res.json({success: false, errorCode: "AUTHORIZATION", errorDesc: "Giriş yetkilendirme doğrulanamadı."})
    if (!type || !types.includes(type)) return res.json({success: false, errorCode: "UNDEFINED_FORM_TYPE", errorDesc: "Geçersiz form türü."})
    if (type == types[0]) {
      
      var member = client.members(userID)
      if (!member || (!member._roles.includes("933714126209957999") && !member._roles.includes("946471132423405618"))) return res.json({success: false, errorCode: "PERMISSION", errorDesc: "Yetkili formlarını sadece Kurucu ve Baş yönetim alabilir."})
      
      var forms = db.get("apply")
      forms = Object.keys(forms).filter(a => forms[a]).map(a => {
        var userData = client.users.cache.get(a)
        return {user: {id: a, name: userData.username, avatarLink: userData.displayAvatarURL({dynamic: true}), data: (db.get(`user.${a}.profile`) || {})}, formData: forms[a].data, createdAt: forms[a].createdTimestamp}
      })
      
      return res.json({success: true, data: forms})
      
    }
    
  })
  
  //CODE EVENTS

  app.post("/app/v1/editCode/:id", async(req, res) => {
    
    var jwt_token = req.headers.authorization.split(":")[1].trim();
    var userID = await jwt.verify(jwt_token, "secret_key_auth_system", async(err,decoded) => {
      if (err){
        return res.status(406).json({success:false,errorCode:"UNAUTHORIZED", errorDesc: "Giriş yetkilendirme başarısız."});
      }
      return decoded.id
    });
    var codedat = db.get(`code.${req.params.id}`)
    
    if (!codedat) return res.json({success: false, errorCode: "UNDEFINED_CODE", errorDesc: "Böyle bir kod bulunmuyor."})
    if ((!jwt_token || !client.members(userID) || !client.members(userID).roles.cache.has("936306646911701082")) && db.get(`code.${req.params.id}.user`) !== userID) return res.json({success: false, errorCode: "AUTHORIZATION", errorDesc: "Giriş yetkilendirme doğrulanamadı."})
    
    var name = req.body.name
    var description = req.body.description
    var note = req.body.note
    var viewable = req.body.viewable
    var lang = req.body.language
    var files = req.body.files || []
    if (!name) return res.json({success: false, errorCode: "UNDEFINED_NAME", errorDesc: "Lütfen kodun adını girin."})
    if (name.length < 4 || name.length > 25) return res.json({success: false, errorCode: "MIN_MAX_VALUE", errorDesc: "Kod adı 4 ila 16 harf arasında yazılmalı."})
    if (!description) return res.json({success: false, errorCode: "UNDEFINED_DESCRIPTION", errorDesc: "Lütfen kodun açıklamasını girin."})
    if (description.length < 20 || description.length > 110) return res.json({success: false, errorCode: "MIN_MAX_VALUE", errorDesc: "Kod açıklaması 20 ila 110 harf arasında yazılmalı."})
    if (!lang) return res.json({success: false, errorCode: "UNDEFINED_LANGUAGE", errorDesc: "Lütfen geçerli bir dil belirtin."})
    if (!["js", "py", "html", "djs", "bdfd", "aoijs", "other"].includes(lang)) return res.json({success: false, errorCode: "UNDEFINED_LANGUAGE", errorDesc: "Lütfen geçerli bir dil belirtin."})
    if (!viewable) return res.json({success: false, errorCode: "UNDEFINED_VIEWABLE", errorDesc: "Lütfen geçerli bir görünülebilirlik girin."})
    if (!["all", "vip", "ultra"]) return res.json({success: false, errorCode: "UNDEFINED_VIEWABLE", errorDesc: "Lütfen geçerli bir görünülebilirlik girin."})
    if (files.length == 0) return res.json({success: false, errorCode: "FILES", errorDesc: "En az 1 dosya yazmalısınız!"})
    if (files.map(a => a.content.replace(new RegExp(" ", "g"), "").length).reduce((a, b) => a + b) == 0) return res.json({success: false, errorCode: "FILES", errorDesc: "Yeteri kadar dosya içeriği yazdığınıza emin olun."})
    files = files.map(a => {return {name: a.name, code: a.content}})
    
    db.set(`code.${req.params.id}`, {
      name: name,
      description: description,
      library: lang,
      view: viewable,
      files: files,
      user: codedat.user,
      createdTimestamp: codedat.createdTimestamp,
    })
    if (note) {
      db.set(`code.${req.params.id}.note`, note)
    }
    if (codedat.viewers) {
      db.set(`code.${req.params.id}.viewers`, codedat.viewers)
    }
    if (codedat.likes) {
      db.set(`code.${req.params.id}.likes`, codedat.likes)
    }
    var user = client.members(userID).user
    const embed = new MessageEmbed().setColor("#9C0C2C").setAuthor("CodeGX - Kod düzenlendi!", client.user.avatarURL()).setTitle(name).setDescription(`> **${user.username}** adlı paylaşımcı tarafından [${name}](https://codegx.xyz/discovery/code/${req.params.id}) adlı kod düzenlendi!`).addField("Açıklama", description, true).addField("Görünürlük", viewable.replace("all", "Herkes").replace("vip", "CodeGX VIP").replace("ultra", "CodeGX ULTRA"), true)
    .addField(`Dil/Kütüphane`, `${{"js": "Javascript", "py": "Python", "html": "Web (HTML)", "djs": "Discord.JS", bdfd: "BDFD", aoijs: "Aoi.JS", other: "Diğer"}[lang]}`, true)
    .setFooter(user.username, user.displayAvatarURL({dynamic: true})).setURL("https://codegx.xyz/discovery/code/" + req.params.id)
    
    client.channels.cache.get("962988717188988938").send({embeds: [embed]})
    
    return res.json({success: true, code: req.params.id})
    
  })
  
  app.post("/app/v1/deleteCode/:id", async(req, res) => {
    
    var jwt_token = req.headers.authorization.split(":")[1].trim();
    var userID = await jwt.verify(jwt_token, "secret_key_auth_system", async(err,decoded) => {
      if (err){
        return res.status(406).json({success:false,errorCode:"UNAUTHORIZED", errorDesc: "Giriş yetkilendirme başarısız."});
      }
      return decoded.id
    });
    var data = db.get(`code.${req.params.id}`)
    
    if (!jwt_token || !client.members(userID)) return res.json({success: false, errorCode: "AUTHORIZATION", errorDesc: "Giriş yetkilendirme doğrulanamadı."})
    if (!data) return res.json({success: false, errorCode: "UNDEFINED_CODE", errorDesc: "Böyle bir kod sistemde yok."})
    if (data.user !== userID && !client.fetchAdmins().find(a => a.user.id == userID)) return res.json({success: false, errorCode: "AUTHORIZATION", errorDesc: "Giriş yetkilendirme doğrulanamadı."})
  
    db.delete(`code.${req.params.id}`)
    
    var user = client.members(userID).user
    const embed = new MessageEmbed().setColor("#9C0C2C").setAuthor("CodeGX - Kod silindi!", client.user.avatarURL()).setTitle(data.name).setDescription(`> **${user.username}** adlı paylaşımcı tarafından **${data.name}** adlı kod sistemden silindi!`)
    .setFooter(user.username, user.displayAvatarURL({dynamic: true}))    
    client.channels.cache.get("962988717188988938").send({embeds: [embed]})
    
    return res.json({success: true})
  
  })
  
  app.post("/app/v1/createCode", async(req, res) => {
    
    var jwt_token = req.headers.authorization.split(":")[1].trim();
    var userID = await jwt.verify(jwt_token, "secret_key_auth_system", async(err,decoded) => {
      if (err){
        return res.status(406).json({success:false,errorCode:"UNAUTHORIZED", errorDesc: "Giriş yetkilendirme başarısız."});
      }
      return decoded.id
    });
    
    if (!jwt_token || !client.members(userID) || !client.members(userID).roles.cache.has("936306646911701082")) return res.json({success: false, errorCode: "AUTHORIZATION", errorDesc: "Giriş yetkilendirme doğrulanamadı."})
    
    var name = req.body.name
    var description = req.body.description
    var note = req.body.note
    var viewable = req.body.viewable
    var lang = req.body.language
    var files = req.body.files || []
    if (!name) return res.json({success: false, errorCode: "UNDEFINED_NAME", errorDesc: "Lütfen kodun adını girin."})
    if (name.length < 4 || name.length > 25) return res.json({success: false, errorCode: "MIN_MAX_VALUE", errorDesc: "Kod adı 4 ila 16 harf arasında yazılmalı."})
    if (!description) return res.json({success: false, errorCode: "UNDEFINED_DESCRIPTION", errorDesc: "Lütfen kodun açıklamasını girin."})
    if (description.length < 20 || description.length > 110) return res.json({success: false, errorCode: "MIN_MAX_VALUE", errorDesc: "Kod açıklaması 20 ila 110 harf arasında yazılmalı."})
    if (!lang) return res.json({success: false, errorCode: "UNDEFINED_LANGUAGE", errorDesc: "Lütfen geçerli bir dil belirtin."})
    if (!["js", "py", "html", "djs", "bdfd", "aoijs", "other"].includes(lang)) return res.json({success: false, errorCode: "UNDEFINED_LANGUAGE", errorDesc: "Lütfen geçerli bir dil belirtin."})
    if (!viewable) return res.json({success: false, errorCode: "UNDEFINED_VIEWABLE", errorDesc: "Lütfen geçerli bir görünülebilirlik girin."})
    if (!["all", "vip", "ultra"]) return res.json({success: false, errorCode: "UNDEFINED_VIEWABLE", errorDesc: "Lütfen geçerli bir görünülebilirlik girin."})
    if (files.length == 0) return res.json({success: false, errorCode: "FILES", errorDesc: "En az 1 dosya yazmalısınız!"})
    if (files.map(a => a.content.replace(new RegExp(" ", "g"), "").length).reduce((a, b) => a + b) == 0) return res.json({success: false, errorCode: "FILES", errorDesc: "Yeteri kadar dosya içeriği yazdığınıza emin olun."})
    files = files.map(a => {return {name: a.name, code: a.content}})
    var code = client.createToken(25)
    
    db.set(`code.${code}`, {
      name: name,
      description: description,
      library: lang,
      view: viewable,
      files: files,
      user: userID,
      createdTimestamp: Date.now()
    })
    if (note) {
      db.set(`code.${code}.note`, note)
    }
    var user = client.members(userID).user
    const embed = new MessageEmbed().setColor("#9C0C2C").setAuthor("CodeGX - Kod eklendi!", client.user.avatarURL()).setTitle(name).setDescription(`> **${user.username}** adlı paylaşımcı tarafından [${name}](https://codegx.xyz/discovery/code/${code}) adlı kod yayınlandı!`).addField("Açıklama", description, true).addField("Görünürlük", viewable.replace("all", "Herkes").replace("vip", "CodeGX VIP").replace("ultra", "CodeGX ULTRA"), true)
    .addField(`Dil/Kütüphane`, `${{"js": "Javascript", "py": "Python", "html": "Web (HTML)", "djs": "Discord.JS", bdfd: "BDFD", aoijs: "Aoi.JS", other: "Diğer"}[lang]}`, true)
    .setFooter(user.username, user.displayAvatarURL({dynamic: true})).setURL("https://codegx.xyz/discovery/code/" + code)
    
    client.channels.cache.get("962988717188988938").send({embeds: [embed]})
    
    return res.json({success: true, code: code})
    
  })
  
  app.post("/app/v1/like/:id", async(req, res) => {
    
    var jwt_token = req.headers.authorization.split(":")[1].trim();
    var userID = await jwt.verify(jwt_token, "secret_key_auth_system", async(err,decoded) => {
      if (err){
        return res.status(406).json({success:false,errorCode:"UNAUTHORIZED", errorDesc: "Giriş yetkilendirme başarısız."});
      }
      return decoded.id
    });
    var code = db.get(`code.${req.params.id}`)
    if (!jwt_token) return res.json({success: false, errorCode: "AUTHORIZATION", errorDesc: "Token bulunamadı."})
    if (!client.members(userID)) return res.json({success: false, errorCode: "AUTHORIZATION", errorDesc: "Kullanıcı sunucuda yok."})
    if (!code) return res.json({success: false, errorCode: "UNDEFINED_CODE", errorDesc: "Böyle bir kod bulunamadı."})
    if (rateLimit.has(userID)) return res.json({success: false, errorCode: "RATE_LIMIT", errorDesc: "Yavaş moda alındınız."})
    
    if ((code.likes || []).includes(userID)) {
      db.unpush(`code.${req.params.id}.likes`, userID)
    } else {
      db.push(`code.${req.params.id}.likes`, userID)
    }
    
    rateLimit.set(userID, 4000)
    setTimeout(function(){
      rateLimit.delete(userID)
    }, 4000)
    
    return res.json({success: true, data: {likes: (db.get(`code.${req.params.id}.likes`) || []).length, areYouLiked: (db.get(`code.${req.params.id}.likes`) || []).includes(userID)}})
    
  })
  
  app.post("/app/v1/save/user", async(req, res) => {
    
    var body = req.body
    var errors = []
    var jwt_token = req.headers.authorization.split(":")[1].trim();
    var userID = await jwt.verify(jwt_token, "secret_key_auth_system", async(err,decoded) => {
      if (err){
        return res.status(406).json({success:false,errorCode:"UNAUTHORIZED", errorDesc: "Giriş yetkilendirme başarısız."});
      }
      return decoded.id
    });
    
    if (!jwt_token || !userID) return res.json({success: false, errorCode: "AUTHORIZATION", errorDesc: "Giriş doğrulandırılmadı."})
    if (!client.members(userID)) return res.json({success: false, errorCode: "UNDEFINED_USER", errorDesc: "Sunucumuzda bulunmadığın için ayarlama yapamazsın."})
    
    if (body.description !== undefined) {
      if (body.description.length < 15) return res.json({success: false, errorCode: "DESCRIPTION_MIN_LENGTH", errorDesc: "Açıklamanız en az 15 karakterden oluşmalıdır!"})
      if (body.description.length > 150) return res.json({success: false, errorCode: "DESCRIPTION_MAX_LENGTH", errorDesc: "Açıklamanız en fazla 150 karakterden oluşmalıdır!"})
      db.set(`user.${userID}.profile.description`, body.description)
    } else {}
    if (body.vanityURL !== undefined) {
      if (db.has(`user.${userID}.membership`) || client.fetchAdmins().find(a => a.user.id == userID)) {
      if (body.vanityURL.split(" ").join(".").toLowerCase().length < 4) return res.json({success: false, errorCode: "VANITY_URL_MIN_LENGTH", errorDesc: "Özel URL en az 4 karakterden oluşmalıdır!"})
      if (body.vanityURL.split(" ").join(".").toLowerCase().length > 10) return res.json({success: false, errorCode: "VANITY_URL_MAX_LENGTH", errorDesc: "Özel URL en fazla 10 karakterden oluşmalıdır!"})
        db.set(`user.${userID}.profile.vanityURL`, body.vanityURL)
      } else {
        errors.push("VANITY_URL")
      }
    }
    if (body.banner !== undefined) {
      var user = await client.users.fetch(userID, {force: true})
      if (body["banner"] !== user.bannerURL({size: 2048, dynamic: true}).replace(".webp", ".png")) {
        errors.push("BANNER")
      } else {
        db.set(`user.${userID}.profile.banner`, body["banner"])
      }
    }
    
    return res.json({success: true, message: `Değişiklikler kaydedildi.`, errors, data: db.get(`user.${userID}`) || {profile: {}}})
  
  })
  
  app.get("/app/v1/getCode/:id", async(req, res) => {
    
    var code = db.get(`code.${req.params.id}`)
    var jwt_token = req.headers.authorization.split(":")[1].trim();
    var owner;
    if (!code) return res.json({success: false, errorCode: "UNDEFINED_CODE", errorDesc: "Böyle bir kod bulunamadı."})
    var userID = await jwt.verify(jwt_token, "secret_key_auth_system", async(err,decoded) => {
      if (err){
        return res.status(406).json({success:false,errorCode:"LOGIN", errorDesc: "Giriş yetkilendirme başarısız."});
      }
      return decoded.id
    });
    if (!jwt_token) return res.json({success: false, errorCode: "AUTHORIZATION", errorDesc: "Token bulunamadı."})
    if (!client.members(userID)) return res.json({success: false, errorCode: "AUTHORIZATION", errorDesc: "Kullanıcı sunucuda yok."})
    if (code.view == "vip" && (!db.has(`user.${userID}.membership`)) && !client.fetchAdmins().find(a => a.user.id == userID) && !client.members(userID).roles.cache.has("936306646911701082")) return res.json({success: false, errorCode: "PRICING_REQUIRED", errorDesc: "Bu koda erişim sağlamak için VIP veya ULTRA üyeliğine sahip olmalısınız."})
    if (code.view == "ultra" && (!db.has(`user.${userID}.membership`) || !["ultra"].includes(db.get(`user.${userID}.membership.type`))) && !client.fetchAdmins().find(a => a.user.id == userID) && !client.members(userID).roles.cache.has("936306646911701082")) return res.json({success: false, errorCode: "PRICING_REQUIRED", errorDesc: "Bu koda erişim sağlamak için ULTRA üyeliğine sahip olmalısınız."})
    
    code["createdTimestamp"] = moment(code.createdTimestamp).format("DD/MM/YYYY HH:mm:SS")
    owner = client.users.cache.has(code.user) ? client.users.cache.get(code.user) : await client.users.fetch(code.user)
    owner.avatarLink = owner.displayAvatarURL({dynamic: true})
    owner = {data: (db.get(`user.${code.user}.profile`) || {}), username: owner.username, avatarLink: owner.avatarLink, id: owner.id}
    code["user"] = owner 
    code["viewers"] = (code.viewers || []).length
    code["likes"] = (code.likes || []).length
    
    if (!(db.get(`code.${req.params.id}.viewers`) || []).includes(userID)) {
      db.push(`code.${req.params.id}.viewers`, userID)
    }
    
    return res.json({success: true, data: {yourID: userID, manageable: (db.get(`code.${req.params.id}.user`) == userID || (client.fetchAdmins().find(a => a.user.id == userID))), areYouLiked: (db.get(`code.${req.params.id}.likes`) || []).includes(userID), ...code}})
    
  })

  app.get("/app/v1/getBanner/:id", async(req, res) => {
    
    if (!req.params.id) return res.json({success: false, errorCode: "UNDEFINED_USER", errorDesc: "Kullanıcı ID'sine bağlı bir hesap yok."})
    
    var user = await client.users.fetch(req.params.id, {force: true})
    
    try {
      return res.json({success: true, data: user.bannerURL({dynamic: true, size: 2048}).replace(".webp", ".png")})
    } catch(err) {
      return res.json({success: false, errorCode: "UNDEFINED_BANNER", errorDesc: "Kullanıcının afişi bulunmuyor."})
    }
  })
  
  app.get("/app/v1/fetch", async(req, res) => {
    
    var query = req.query
    if (query) {
      if (query["query"] && query["query"] == "admins") {
        var admins = client.fetchAdmins()
        admins = admins.map(a => {
          const profiledata = db.get(`user.${a.user.id}`) || {profile: {}}
          delete profiledata["liked"]
          return {user: {id: a.user.id, username: a.user.username, avatarLink: a.user.displayAvatarURL({dynamic: true})}, roles: a.roles, data: db.get(`user.${a.user.id}`) || {profile: {}}}
        })
        return res.json({success: true, data: admins})
      } else if (query["query"] && query["query"] == "user") {
        var data = db.get("user")
        var user = isNaN(req.query.userID) ? Object.keys(db.get(`user`)).find(a => data[a].profile && data[a].profile.vanityURL && data[a].profile.vanityURL == req.query.userID) || 0 : req.query.userID
        var member = client.members(user) ? client.members(user)._roles : []
        if (!user) return res.json({success: false, errorCode: "UNDEFINED_USERID", errorDesc: "Kullanıcı kodu bulunamadı."})
        try {
          user = client.users.cache.has(user) ? client.users.cache.get(user) : await client.users.fetch(user)
          user = {username: user.username, tag: user.tag, bot: (user.bot) ? "Bot" : "Bot değil", avatarLink: user.displayAvatarURL({dynamic: true}), discriminator: user.discriminator, createdTimestamp: moment(user.createdTimestamp).format("DD/MM/YYYY HH:mm:SS"), id: user.id}
        } catch(err) {
          res.json({success: false, errorCode: "NOTHING", errorDesc: "Bu ID'ye sahip bir kullanıcı bulunmuyor."})
        }
        
        if (db.has(`apply.${user.id}`) && data[user.id]) {
          data[user.id].applyStatus = {status: db.get(`apply.${user.id}.status`)}
        }
        
        return res.json({success: true, user, data: data[user.id] || {profile: {}}, badges: [member.includes("933726995081220107"), member.includes("937304987510374421"), member.includes("934084717953810472"), member.includes("936170346569154621"), member.includes("937304471757799434"), member.includes("946471132423405618"), member.includes("933714126209957999")]})
      } else if (query["query"] && query["query"] == "codes") {
                
        var data = db.get("code")
        var allCodes = Object.keys(data)
        var filter = req.query.filter || "all"
        var language = req.query.language || "all"
        var listCodes = []
        
        for(var i = 0;i < allCodes.length;i++) {
          var user = client.users.cache.has(data[allCodes[i]].user) ? client.users.cache.get(data[allCodes[i]].user) : await client.users.fetch(data[allCodes[i]].user)
          listCodes.push({name: data[allCodes[i]].name, description: data[allCodes[i]].description, library: data[allCodes[i]].library, view: data[allCodes[i]].view, viewers: (data[allCodes[i]].viewers || []).length, likes: (data[allCodes[i]].likes || []).length, user: {
            avatarLink: user.displayAvatarURL({dynamic: true}),
            username: user.username
          }, code: allCodes[i], created: moment(data[allCodes[i]].createdTimestamp).fromNow(), createdTimestamp: data[allCodes[i]].createdTimestamp})
        }
        
        return res.json({success: true, codes: listCodes})
        
      }
    }
    
  })
  
  app.post("/app/v1/apply", async(req, res) => {
        
    var body = req.body
    var Authorization = req.headers
    var jwt_token = req.headers.authorization.split(":")[1].trim();
    var admins = client.fetchAdmins()
    var allData = {
      name: body.name,
      old: body.old,
      online: body.online,
      experiments: body.experiments
    }
    var userID = await jwt.verify(jwt_token, "secret_key_auth_system", async(err,decoded) => {
      if (err){
        return res.status(406).json({success:false,errorCode:"LOGIN", errorDesc: "Giriş yetkilendirme başarısız."});
      }
      return decoded.id
    });
        
    if (!jwt_token) return res.json({success: false, errorCode: "LOGIN", errorDesc: "Giriş yetkilendirme başarısız."})
    if (!client.members(userID)) return res.json({success: false, errorCode: "NOT_IN_SERVER", errorDesc: "Sunucumuzda bulunmuyorsun!"})
    if (admins.find(a => a.user.id == userID)) return res.json({success: false, errorCode: "ALREADY", errorDesc: "Zaten yetkilisin!"})
    if (db.has(`apply.${userID}`)) return res.json({success: false, errorCode: "ALREADY_APPLIED", errorDesc: "Zaten bir başvuru kaydın var! Lütfen cevap alana kadar bekle."})
    if (2 >= allData.name) return res.json({success: false, errorCode: "NAME", errorDesc: "Adınız en az 3 harften oluşmalıdır!"})
    if (50 >= allData.experiments.length || 500 < allData.experiments.length) return res.json({success: false, errorCode: "EXPERIMENTS", errorDesc: "Tecrübeniz 50 ila 500 harften oluşmalıdır!"})
    if (isNaN(allData.old) || Number(allData.old) < 10 || Number(allData.old) > 30) return res.json({success: false, errorCode: "OLD", errorDesc: "Yaşınız 10 ila 30 arasında olmalıdır!"})
    if (isNaN(allData.online.discord) || Number(allData.online.discord) < 2) return res.json({success: false, errorCode: "DISCORD_ONLINE", errorDesc: "Discord aktifliğiniz en az 2 saat olmalıdır!"})
    if (Number(allData.online.discord) > 24) return res.json({success: false, errorCode: "ALERT_MALLIK", errorDesc: "1 günün 24 saatten oluştuğunu ilkokulda öğrenmeliydiniz!"})
    if (Number(allData.online.server) > Number(allData.online.discord)) return res.json({success: false, errorCode: "ALERT_MALLIK", errorDesc: "Sunucumuzun discordda olduğunu unutmadan aktifliğinizi düzeltin!"})
    
    db.set(`apply.${userID}`, {
      createdTimestamp: Date.now(),
      data: allData,
      status: "WAIT"
    })
    client.channels.cache.get("962986116351410186").send({content: `<:wait:943220597511569428> <@${userID}> tarafından yetkili başvurusu yapılmıştır. Form detayları yetkili panelde bulunmaktadır.`})
    return res.json({success: true})
    
  })
  
}