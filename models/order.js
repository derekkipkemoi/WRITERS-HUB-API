const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderFile = new Schema({
    fileStorageName: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
});

const Currency = new Schema({
    symbol: { type: String, required: true },
    rate: { type: Number, required: true },
});

const orderPackage = new Schema({
    title: { type: String, required: true },
    price: { type: String, required: true },
    orderRevision: { type: Number, default: 0, required: true },
    currency: Currency,
    description: { type: String, required: true },
    features: { type: [String], default: [], required: true },
});

const orderTemplate = new Schema({
    name: { type: String, required: true },
    url: { type: String, required: true },
    description: { type: String, required: true },
});

const orderSchema = new Schema({
    userId: { type: String, required: true },
    package: orderPackage,
    note: { type: String },
    requireCoverLetter: { type: Boolean, required: true, default: false },
    requireLinkedInOptimization: { type: Boolean, required: true, default: false },
    type: { type: String },
    status: { type: String, required: true },
    template: orderTemplate,
    resume: orderFile,  // Correctly defining orderResume as orderFile
    completedFiles: [orderFile],
    coverLetterDetails: {
        type: String, required: false,
    },
    linkedInUrl: {
        type: String, required: false,
    },
    date: { type: Date, default: Date.now },
    deliveryDate: { type: Date },
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
