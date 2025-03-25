const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const BlogSchema = new mongoose.Schema({
    name: String,
    description: {
        type: String,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
}, { timestamps: true });

BlogSchema.plugin(mongoosePaginate);
module.exports = mongoose.model('Blog', BlogSchema);