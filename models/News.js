const mongoose = require('mongoose'); // Add this line to require mongoose

const newsSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
    },
    imageUrl: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    author: {
        type: String,
        required: true,
    },
    expiredAt: {
        type: Date,
        required: false, // Expiration date is optional
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'expired'],
        default: 'pending',
    },
}, {
    timestamps: true, // Add createdAt and updatedAt fields automatically
});

module.exports = mongoose.model('News', newsSchema); // Export the model