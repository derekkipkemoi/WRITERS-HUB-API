const User = require('../models/user')


module.exports = {
    newUser: async (req, res, next) => {
        const foundUser = await User.findOne({
            "email": req.body.email,
        });
        if (foundUser) {
            const message = {
                message: "User with similar email already exists!",
            };
            return res.status(200).json(message);
        }

        var user = new User({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            phone: req.body.phone,
            email: req.body.email,
            password: req.body.password,
        })
        await user.save();
        const savedUser = await User.findOne({ _id: user._id }).select('-password');
        const message = "User Registered Successfully";
        res.status(200).json({ message, user: savedUser });
    },

    getUser: async (req, res, next) => {
        const user = await User.findById(req.body.id).select('-password');
        res.status(200).json({ user });
    },

    loginUser: async (req, res, next) => {
        var data = {
            email: req.body.email,
            password: req.body.password
        }
        const user = await User.findOne(data).select('_id');
        if (user) {
            const message = "User Logged in Successfully";
            res.status(200).json({ user, message });
        } else {
            const message = "Invalid credentials";
            res.status(200).json({ message });
        }
    },
    uploadAvatar: async (req, res) => {
        const { userId } = req.params;

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded.' });
        }

        try {
            const avatarUrl = `http://localhost:3010/uploads/avatars/${req.file.filename}`; // Create the URL for the uploaded avatar
            const user = await User.findById(userId);

            if (!user) {
                return res.status(404).json({ message: 'User not found.' });
            }

            // Update the user's avatarUrl
            user.avatarUrl = avatarUrl; // Ensure this matches your schema
            await user.save();

            res.status(200).json({ message: 'Avatar uploaded successfully', avatarUrl });
        } catch (error) {
            res.status(500).json({ message: 'Error uploading avatar', error: error.message });
        }
    },
    addProfessionalSummary: async (req, res) => {
        const userId = req.params.userId;
        const professionalSummary = req.body.professionalSummary;
        try {
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
    
            // Update the professionalSummary object
            user.professionalSummary = {
                ...user.professionalSummary,
                ...professionalSummary
            };
    
            await user.save();
            res.status(200).json({ message: 'Professional summary added successfully.', professionalSummary: user.professionalSummary });
        } catch (error) {
            res.status(500).json({ message: 'An error occurred while adding professional summary', error: error.message });
        }
    },
    

    addSkills: async (req, res) => {
        const userId = req.params.userId;
        const skills = req.body.skills;
        
        try {
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            skills.forEach(skill => {
                user.skills.push(skill);
            });
            await user.save();
            res.status(200).json({ message: 'Skills added successfully.', skills: user.skills });
        } catch (error) {
            res.status(500).json({ message: 'An error occurred while adding skills' });
        }
    },

    deleteSkill: async (req, res) => {
        const userId = req.params.userId;
        const skillId = req.params.skillId;
        try {
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            const skillIndex = user.skills.findIndex(skill => skill._id.toString() === skillId);
            if (skillIndex === -1) {
                return res.status(404).json({ error: 'Skill not found' });
            }
            user.skills.splice(skillIndex, 1);
            await user.save();
            res.status(200).json({ message: 'Skill deleted successfully.'});
        } catch (error) {
            res.status(500).json({ message: 'An error occurred while deleting the skill' });
        }
    },


    addWorkHistory: async (req, res, next) => {
        const { userId } = req.params; // Get the user ID from the request
        const { employer, jobTitle, startDate, endDate, workingHere, jobDescription } = req.body; // Destructure request body
        try {
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Add work history
            user.workHistory.push({
                employer,
                jobTitle,
                startDate,
                endDate,
                workingHere,
                jobDescription
            });
            await user.save(); // Save updated user data
            res.status(201).json({ message: 'Work history added', workHistory: user.workHistory });
        } catch (error) {
            res.status(500).json({ message: 'Error adding work history', error });
        }
    },

    updateWorkHistory: async (req, res, next) => {
        const { userId, workHistoryId } = req.params; // Get the user ID and work history ID from the request params
        const { employer, jobTitle, startDate, endDate, workingHere, jobDescription } = req.body; // Destructure request body

        try {
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Find the work history entry to update
            const workHistoryIndex = user.workHistory.findIndex(item => item._id.toString() === workHistoryId);
            if (workHistoryIndex === -1) {
                return res.status(404).json({ message: 'Work history not found' });
            }

            // Update the work history entry
            user.workHistory[workHistoryIndex] = {
                employer,
                jobTitle,
                startDate,
                endDate,
                workingHere,
                jobDescription
            };

            await user.save(); // Save updated user data
            res.status(200).json({ message: 'Work history updated', workHistory: user.workHistory[workHistoryIndex] });
        } catch (error) {
            console.error("Error updating work history:", error);
            res.status(500).json({ message: 'Error updating work history', error });
        }
    },

    deleteWorkHistory: async (req, res, next) => {
        console.log("request data", req.body);
        const { userId, workHistoryId } = req.params; // Get the user ID and work history ID from the request params

        try {
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Find the work history entry to delete
            const workHistoryIndex = user.workHistory.findIndex(item => item._id.toString() === workHistoryId);
            if (workHistoryIndex === -1) {
                return res.status(404).json({ message: 'Work history not found' });
            }

            // Remove the work history entry
            user.workHistory.splice(workHistoryIndex, 1);

            await user.save(); // Save updated user data
            res.status(200).json({ message: 'Work history deleted' });
        } catch (error) {
            console.error("Error deleting work history:", error);
            res.status(500).json({ message: 'Error deleting work history', error });
        }
    },

    addEducationDetails: async (req, res, next) => {
        const { userId } = req.params // Get the user ID from the request
        const { school, gradeAchieved, startDate, endDate, studyingHere, description } = req.body // Destructure request body
        try {
            const user = await User.findById(userId)
            if (!user) {
                return res.status(404).json({ message: 'User not found' })
            }

            // Add education
            user.education.push({
                school,
                gradeAchieved,
                startDate,
                endDate,
                studyingHere,
                description
            })
            await user.save() // Save updated user data
            res.status(201).json({ message: 'Education added', education: user.education })
        } catch (error) {
            res.status(500).json({ message: 'Error adding education details', error })
        }
    },

    updateEducationDetails: async (req, res, next) => {
        console.log("request data", req.body)
        const { userId, educationId } = req.params // Get the user ID and education ID from the request params
        const { school, gradeAchieved, startDate, endDate, studyingHere, description } = req.body // Destructure request body

        try {
            const user = await User.findById(userId)
            if (!user) {
                return res.status(404).json({ message: 'User not found' })
            }

            // Find the education entry to update
            const educationIndex = user.education.findIndex(item => item._id.toString() === educationId)
            if (educationIndex === -1) {
                return res.status(404).json({ message: 'Education details not found' })
            }

            // Update the education entry
            user.education[educationIndex] = {
                school,
                gradeAchieved,
                startDate,
                endDate,
                studyingHere,
                description
            }

            await user.save() // Save updated user data
            res.status(200).json({ message: 'Education updated', education: user.education[educationIndex] })
        } catch (error) {
            console.error("Error updating education details:", error)
            res.status(500).json({ message: 'Error updating education details', error })
        }
    },

    deleteEducationDetails: async (req, res, next) => {
        const { userId, educationId } = req.params // Get the user ID and education ID from the request params

        try {
            const user = await User.findById(userId)
            if (!user) {
                return res.status(404).json({ message: 'User not found' })
            }

            // Find the education entry to delete
            const educationIndex = user.education.findIndex(item => item._id.toString() === educationId)
            if (educationIndex === -1) {
                return res.status(404).json({ message: 'Education details not found' })
            }

            // Remove the education entry
            user.education.splice(educationIndex, 1)

            await user.save() // Save updated user data
            res.status(200).json({ message: 'Education deleted' })
        } catch (error) {
            console.error("Error deleting education details:", error)
            res.status(500).json({ message: 'Error deleting education details', error })
        }
    },

    getUsers: async (req, res, next) => {
        var users = await User.find({})
        res.status(200).json({ users })
    },

    updateUser: async (req, res, next) => {
        try {
            const { id, ...userObject } = req.body;

            // Ensure the user ID is valid and present
            if (!id) {
                return res.status(400).json({ message: "User ID is required" });
            }

            // Update user data while omitting the password field from response
            const updatedUser = await User.findByIdAndUpdate(id, userObject, { new: true, select: '-password' });

            // Check if user exists after update
            if (!updatedUser) {
                return res.status(404).json({ message: "User not found" });
            }

            // Return success message and user data
            res.status(200).json({ message: "User updated", user: updatedUser });
        } catch (error) {
            // Handle errors and pass to next middleware
            next(error);
        }
    },

    deleteUser: async (req, res, next) => {
        const foundUser = await User.findOne({
            "_id": req.body.userId,
        });
        if (!foundUser) {
            const message = "User not found";
            return res.status(200).json({ message });
        }
        var id = req.body.userId;
        await User.findByIdAndDelete(id);
        const message = "User deleted Successfully";
        res.status(200).json({ message });
    }
}

