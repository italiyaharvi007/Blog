const express = require('express')
const router = express()
const UserRoute = require("./UserRoute")
const BlogRoute = require("./BlogRoute")

router.use("/user", UserRoute)
router.use("/blog", BlogRoute)

module.exports = router;