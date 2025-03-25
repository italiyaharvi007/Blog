module.exports = handler = (err, req, res, next) => {
    const message = err.message || "something went wrong"
    res.send({
        status: "error",
        success: "false",
        message,
        statusCode: 400
    })
}