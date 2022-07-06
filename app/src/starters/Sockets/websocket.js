const db = require("croxydb")

module.exports = (app, appServer, client, io) => {
  
io.on("connection", (socket) => {
  socket.on("message",(data) => {
    db.push("messages", {username: data.username, avatarLink: data.avatarLink, content: data.content})
    io.emit("message", db.get("messages"))
  })
})
  
}