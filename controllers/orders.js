const pdf = require("pdf-parse");
const path = require("path");
const fs = require("fs");
const OpenAI = require("openai");
const IntaSend = require("intasend-node");
const Order = require("../models/order");
const User = require("../models/user");
const { request } = require("http");

const host = process.env.SERVER_HOST || "localhost";
const port = process.env.SERVER_PORT || 3010;
const OPEN_AI_API_KEY = process.env.OPEN_AI_API_KEY || "";
const INTASEND_PUBLISHABLE_KEY = process.env.INTASEND_PUBLISHABLE_KEY;
const INTASEND_SECRET_KEY = process.env.INTASEND_SECRET_KEY;
const hostUrl = `http://${host}:${port}/uploads/resumes/`;

const openai = new OpenAI({ apiKey: OPEN_AI_API_KEY });

const completeFiletUrl = `http://${host}:${port}/uploads/completed/`;

module.exports = {
  // updateResumeFile: async (req, res, next) => {
  //     try {
  //         const { userId, orderId } = req.params;

  //         // Find the order by user ID and order ID
  //         const order = await Order.findOne({ userId, _id: orderId });
  //         if (!order) {
  //             return res.status(404).json({ message: 'Order not found' });
  //         }

  //         // Delete existing resume file if it exists
  //         if (order.resume?.fileStorageName) {
  //             const existingFilePath = path.join(__dirname, '../uploads/resumes', path.basename(order.resume.fileStorageName));
  //             if (fs.existsSync(existingFilePath)) {
  //                 fs.unlinkSync(existingFilePath);
  //             }
  //         }

  //         // Save the new resume file
  //         const resumeFilePath = req.file.path;
  //         order.resume = {
  //             fileStorageName: req.file.filename,
  //             name: req.body.name,
  //             description: req.body.description,
  //         };
  //         await order.save();

  //         // Extract text from resume
  //         let resumeContent;
  //         if (path.extname(resumeFilePath) === '.pdf') {
  //             const resumeBuffer = fs.readFileSync(resumeFilePath);
  //             resumeContent = (await pdf(resumeBuffer)).text;
  //         } else {
  //             resumeContent = fs.readFileSync(resumeFilePath, 'utf-8');
  //         }

  //         // Generate prompt for AI
  //         const prompt = `
  //                 Analyze the following resume text and extract the information in JSON format to match the specified schema structure:
  //                 {
  //                     "firstName": "First name of the individual",
  //                     "lastName": "Last name of the individual",
  //                     "email": "Email address of the individual",
  //                     "phone": "Phone number of the individual",
  //                     "city": "City of residence",
  //                     "country": "Country of residence",
  //                     "professionalTitle": "The individual's professional title or current role",
  //                     "workHistory": [
  //                         {
  //                             "employer": "Name of the employer",
  //                             "jobTitle": "Job title held at the company",
  //                             "startDate": "Start date in YYYY-MM format",
  //                             "endDate": "End date in YYYY-MM format (or null if still working there)",
  //                             "workingHere": "Boolean indicating if the individual is still working here",
  //                             "jobDescription": "Description of the role and responsibilities"
  //                         }
  //                     ],
  //                     "education": [
  //                         {
  //                             "school": "Name of the educational institution",
  //                             "gradeAchieved": "Grade achieved (e.g., degree, certification, etc.)",
  //                             "startDate": "Start date in YYYY-MM format",
  //                             "endDate": "End date in YYYY-MM format (or null if still studying there)",
  //                             "studyingHere": "Boolean indicating if the individual is still studying here",
  //                             "description": "Description of the program or achievements"
  //                         }
  //                     ],
  //                     "skills": [
  //                         {
  //                             "skill": "Name of the skill",
  //                             "rating": "Numeric rating or proficiency level (e.g., 1-5)"
  //                         }
  //                     ],
  //                     "professionalSummary": "A brief summary of the individual's professional background, achievements, and career goals"
  //                 }
  //                 Resume Text:
  //                 ${resumeContent}
  //                 `;

  //         const aiResponse = await openai.chat.completions.create({
  //             model: 'gpt-4o-mini',  // Or 'gpt-4o-mini-2024-07-18'
  //             messages: [
  //                 { role: "system", content: "You are a resume parser. Extract key data in JSON format." },
  //                 { role: "user", content: prompt }
  //             ],
  //             max_tokens: 2000,
  //         });

  //         let responseContent = aiResponse.choices[0].message.content.trim();

  //         // Remove the markdown code block syntax and any surrounding whitespace
  //         responseContent = responseContent.replace(/^```json/g, '').replace(/```$/g, '').trim();

  //         // Now, attempt to parse the cleaned-up content as JSON
  //         let extractedData;
  //         try {
  //             extractedData = JSON.parse(responseContent);
  //             console.log("Daaaa", extractedData); // Log the parsed data for inspection
  //         } catch (error) {
  //             // If parsing fails, log the error and the raw response for debugging
  //             console.error("Failed to parse AI response:", error.message);
  //             console.error("Raw response:", aiResponse.choices[0].message.content);
  //             return res.status(500).json({ message: "Failed to parse AI response", error });
  //         }

  //         // Update user information
  //         const user = await User.findById(userId);
  //         if (!user) {
  //             return res.status(404).json({ message: 'User not found' });
  //         }

  //         user.firstName = extractedData.firstName || user.firstName;
  //         user.lastName = extractedData.lastName || user.lastName;
  //         // user.email = extractedData.email || user.email;
  //         user.phone = extractedData.phone || user.phone;
  //         user.city = extractedData.city || user.city;
  //         user.country = extractedData.country || user.country;
  //         user.professionalTitle = extractedData.professionalTitle || user.professionalTitle;
  //         function validateWorkHistory(workHistory) {
  //             return workHistory.map(item => {
  //                 return {
  //                     employer: item.employer || 'Unknown Employer',  // Provide default if missing
  //                     jobTitle: item.jobTitle || 'Unknown Job Title',  // Provide default if missing
  //                     startDate: item.startDate || '0000-00',  // Default start date if missing
  //                     endDate: item.endDate || null,  // Handle null values for endDate
  //                     workingHere: item.workingHere || false,  // Default false if not specified
  //                     jobDescription: item.jobDescription || ''  // Default empty string if missing
  //                 };
  //             });
  //         }

  //         // Helper function to validate and ensure required fields for education
  //         function validateEducation(education) {
  //             return education.map(item => {
  //                 return {
  //                     school: item.school || 'Unknown School',  // Provide default if missing
  //                     gradeAchieved: item.gradeAchieved || '',  // Optional field, can be empty
  //                     startDate: item.startDate || '0000-00',  // Default start date if missing
  //                     endDate: item.endDate || null,  // Handle null values for endDate
  //                     studyingHere: item.studyingHere || false,  // Default false if not specified
  //                     description: item.description || ''  // Default empty string if missing
  //                 };
  //             });
  //         }

  //         if (extractedData.workHistory) {
  //             user.workHistory = validateWorkHistory(extractedData.workHistory);
  //         }

  //         if (extractedData.education) {
  //             user.education = validateEducation(extractedData.education);
  //         }
  //         user.skills = extractedData.skills || user.skills;

  //         if (extractedData.professionalSummary) {
  //             // Check if professionalSummary is an object or a string
  //             user.professionalSummary = {
  //                 summary: extractedData.professionalSummary.summary || extractedData.professionalSummary || '', // If it's an object, use the summary field, else assign the string directly.
  //                 github: extractedData.professionalSummary.github || '', // Ensure github is assigned correctly
  //                 linkedIn: extractedData.professionalSummary.linkedIn || '', // Ensure linkedIn is assigned correctly
  //                 otherWebsite: extractedData.professionalSummary.otherWebsite || '' // Ensure otherWebsite is assigned correctly
  //             };
  //         }

  //         await user.save();

  //         // Update order file URL
  //         order.resume.file = `${hostUrl}${req.file.filename}`;

  //         return res.status(200).json({
  //             message: 'Order resume file updated and data captured successfully',
  //             order,
  //             extractedData,
  //         });
  //     } catch (err) {
  //         next(err); // Pass error to middleware
  //     }
  // },

  mpesaSTKPushPayment: async (req, res) => {
    let intasend = new IntaSend(
      "ISPubKey_test_039f5b76-80f8-4870-96af-edcfae1c340c",
      "ISSecretKey_test_dc9ec3e1-5846-4a19-864a-799eb4c46a8d",
      true // Test ? Set true for test environment
    );
    // console.log(`STK Push `, req.body);
    try {
      let collection = intasend.collection();
      collection
        .charge({
          first_name: req.body.first_name,
          last_name: req.body.last_name,
          email: req.body.email,
          host: req.body.host,
          amount: req.body.amount,
          phone_number: req.body.phone_number,
          api_ref: req.body.api_ref,
          redirect_url: req.body.redirect_url,
          // first_name: "Calvin",
          // last_name: "Maritim",
          // email: "test@maritim.com",
          // host: req.body.host,
          // amount: req.body.amount,
          // phone_number: req.body.phone_number,
          // api_ref: req.body.api_ref,
          // redirect_url: req.body.redirect_url,
        })
        .then((resp) => {
          // Redirect user to URL to complete payment
          // console.log(`STK Push Resp:`, resp);
          return res.status(200).json({
            message: "Payment Successful",
            resp: resp,
          });
        })
        .catch((err) => {
          console.error(`STK Push Resp error:`, err);
          return res.status(404).json({ message: "Payment Not Successful" });
        });
    } catch (error) {
      console.error(`STK Push Resp error:`, error);
      return res.status(404).json({ message: "Payment Not Successful" });
    }
  },
  createOrder: async (req, res) => {
    try {
      const { package, status } = req.body;
      // Parse orderPackage to an object if it is a string
      const parsedOrderPackage = JSON.parse(package);
      const userId = req.params.userId;
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      // Create a new order instance with the data from the request
      const newOrder = new Order({
        userId,
        package: parsedOrderPackage,
        status,
      });
      await newOrder.save();
      user.orders.push(newOrder);
      await user.save(); // Don't forget to save the user as well
      // Send a success response
      return res.status(201).json({
        message: "Order created successfully",
        order: newOrder,
      });
    } catch (error) {
      console.error(error);
      // Send an error response
      return res.status(500).json({
        message: "An error occurred while creating the order",
        error: error.message,
      });
    }
  },

  saveOrderTemplate: async (req, res, next) => {
    try {
      // Destructure userId and orderId from req.params
      const { userId, orderId } = req.params;

      // Destructure name, url, description from req.body
      const { name, url, description } = req.body;

      // Find the order by user ID and order ID
      const order = await Order.findOne({ userId, _id: orderId });

      // If the order is not found, return a 404 error
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      // Update the order's template with the new fields
      order.template = { name, url, description };

      // Save the updated order
      await order.save();

      // Send a success response
      return res.status(200).json({
        message: "Order template saved successfully",
        order,
      });
    } catch (err) {
      console.error("Error saving order template:", err);
      // Catch any database or server errors and send a 500 response
      next(err); // Pass the error to the next middleware (typically for error handling)
    }
  },

  getOrder: async (req, res, next) => {
    const { orderId } = req.params;
    try {
      // Attempt to find the order by ID
      const order = await Order.findById(orderId);
      // If the order is not found, return a 404 error
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      // If the order is found, return it in the response
      return res.status(200).json({ order });
    } catch (err) {
      // Catch any database or server errors and send a 500 response
      next(err); // Pass the error to the next middleware (typically for error handling)
    }
  },

  getUserOrders: async (req, res, next) => {
    try {
      const { userId } = req.params; // Extract userId from request params

      // Find the user by their ID and populate the orders field
      const user = await User.findById(userId).populate("orders");

      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      // Sort the orders by 'createdAt' (ascending or descending order)
      user.orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Descending order (most recent first)

      // Return the user's orders
      return res.status(200).json({
        orders: user.orders,
      });
    } catch (error) {
      return res.status(500).json({
        message: "An error occurred while retrieving the orders",
        error: error.message,
      });
    }
  },

  deleteOrder: async (req, res) => {
    try {
      const { id } = req.params; // Get the order ID from the request parameters
      // Find and delete the order by ID
      const deletedOrder = await Order.findByIdAndDelete(id);
      // Check if the order was found and deleted
      if (!deletedOrder) {
        return res.status(404).json({ message: "Order not found" });
      }
      // Send a success response
      return res.status(200).json({ message: "Order deleted successfully" });
    } catch (error) {
      console.error(error);
      // Send an error response
      return res.status(500).json({
        message: "An error occurred while deleting the order",
        error: error.message,
      });
    }
  },

  orderExtraService: async (req, res, next) => {
    try {
      const { userId } = req.params;
      const { orderId } = req.params;
      const {
        linkedInUrl = "", // Default to empty string if not provided
        coverLetterDetails = "", // Default to empty string if not provided
        requireLinkedInOptimization = false, // Default to false if not provided
        requireCoverLetter = false, // Default to false if not provided
      } = req.body;

      // Find the order by user ID and order ID
      const order = await Order.findOne({ userId, _id: orderId });
      // If the order is not found, return a 404 error
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      // Update the order with the new fields
      order.linkedInUrl = linkedInUrl;
      order.coverLetterDetails = coverLetterDetails;
      order.requireLinkedInOptimization = requireLinkedInOptimization;
      order.requireCoverLetter = requireCoverLetter;
      // Save the updated order
      await order.save();
      // Send a success response
      return res.status(200).json({
        message: "Order resume file updated successfully",
        order,
      });
    } catch (err) {
      // Catch any database or server errors and send a 500 response
      next(err); // Pass the error to the next middleware (typically for error handling)
    }
  },

  updateResumeFile: async (req, res, next) => {
    try {
      const { userId } = req.params;
      const { orderId } = req.params;
      // Find the order by user ID and order ID
      const order = await Order.findOne({ userId, _id: orderId });
      // If the order is not found, return a 404 error
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      // console("order", order)
      // Delete the existing resume file if it exists
      if (order.resume && order.resume.fileStorageName) {
        const existingFilePath = path.join(
          __dirname,
          "../uploads/resumes",
          path.basename(order.resume.fileStorageName)
        );
        if (fs.existsSync(existingFilePath)) {
          fs.unlinkSync(existingFilePath);
        }
      }

      // Update the orderResume object with the new file information
      order.resume = {
        fileStorageName: req.file.filename,
        name: req.body.name,
        description: req.body.description,
      };

      // Save the updated order
      await order.save();

      // Replace the file path with the full URL in the orderResume object
      order.resume.file = `${hostUrl}${req.file.filename}`;

      // Send a success response
      return res.status(200).json({
        message: "Order resume file updated successfully",
        order,
      });
    } catch (err) {
      // Catch any database or server errors and send a 500 response
      next(err); // Pass the error to the next middleware (typically for error handling)
    }
  },

  updateOrderStatus: async (req, res) => {
    try {
      const { orderId } = req.params; // Get the order ID from the request parameters
      const { status } = req.body; // Get the new order status from the request body
      const order = await Order.findById(orderId);

      if (status === "Revision") {
        if (order.package.orderRevision > 0) {
          order.package.orderRevision = order.package.orderRevision - 1;
        } else {
          return res.status(200).json({
            message: "Your order has no more revision requests",
          });
        }
      }
      order.status = status;
      await order.save();

      // Send a success response with the updated order
      return res.status(200).json({
        message: "Order status updated successfully",
        order: order,
      });
    } catch (error) {
      console.error(error);
      // Send an error response
      return res.status(500).json({
        message: "An error occurred while updating the order status",
        error: error.message,
      });
    }
  },

  deleteOrder: async (req, res) => {
    try {
      const { orderId } = req.params; // Get the order ID from the request parameters

      const order = await Order.findByIdAndDelete(orderId);

      // Find and delete the order by its ID
      if (order.resume && order.resume.fileStorageName) {
        const existingFilePath = path.join(
          __dirname,
          "../uploads/resumes",
          path.basename(order.resume.fileStorageName)
        );
        if (fs.existsSync(existingFilePath)) {
          fs.unlinkSync(existingFilePath);
        }
      }

      if (!order) {
        return res.status(404).json({
          message: "Order not found",
        });
      }

      // Send a success response
      return res.status(200).json({
        message: "Order deleted successfully",
      });
    } catch (error) {
      console.error(error);
      // Send an error response
      return res.status(500).json({
        message: "An error occurred while deleting the order",
        error: error.message,
      });
    }
  },

  downloadCompletedFile: async (req, res) => {
    try {
      const { fileName } = req.body; // Get the file name from the request parameters

      // Define the path to the file directory
      const filePath = path.join(__dirname, "../uploads/completed", fileName);

      // Check if the file exists
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          message: "File not found",
        });
      }

      // Send the file for download
      return res.status(200).json({
        message: "File Downloaded Successfully",
        fileUrl: completeFiletUrl + fileName,
      });
    } catch (error) {
      console.error(error);
      // Send an error response
      return res.status(500).json({
        message: "An error occurred while downloading the file",
        error: error.message,
      });
    }
  },

  uploadCompletedFile: async (req, res, next) => {
    try {
      const { orderId } = req.params;

      // Log the request body for debugging

      // Find the order by order ID
      const order = await Order.findById(orderId);

      // If the order is not found, return a 404 error
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      // Create a new order file object
      const orderFile = {
        fileStorageName: req.file.filename,
        name: req.body.name,
        description: req.body.description,
      };

      // Push the new file to the completedFiles array
      order.completedFiles.push(orderFile);

      // Save the updated order
      await order.save();

      // Replace the file path with the full URL in the resume object
      order.resume.fileStorageName = `${completeFiletUrl}${req.file.filename}`;

      // Send a success response
      return res.status(200).json({
        message: "Order completed file uploaded successfully",
        order,
      });
    } catch (err) {
      // Catch any database or server errors and send a 500 response
      next(err); // Pass the error to the next middleware (typically for error handling)
    }
  },
};
