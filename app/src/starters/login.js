const express = require("express")
const btoa = require("btoa");
const XMLHttpRequest = require("xhr2")
const jwt = require("jsonwebtoken")
const db = require("croxydb")
const info = {secret: "zo4XX9sH9bwN89yqMdkL99FltauLm-Ar",id: "648901844432846849"}
const credds = btoa(info.id + ":" + info.secret)

module.exports = (app, botData, client) => {
    
  app.get("/me", async(req,res,next) => {
    try {
      if (!req.headers.authorization) return res.status(400).json({success:false, error:"Unauthorized"})
      let jwt_token = req.headers.authorization.split(":")[1].trim();
      let access_token = req.headers.accesstoken
      if(!jwt_token) return res.status(400).json({success:false,error:"Unauthorized"})
      if (!db.has(`access.${access_token}`)) return res.status(400).json({success: false, error: "Unauthorized"})
      var allAccessData = db.get("access")
      jwt.verify(jwt_token, "secret_key_auth_system", async(err,decoded) => {
        if (err){ 
          return res.status(406).json({success:false,error:err});
        }
        if (db.get(`access.${access_token}.userID`) !== decoded.id) return res.status(400).json({success: false, error: "Unauthorized"})
        var user = client.users.cache.has(decoded.id) ? client.users.cache.get(decoded.id) : await client.users.fetch(decoded.id)
        var admin = (client.fetchAdmins().find(a => a.user.id == user.id) !== undefined) ? true : false
        var codesharer = (client.members(decoded.id) && (client.members(decoded.id).roles.cache.has("936306646911701082") || client.fetchAdmins().find(a => a.user.id == user.id))) ? true : false
        return res.status(200).json({success:true, data:{...user, accessData: db.get(`access.${access_token}`), avatarLink: user.displayAvatarURL({dynamic: true}), admin: admin, sharer: codesharer, scopes: (decoded.scopes || ["identify"]), data: db.get(`user.${user.id}`) || {profile: {}}}});
      }
      );
    }catch(e) {
      console.log(e)
      res.status(500).json({success:false,error:e})
    }
  })

  
  app.post("/auth/login", async(req, res, next) => {
    try {
      let { code, redirect } = req.body;
      var requiredData = {}
      let request = new XMLHttpRequest();
      var connections;
      var accessData = db.get("access")
      if (!redirect) redirect = "https://codegx.xyz/auth/discord"
      if (!code) return res.status(404).json({ success: false, error: "code not found" });
      request.open("POST", "https://discordapp.com/api/oauth2/token");
      request.setRequestHeader("Authorization", `Basic ${credds}`);
      request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
      request.send(`grant_type=authorization_code&code=${code}&redirect_uri=${redirect}`);
      request.onreadystatechange = function () {
        if (request.readyState === 4) {
          if (request.status === 200) {
            let data = JSON.parse(request.responseText);
            if (data.scope.includes("connections")) {
              let connectreq = new XMLHttpRequest();
              connectreq.open("GET", "https://discordapp.com/api/users/@me/connections")
              connectreq.setRequestHeader("Authorization", `Bearer ${data.access_token}`)
              connectreq.send()
              connectreq.onreadystatechange = function(){
                if (connectreq.readyState === 4) {
                  if (connectreq.status === 200) {
                    connections = JSON.parse(connectreq.responseText);
                  }
                }
              }
            }
            requiredData["accessToken"] = data.access_token
            requiredData["scope"] = data.scope.split(" ")
            let token = data.access_token;
            let request2 = new XMLHttpRequest();
            request2.open("GET", `https://discordapp.com/api/users/@me`);
            request2.setRequestHeader("Authorization", `Bearer ${token}`);
            request2.send();
            request2.onreadystatechange = function () {
              if (request2.readyState === 4) {
                if (request2.status === 200) {
                  let data2 = JSON.parse(request2.responseText);
                  let token = jwt.sign(
                    {
                      id: data2.id,
                    },
                    "secret_key_auth_system",
                    {
                      algorithm: "HS256",
                      expiresIn: "1w",
                    }
                  )
                  
                  var available = Object.keys(accessData).find(a => accessData[a].userID == data2.id)
                  var accessCode;
                  if (!available) {
                    accessCode = "acc-" + client.createToken(55) + "-0" + Object.keys(accessData).length+1
                  }
                  if (connections && connections.length !== 0) {
                    db.set(`user.${data2.id}.profile.connections`, connections.filter(a => a.visibility !== 0).map(a => {return {type: a.type, name: a.name, id: a.id}}))
                  }
                  db.set(`access.${(accessCode) ? accessCode : available}`, {
                    userID: data2.id,
                    scope: requiredData.scope,
                    accessToken: requiredData.accessToken,
                    ipAdressğ: req.headers["x-forwarded-for"].split(",")[0].split('.').join('.')
                  })
                  
                  res.status(200).json({
                    success: true,
                    message: "User logged in successfully.",
                    data: data2,
                    jwt: token,
                    accessCode: (accessCode) ? accessCode : available
                  });
                  
                }
              }
            }
          }
        }
      }
    } catch(err) {
      console.log(err);
      next(err);
    }
  })
  
}