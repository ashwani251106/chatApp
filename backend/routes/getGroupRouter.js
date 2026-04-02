const express = require("express")
const {post_req_getGroups,post_req_allGroup} = require("../controllers/getGroupsController");

const isAuth = require("../middlewares/authMiddleware");
const getGroupRouter = express.Router()
getGroupRouter.post("/get",isAuth,post_req_getGroups)
getGroupRouter.post("/",isAuth,post_req_allGroup)
module.exports = getGroupRouter