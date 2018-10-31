const mongoose = require('mongoose'); 
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const User = new Schema({
    email:{
        type: String,
        required: true,
        unique: true,
    },
    type:{
        type: Number, 
        default: 1
    },
    profile:{
        type: String,
        required: false,
    },
    status:{
        type: Number,
        default:0
    },
    targets: [{
        type:mongoose.Schema.Types.ObjectId,
        ref: "target"
    }]
},{
    usePushEach:true
});
User.plugin(passportLocalMongoose);

const Users = mongoose.model("user", User);
module.exports = Users;