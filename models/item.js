const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ItemSchema = new Schema({
    productName: {
        type: String,
        maxLength: 100,
        required: true,
    },
    description: {
        type: String,
        maxLength: 300,
        required: true,
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: "Category",
    },
    price: {
        type: Number,
        required: true,
    },
    quantity: {
        type: Number,
        min: 1,
        required: true,
    },
});

// Virtual for item's URL
ItemSchema.virtual("url").get(function() {
  return `/inventory/item/${this._id}`;
});

module.exports = mongoose.model("Item", ItemSchema);