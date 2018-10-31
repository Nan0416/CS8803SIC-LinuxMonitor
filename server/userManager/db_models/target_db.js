const mongoose = require('mongoose'); 
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const Target = new Schema({
    ownerid: {
        type: mongoose.Schema.Types.ObjectId,
        require: true
    },
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
Target.index({ownerid: 1, name: 1}, {unique: true});
Target.index({ownerid: 1, protocol: 1, ip: 1, port: 1}, {unique: true});


const Targets = mongoose.model("target", Target);
module.exports = Targets;