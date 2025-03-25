const express = require('express')
const router = express()
const validator = require("../middleware/Validator")
const BlogValidation = require("../validation/BlogValidation")
const BlogController = require("../controller/BlogController")
const auth = require("../middleware/Auth")

router.post('/', auth, validator(BlogValidation.BlogSchema), BlogController.create)
router.patch('/:id', validator(BlogValidation.BlogSchema), auth, BlogController.update)
router.delete('/:id', auth, BlogController.delete)
router.get('/:id', auth, BlogController.get)
router.get('/', auth, BlogController.getAll)

module.exports = router;