const Category = require("../models/category");
const Item = require("../models/item");
const asyncHandler = require("express-async-handler");

// Display list of all Categories
exports.category_list = asyncHandler(async(req, res, next) => {
    const allCategories = await Category.find({}, "name")
        .sort({name: 1})
        .exec();

    res.render("layout",
    {
       title: "Category List",
       viewToInclude: "category_list",
       category_list: allCategories, 
    })
});

// Display detail page for a specific Category
exports.category_detail = asyncHandler(async(req, res, next) => {

    const [category, itemsInCategory] = await
     Promise.all([
        Category.findById(req.params.id).exec(),
        Item.find({category: req.params.id},"productName description").exec(),
    ]);

    if(category === null) {
        const err = new Error("Category not found");
        err.status = 404;
        return next(err);
    }

    res.render("layout", 
        {
            title: "Category Detail",
            viewToInclude: "category_detail",
            category: category,
            category_items: itemsInCategory,
        }
    )
});

// Display Category create form on GET
// exports.category_create_get = asyncHandler(async(req, res, next) => {
//     res.send("Not implemented: category create GET");
// });

// Handle Category create on POST
// exports.category_create_post = asyncHandler(async(req, res, next) => {
//     res.send("Not implemented: category create POST");
// });

// Display Category delete form on GET
// exports.category_delete_get = asyncHandler(async(req, res, next) => {
//     res.send("Not implemented: category delete GET");
// });

// Handle Category delete on POST
// exports.category_delete_post = asyncHandler(async(req, res, next) => {
//     res.send("Not implemented: category delete POST");
// });

// Display Category update form on GET
// exports.category_update_get = asyncHandler(async(req, res, next) => {
//     res.send("Not implemented: category update GET");
// });

// Handle Category update on POST
// exports.category_update_post = asyncHandler(async(req, res, next) => {
//     res.send("Not implemented: category update POST");
// });