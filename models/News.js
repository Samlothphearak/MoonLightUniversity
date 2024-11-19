const mongoose = require('mongoose');

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
        required: false, 
        validate: {
            validator: function(value) {
                return !value || value > Date.now(); // Ensure expiration date is in the future
            },
            message: 'Expiration date must be in the future',
        },
    },
}, {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
});

module.exports = mongoose.model('News', newsSchema);