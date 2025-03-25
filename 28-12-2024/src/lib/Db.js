const mongoose = require('mongoose');
async function mongoDBInIt() {
    try {
        await mongoose.connect(process.env.MONGO_URL).then(() => {
            console.log("MongoDB Connect");
        }).catch((err) => {
            console.log(err);
        })
    } catch (error) {
        console.log(error);
    }
}
module.exports = mongoDBInIt;