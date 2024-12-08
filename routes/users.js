const router = require("express-promise-router")();
const UsersController = require("../controllers/users");
const OrderController = require("../controllers/orders")

const multer = require('multer');
const path = require('path');
const fs = require('fs');





// Set up storage for avatar uploads
const uploadPath = path.join(__dirname, '../uploads/avatars/');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        fs.mkdirSync(uploadPath, { recursive: true }); // Ensure the directory exists
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname)); // Append extension
    }
});
// Configure multer
const upload = multer({ storage: storage });


const orderFileUploadPath = path.join(__dirname, '../uploads/resumes/');
const orderFileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        fs.mkdirSync(orderFileUploadPath, { recursive: true }); // Ensure the directory exists
        cb(null, orderFileUploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname)); // Append extension
    }
});

// Configure multer
const uploadOrderFile = multer({ storage: orderFileStorage });



const completedploadPath = path.join(__dirname, '../uploads/completed/');
const completedOrderFileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        fs.mkdirSync(completedploadPath, { recursive: true }); // Ensure the directory exists
        cb(null, completedploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname)); // Append extension
    }
});

// Configure multer
const completedOrderFile = multer({ storage: completedOrderFileStorage });


router.post('/registerUser', UsersController.newUser)
router.post('/loginUser', UsersController.loginUser)
router.post('/getUser', UsersController.getUser)
router.get('/getUsers', UsersController.getUsers)
router.patch('/updateUser', UsersController.updateUser)

router.post('/:userId/addWorkHistory', UsersController.addWorkHistory)
router.put('/:userId/updateWorkHistory/:workHistoryId', UsersController.updateWorkHistory);
router.delete('/:userId/deleteWorkHistory/:workHistoryId', UsersController.deleteWorkHistory);

router.post('/:userId/addEducation', UsersController.addEducationDetails)
router.put('/:userId/updateEducation/:educationId', UsersController.updateEducationDetails)
router.delete('/:userId/deleteEducation/:educationId', UsersController.deleteEducationDetails)

router.post('/:userId/addSkills', UsersController.addSkills);
router.delete('/:userId/skills/:skillId', UsersController.deleteSkill);

router.post('/:userId/addProfessionalSummary', UsersController.addProfessionalSummary);

// Define the route for uploading avatar
router.post('/:userId/uploadAvatar', upload.single('avatar'), UsersController.uploadAvatar);

router.post('/:userId/orders/createOrder',  OrderController.createOrder);

//Get particular Order
router.get('/:userId/orders/:orderId/getOrder', OrderController.getOrder);

//Update Resume Uploaded file
router.post('/:userId/orders/:orderId/updateResumeFile', uploadOrderFile.single('file'), OrderController.updateResumeFile);

//Update order extra services
router.post('/:userId/orders/:orderId/updateExtraServices', OrderController.orderExtraService);

//Save user order template
router.post('/:userId/orders/:orderId/saveOrderTemplate', OrderController.saveOrderTemplate);

//Get order for a user
router.get('/:userId/orders/getUserOrders', OrderController.getUserOrders);

//Update Order Status
router.post('/orders/:orderId/deleteOrder', OrderController.deleteOrder);

//DeleteOrder
router.post('/orders/:orderId/updateOrderStatus', OrderController.updateOrderStatus);

//Completed Order File
router.post('/orders/:orderId/completed', completedOrderFile.single('file'), OrderController.uploadCompletedFile);

//Completed Order File
router.post('/orders/:orderId/downloadFile', OrderController.downloadCompletedFile);

//Completed Order File
router.post('/orders/mpesaSTK', OrderController.mpesaSTKPushPayment);

// router.post('/deleteUser', UsersController.deleteUser)
// router.patch('/updateUser', UsersController.updateUser)

module.exports = router;