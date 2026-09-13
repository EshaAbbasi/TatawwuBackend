const mongoose = require("mongoose");

const registrationSchema = new mongoose.Schema(
    {

        volunteerId:{
            type: mongoose.Schema.types.ObjectId,
            ref:"User",
            required:true,

        },
        CampaignId:{
            type: mongoose.Schema.types.ObjectId,
            ref:"Campaign",
            required:true,
        },

        status:{
            type:String,
            enum:[
                "Registered",
                "Cancelled"
            ],
            default:"Registered",
        },

        attendance:{
            type:String,
            enum:[
                "Unmarked",
                "Attended",
                "Absent"
            ],
            default:"Unmarked",
        },

        createdAt:{
            type:Date,
            timestamps:true,
        },

        updatedAt:{
            type:Date,
            timestamps:true,
        },

    },
    {

        timestamps:true,
    }
    
);

registrationSchema.index({ volunteerId: 1, CampaignId: 1 }, { unique: true });

const Registration = mongoose.model('Registration', registrationSchema);
module.exports = Registration;