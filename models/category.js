const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const CategorySchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    items: [{
        type: Schema.Types.ObjectId,
        ref: "Item",
    }],
    
});

// Virtual for category's URL
CategorySchema.virtual("url").get(function() {
    return `/inventory/category/${this._id}`;
});

module.exports = mongoose.model("Category", CategorySchema);