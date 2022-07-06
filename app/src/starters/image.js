const express = require("express")

module.exports = (app) => {
  
  app.use("/app/img", express.static(require("path").resolve("./src/img")))
  
}