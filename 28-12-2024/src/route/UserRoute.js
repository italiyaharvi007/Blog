const express = require('express')
const router = express()
const validator = require("../middleware/Validator")
const UserValidation = require("../validation/UserValidation")
const UserController = require("../controller/UserController")

router.post('/signUp', validator(UserValidation.userSignupSchema), UserController.SignUp);
router.post('/login', UserController.Login);
router.post('/createUser',
    UserController.uploadImage,
    UserController.resizeImage,
    UserController.createUserWithImage);
router.patch('/updateUser/:id',
    UserController.uploadImage,
    UserController.resizeImage,
    UserController.updateProfile);

module.exports = router;