const post_req__leave = require("../controllers/leaveGroupController");
const express = require("express");
const isAuth = require("../middlewares/authMiddleware");

const leaveGroupRouter = express.Router()

leaveGroupRouter.post("/leave/:id",isAuth,post_req__leave)

module.exports = leaveGroupRouter
