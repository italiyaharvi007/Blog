const Blog = require("../model/BlogModel")

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

exports.getAll = async (req, res, next) => {
    try {
        const user = req.user;
        const options = {
            page: parseInt(req.query.page) || 1,
            limit: parseInt(req.query.limit) || 10,
            sort: { createdAt: -1 },
        }
        const blog = await Blog.paginate({ userId: user._id }, options)
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