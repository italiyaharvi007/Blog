const Blog = require("../model/BlogModel")
const User = require("../model/UserModel")
const APIFeatures = require("../utils/ApiFeature")

exports.create = async (req, res, next) => {
    try {
        const user = req.user;
        const { name, description } = req.body;

        await Blog.create({
            name,
            description,
            userId: user._id
        })

        res.status(201).send({
            status: "true",
            message: "Blog created successfully"
        })

    } catch (error) {
        console.log(error);
        next(error)
    }
}

exports.update = async (req, res, next) => {
    try {
        const { name, description } = req.body;
        const blog = await Blog.findById(req.params.id)
        if (!blog) {
            res.status(400).send({
                status: "false",
                message: "Blog not found"
            })
        }

        await Blog.findByIdAndUpdate(req.params.id, {
            name, description
        })

        res.status(201).send({
            status: "true",
            message: "Blog updated successfully"
        })

    } catch (error) {
        console.log(error);
        next(error)
    }
}

exports.delete = async (req, res, next) => {
    try {
        const blog = await Blog.findById(req.params.id)
        if (!blog) {
            res.status(400).send({
                status: "false",
                message: "Blog not found"
            })
        }

        await Blog.findByIdAndDelete(req.params.id)

        res.status(201).send({
            status: "true",
            message: "Blog deleted successfully"
        })

    } catch (error) {
        console.log(error);
        next(error)
    }
}

exports.get = async (req, res, next) => {
    try {
        const blog = await Blog.findById(req.params.id)
        if (!blog) {
            res.status(400).send({
                status: "false",
                message: "Blog not found"
            })
        }

        res.status(201).send({
            status: "true",
            data: blog,
            message: "Blog retrieved successfully"
        })

    } catch (error) {
        console.log(error);
        next(error)
    }
}

// exports.getAll = async (req, res, next) => {
//     try {
//         const user = req.user;
//         const options = {
//             page: parseInt(req.query.page) || 1,
//             limit: parseInt(req.query.limit) || 10,
//             sort: { createdAt: -1 },
//         }
//         const blog = await Blog.paginate({ userId: user._id }, options)
//         if (!blog) {
//             res.status(400).send({
//                 status: "false",
//                 message: "Blog not found"
//             })
//         }

//         res.status(201).send({
//             status: "true",
//             data: blog,
//             message: "Blog retrieved successfully"
//         })

//     } catch (error) {
//         console.log(error);
//         next(error)
//     }
// }

// exports.getAll = async (req, res, next) => {
//     try {
//         const user = req.user;
//         const features = new APIFeatures(Blog.find({userID: user._id}), req.query)
//         .filter()
//         .sort()
//         .paginate();
//       const total_record = new APIFeatures(Blog.find({userID: user._id}), req.query)
//         .filter()
//         .sort();

//       const blogs = await features.query;
//       const total = await total_record.query;

//       // SEND RESPONSE
//       res.status(200).json({
//         status: "success",
//         results: blogs.length,
//         total_record: total.length,
//         data: blogs,
//         message: "Blogs Retrieved Successfully.",
//       });

//     } catch (error) {
//         console.log(error);
//         next(error)
//     }
// }

exports.getAll = async (req, res, next) => {
    try {
        const conditions = [];

        // Text search
        if (req.query.search) {
            const searchRegex = new RegExp(req.query.search, "i");
            conditions.push({ name: { $regex: searchRegex } });
        }

        // Date filters
        if (req.query.checkInDate || req.query.checkOutDate) {
            const dateConditions = [];
            if (req.query.checkInDate) {
                dateConditions.push({ check_in_date: { $gte: req.query.checkInDate } });
            }
            if (req.query.checkOutDate) {
                dateConditions.push({ check_out_date: { $lte: req.query.checkOutDate } });
            }
            if (dateConditions.length) {
                conditions.push({ $and: dateConditions });
            }
        }

        // Search by user
        if (req.query.searchUser) {
            const userRegex = new RegExp(req.query.searchUser, "i");
            const users = await User.find({ name: userRegex });
            if (!users.length) {
                return res.status(404).json({ status: "fail", message: "User Not Found." });
            }
            const userIds = users.map(user => user._id);
            conditions.push({ userId: { $in: userIds } });
        }

        const finalCondition = conditions.length ? { $and: conditions } : {};

        const features = new APIFeatures(
            Blog.find(finalCondition).populate("userId name"),
            req.query
        ).filter().sort().paginate();

        const blogTotal = new APIFeatures(
            Blog.find(finalCondition).populate("userId name"),
            req.query
        ).filter().sort();

        const findBlog = await features.query;
        const totalData = await blogTotal.query;

        res.status(200).json({
            status: "success",
            results: findBlog.length,
            total_record: totalData.length,
            data: findBlog,
            message: "Blog Retrieved Successfully.",
        });

    } catch (error) {
        console.log(error);
        next(error);
    }
};
