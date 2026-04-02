const post_req_join = require("../controllers/joinGroupController");
const express = require("express");
const isAuth = require("../middlewares/authMiddleware");
const joinRouter = express.Router();
joinRouter.post("/join/:id",isAuth,post_req_join)
module.exports = joinRouter
