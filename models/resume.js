const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const resumeSchema = Schema({
    workHistory: [
        {
            companyName: {
                type: String,
                required: true,
            },
            date: {
                startDate: {
                    type: String,
                    required: true,
                },
                endDate: {
                    type: String,
                    required: true,
                }
            },
            title: {
                type: String,
                required: true,
                unique: true,
            },
            jobDescriptions: {
                type: String,
                required: true,
            },
            skills: [
                {
                    type: String,
                    required: false,
                }
            ],
        }
    ],
    education: [
        {
            schoolName: {
                type: String,
                required: true,
            },
            dates: {
                startDate: {
                    type: String,
                    required: true,
                },
                endDate: {
                    type: String,
                    required: true,
                }
            },
            title: {
                type: String,
                required: true,
                unique: true,
            },
            qualification: {
                type: String,
                required: true,
            },
            achievements: [
                {
                    type: String,
                    required: false,
                }
            ],
        }
    ],
    skills: [
        {
            type: String,
            required: false,
        }
    ],
});
var resumeData = mongoose.model('ResumeSchema', resumeSchema);
module.exports = resumeData;