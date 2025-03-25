const express = require('express')
const app = express()
require("dotenv").config()
const port = process.env.PORT || 3000
const cors = require("cors")
const morgan = require("morgan")
const bodyParser = require("body-parser")
const cookieParser = require('cookie-parser')
const mongoDBInIt = require("./lib/Db")
const route = require("./route/index")
const handler = require("./middleware/Exception")

mongoDBInIt();

app.use(cors())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("tiny"))
app.use(cookieParser())

app.get('/', (req, res) => res.send('Hello World!'))

app.use("/api", route)
app.use(handler)

app.listen(port, () => console.log(`Server listening on port ${port}`))