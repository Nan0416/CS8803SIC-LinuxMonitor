const mongoose = require('mongoose'); 
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const Target = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    protocol:{
        type: String,
        default: "http",
    },
    ip: {
        type:String,
        required: true
    },
    port:{
        type:Number,
        default: 9000
    },
    status:{
        type: Number,
        default: 0 // 0 is register but not working
    }
});
Target.index({protocol: 1, ip: 1, port: 1}, {unique: true});
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
    targets:{
        type:[Target],
        default:[]
    }
},{
    usePushEach:true
});
user.plugin(passportLocalMongoose);

const Users = mongoose.model("user", User);
module.exports = Users;