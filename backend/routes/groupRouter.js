const express = require("express")
const post_req_group = require("../controllers/groupController")
const isAuth = require("../middlewares/authMiddleware")
const isAdmin = require("../middlewares/isAdminMiddleware")

const delete_req_group = require("../controllers/deleteGroupController")

const groupRouter = express.Router()
groupRouter.post("/create",isAuth,post_req_group)
groupRouter.delete("/delete/:id", isAuth, delete_req_group)
module.exports = groupRouter