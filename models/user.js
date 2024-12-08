const mongoose = require('mongoose');
const Schema = mongoose.Schema;

mongoose.set('toJSON', {
    virtuals: true,
    transform: (doc, converted) => {
        delete converted._id;
    }
});

const workHistorySchema = new Schema({
    employer: { type: String, required: true }, // Required field
    jobTitle: { type: String, required: true },
    startDate: { type: String, required: true }, // Required field
    endDate: {
        type: String
    },
    workingHere: { type: Boolean, default: false }, // Defaults to false
    jobDescription: { type: String, default: null } // Optional job description field
});

const educationSchema = new Schema({
    school: { type: String, required: true }, // Required field
    gradeAchieved: { type: String, required: false }, // Optional field
    startDate: { type: String, required: true }, // Required field
    endDate: {
        type: String
    },
    studyingHere: { type: Boolean, default: false }, // Defaults to false
    description: { type: String, default: null } // Optional description field
});

const skillSchema = new Schema({
    skill: { type: String },  // Default value for skill is an empty string
    rating: { type: Number }   // Default value for rating is 0
});

const paymentInfo = new Schema({
    paymentMethod: { type: String, required: true },
    billingAddress: { type: String, required: true },
})


const userSchema = Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
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
    phone: {
        type: String,
        required: true,
    },
    city: {
        type: String,
        required: false,
    },
    country: {
        type: String,
        required: false,
    },
    professionalTitle: {
        type: String,
        required: false
    },
    paymentInfo:{
        paymentInfo
    },
    workHistory: [
        workHistorySchema
    ],
    education: [
        educationSchema
    ],
    skills: [
        skillSchema
    ],
    orders: [
        {
            type: Schema.Types.ObjectId,
            ref: "Order"
        }
    ],
    professionalSummary: {
        summary: { type: String },
        github: { type: String },
        linkedIn: { type: String },
        otherWebsite: { type: String }
    },
    avatarUrl: {
        type: String
    },
});

const userData = mongoose.model('UsersSchema', userSchema)
module.exports = userData
