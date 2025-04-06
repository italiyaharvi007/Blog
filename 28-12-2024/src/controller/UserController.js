const User = require("../model/UserModel")
const bcrypt = require("bcryptjs")
const jwt = require('jsonwebtoken');
const catchAsync = require("../../src/utils/CatchSync");
const multer = require("multer");
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image")) {
        cb(null, true);
    } else {
        cb(new AppError("Please upload only images.", 400), false);
    }
};

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter,
});
exports.uploadImage = upload.single("image");

exports.resizeImage = catchAsync(async (req, res, next) => {
    if (!req.file) return next();
    const dir = path.join(__dirname, '../../src/public/img/user_image');
    // Check if the directory exists, if not, create it
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    const mimetype = req.file.mimetype;
    const imageType = mimetype.split("/")[1];
    req.file.image = `userImage-${Date.now()}.${imageType}`;
    await sharp(req.file.buffer).toFile(`${dir}/${req.file.image}`);
    next();
});

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

exports.createUserWithImage = async (req, res, next) => {
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
            password: hashPassword,
            image: req.file ? `public/img/user_image/${req.file.image}` : null,
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


exports.updateProfile = async (req, res, next) => {
    try {
        const { name, email } = req.body;
        const findUser = await User.findById(req.params.id);

        const usedEmail = await User.findOne({ email: email, _id: {$ne: findUser} });
        if (usedEmail) {
            return res.status(422).send({
                status: "false",
                message: "User Email Already Register"
            })
        }

        if (findUser.image && req.file) {
            fs.unlink(path.resolve(`${__dirname}/../../../${findUser.image}`), (err) => {
                if (err) console.log(err);
            });
        }

        if (req.file && req.file.image) {
            updatedImage = "public/img/user_image/" + req.file.image;
        } else {
            updatedImage = findUser.image;
        }

        await findUser.updateOne({
            name: name,
            email: email,
            image: updatedImage
        })
        res.status(200).send({
            status: "true",
            message: "User Profile Update successfully"
        })
    } catch (error) {
        console.log(error);
    }
}

  