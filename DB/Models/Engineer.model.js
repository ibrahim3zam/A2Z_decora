import { Schema, model } from 'mongoose'
import mongoose from "mongoose";


const EngineerSchema = new Schema(
    {   
        userName: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        isConfirmed: {
            type: Boolean,
            default: false,
        },

        phoneNumber: {
            type: String,
            required: true,
        },
        address: [
            {
                type: String,
                required: true,
            },
        ],
        profilePicture: [{
            secure_url: String,
            public_id: String,
        }],

        licencePicture: {                //شهادة اثبات هويه 
            secure_url: String,
            public_id: String,
        },

        status: {
            type: String,
            default: 'Offline',
            enum: ['Online', 'Offline'],
        },
        gender: {
            type: String,
            default: 'Not specified',
            enum: ['male', 'female', 'Not specified'],
        },
        Gallery:[{
            secure_url: String,
            public_id: String,
        }],
        
    
        age: Number,
        token: String,
        forgetCode: String,
        customId:String

    },
    { timestamps: true },
)



export const EngineerModel = model('Engineer', EngineerSchema)