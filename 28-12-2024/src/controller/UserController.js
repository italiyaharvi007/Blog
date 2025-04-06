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

//forgot password
exports.forgotPassword = catchAsync(async (req, res, next) => {
    // 1) Get user based on POSTed email
    const user = await WellnessMahotsavMentorUser.findOne({
      email: req.body.email,
    });
    if (!user) {
      return next(new AppError("There Is No User With Username.", 404));
    }
    // 2) Generate the random reset token
    const resetToken = await user.createPasswordResetToken();
    await user.save({
      validateBeforeSave: false,
    });
    // 3) Send it to user's email
    try {
      const resetURL = `${process.env.FRONTEND_URL}/wellness-reset-password/${resetToken}`;
      console.log("resetURL :", resetURL);
      await new Email(user, resetURL).sendPasswordReset(user.first_name);
      res.status(200).json({
        status: "success",
        message: "Token sent to email!",
      });
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({
        validateBeforeSave: false,
      });
      return next(
        new AppError("There Was An Error Sending The Email. Try Again Later!"),
        500
      );
    }
  });

//reset Password
exports.resetPassword = catchAsync(async (req, res, next) => {
    console.log("test")
    // 1) Get user based on the token
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");
    const user = await WellnessMahotsavMentorUser.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: {
        $gt: Date.now(),
      },
    });
    // 2) If token has not expired, and there is user, set the new password
    if (!user) {
      return next(new AppError("Token Is Invalid Or Has Expired", 400));
    }
  
    // 3) Check if password and confirm password match
    if (req.body.password !== req.body.confirm_password) {
      return next(
        new AppError("Password and Confirm Password does not match", 400)
      );
    }
  
    user.password = req.body.password;
    user.confirm_password = req.body.confirm_password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    createResetPasswordSendToken(user, 200, req, res);
  });

  //update password
exports.updatePassword = catchAsync(async (req, res, next) => {
    // 1) Get user from collection
    const user = await WellnessMahotsavMentorUser.findById(req.user._id).select("+password");
    if (!user) {
      return next(new AppError("There Is No User With User Address.", 404));
    }
    // 2) Check if POSTed current password is correct
    if (!(await user.correctPassword(req.body.old_password, user.password))) {
      return next(new AppError("Your Current Password Is Wrong.", 422));
    }
    if (req.body.new_password !== req.body.confirm_password) {
      return next(
        new AppError("Your New Password And Confirm Password Does Not Match.", 422)
      );
    }
    // 3) If so, update password
    user.password = req.body.new_password;
    user.confirm_password = req.body.confirm_password;
    await user.save();
    // 4) Log user in, send JWT
    res.status(200).json({
      status: "success",
      message: "Password Change Successfully",
    });
  });
  