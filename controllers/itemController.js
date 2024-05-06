const Item = require("../models/item");
const Category = require("../models/category");
const asyncHandler = require("express-async-handler");
const category = require("../models/category");

exports.index = asyncHandler(async(req, res, next) => {
    const [
        numItems,
        numCategories,
    ] = await Promise.all([
        Item.countDocuments({}).exec(),
        Category.countDocuments({}).exec(),
    ]);

    res.render("layout", {
        title: "Inventory management home",
        viewToInclude: "index",
        item_count: numItems,
        category_count: numCategories,
    });
});

// Display list of all Items
exports.item_list = asyncHandler(async(req, res, next) => {
    const allItems = await Item.find({}, "productName category")
        .sort({productName: 1})
        .populate("category")
        .exec();
    console.log(allItems);
    res.render("layout", 
    {title: "Item List",
    viewToInclude: "item_list",
    item_list: allItems
    })
});

// Display detail page for a specific item
// exports.item_detail = asyncHandler(async(req, res, next) => {
//     res.send(`Not implemented: item detail: ${req.params.id}`);
// });

// Display item create form on GET
// exports.item_create_get = asyncHandler(async(req, res, next) => {
//     res.send("Not implemented: item create GET");
// });

// Handle item create on POST
// exports.item_create_post = asyncHandler(async(req, res, next) => {
//     res.send("Not implemented: item create POST");
// });

// Display item delete form on GET
// exports.item_delete_get = asyncHandler(async(req, res, next) => {
//     res.send("Not implemented: item delete GET");
// });

// Handle item delete on POST
// exports.item_delete_post = asyncHandler(async(req, res, next) => {
//     res.send("Not implemented: item delete POST");
// });

// Display item update form on GET
// exports.item_update_get = asyncHandler(async(req, res, next) => {
//     res.send("Not implemented: item update GET");
// });

// Handle item update on POST
// exports.item_update_post = asyncHandler(async(req, res, next) => {
//     res.send("Not implemented: item update POST");
// });