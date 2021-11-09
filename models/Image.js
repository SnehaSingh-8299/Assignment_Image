const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;
const ImageModel = new Schema({
    userId:{
        type: ObjectId,
        ref : 'User'
    },
    name: {
        type: String,
        default: ""
    },
    normalImage : {
        type : String
    },
    mediumImage : {
        type : String
    },
    smallImage : {
        type : String
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});
const Image = mongoose.model('Image', ImageModel);
module.exports = Image;