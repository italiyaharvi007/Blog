const User = require("../model/UserModel")
const bcrypt = require("bcryptjs")
const jwt = require('jsonwebtoken');

exports.SignUp = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        const user = await User.findOne({ email })
        if (user) {
            res.status(400).send({
                status: "false",
                message: "Email already exists"
            })
        }

        const hashPassword = await bcrypt.hash(password, 12)

        await User.create({
            name,
            email,
            password: hashPassword
        })

        res.status(201).send({
            status: "true",
            message: "User registered successfully"
        })

    } catch (error) {
        console.log(error);
        next(error)
    }
}

exports.Login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email })
        if (!user) {
            res.status(400).send({
                status: "false",
                message: "Email not registered"
            })
        }

        const isPassword = await bcrypt.compare(password, user.password)

        if (!isPassword) {
            res.status(400).send({
                status: "false",
                message: "Password is incorrect"
            })
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

        res.cookie("jwt", token, {
            httpOnly: true,
        })

        res.status(201).send({
            status: "true",
            data: token,
            message: "User Login successfully"
        })

    } catch (error) {
        console.log(error);
        next(error)
    }
}