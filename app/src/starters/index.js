// HTTP SERVER
const express = require("express")
const app = express()
const http = require("http")
const appServer = http.createServer(app);
const {Server} = require("socket.io")
const io = new Server(appServer,{cors: {origin:"*"}})

// GET SETTINGS
const apiData = require("../settings/web.json")
const botData = require("../settings/bot.json")

// DISCORD BOT SERVER
const {Client, Intents} = require("discord.js")
const IncludedIntents = Object.entries(Intents.FLAGS).reduce((t, [, V]) => t | V, 0)
const client = new Client({intents: IncludedIntents})
const discordModals = require('discord-modals')
discordModals(client);

// API ROUTER
apiData["router"] = apiData.apiURL + "/app/" + apiData.version + "/"
app.use(require("cors")())
app.use(express.json())

// SOCKET FUNCTIONS
require("./Sockets/websocket.js")(app, appServer, client, io)

// CLIENT FOR BOT
require("./bot.js")(client, botData)

// IMAGES DATA
require("./image.js")(app)

// API FUNCTIONS
require("./api.js")(client, app)

// LOGIN SYSTEM
require("./login.js")(app, apiData, client)

// LISTENING PORT
appServer.listen(process.env.PORT, () => {
  console.log("Website hazır durumda. PORT " + process.env.PORT)
})

 