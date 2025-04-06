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
//         .searchName()
//         .paginate();
//       const total_record = new APIFeatures(Blog.find({userID: user._id}), req.query)
//         .filter()
//         .searchName()
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
        if (req.query.search) {
            const searchRegex = new RegExp(req.query.search, "i");
            conditions.push({
                $or: [
                    { name: { $regex: searchRegex } },
                ],
            });
        }
        if (req.query.checkInDate || req.query.checkOutDate) {
            const startDate = req.query.checkInDate;
            const endDate = req.query.checkOutDate;
            console.log("startDate :", startDate);
            console.log("endDate :", endDate);

            // Construct a query condition for both check_in_date and check_out_date
            const dateCondition = {};

            if (startDate) {
                dateCondition.$gte = startDate;
            }

            if (endDate) {
                dateCondition.$lte = endDate;
            }

            // Push the combined condition into the conditions array
            conditions.push({
                $and: [
                    { check_in_date: dateCondition },
                    { check_out_date: dateCondition },
                ],
            });
        }
        if (req.query.searchUser) {
            const searchRegex = new RegExp(req.query.searchUser, "i");
            let user = await User.find({ name: req.query.searchRegex });
            if (!user) {
                return res.status(404).json({
                    status: "fail",
                    message: "User Not Found.",
                });
            }
            const userIds = users.map(user => user._id);
            conditions.push({ userId: { $in: userIds } });
        }

        const finalCondition = conditions.length > 0 ? { $and: conditions } : {};
        const features = new APIFeatures(
            Blog.find({
                $or: [
                    { userID: user._id },
                ],
                ...finalCondition,
            }).populate([
                {
                    path: "userId",
                    model: "User",
                    select: "name",
                },
            ]),
            req.query
        )
            .filter()
            .sort()
            .paginate();

        const blogTotal = new APIFeatures(
            Booking.find({
                $or: [
                    { userID: user._id },
                ],
                ...finalCondition,
            }).populate([
                {
                    path: "userId",
                    model: "User",
                    select: "name",
                },
            ]),
            req.query
        )
            .filter()
            .sort();

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
        next(error)
    }
}