const Item = require("../models/item");
const Category = require("../models/category");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
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
    {
        title: "Item List",
        viewToInclude: "item_list",
        item_list: allItems
    })
});

// Display detail page for a specific item
exports.item_detail = asyncHandler(async(req, res, next) => {
    const item = await Item.findById(req.params.id).populate("category").exec()

    if(item === null) {
        const err = new Error("Item not found");
        err.status = 404;
        return next(err);
    }

    res.render("layout", 
        {
            title: item.productName,
            item: item,
            viewToInclude: "item_detail"
        }
    )
});

// Display item create form on GET
exports.item_create_get = asyncHandler(async(req, res, next) => {
    // Get all categories, which we can use for adding to our item.
    const allCategories = await Category.find().sort({name: 1}).exec();

    res.render("layout", 
        {
            title: "Create Item",
            categories: allCategories,
            item: {},
            errors: [],
            viewToInclude: "item_form",
        }
    )
});

// Handle item create on POST
exports.item_create_post = [
    // Convert the categories to an array.
    (req, res, next) => {
      if (!Array.isArray(req.body.category)) {
        req.body.category =
          typeof req.body.category === "undefined" ? [] : [req.body.category];
      }
      next();
    },
  
    // Validate and sanitize fields.
    body("productName", "Product name must not be empty.")
      .trim()
      .isLength({ min: 2 })
      .escape(),
    body("description", "description must not be empty.")
      .trim()
      .isLength({ min: 1 })
      .escape(),
    body("price", "Price must not be empty").trim().isFloat({ min: 0 }).escape(),
    body("category.*").escape(),
    body("quantity", "Quantity must not be empty").trim().isInt({ min: 0 }).escape(),
    // Process request after validation and sanitization.
  
    asyncHandler(async (req, res, next) => {
      // Extract the validation errors from a request.
      const errors = validationResult(req);
  
      // Create a Item object with escaped and trimmed data.
      const item = new Item({
        productName: req.body.productName,
        description: req.body.description,
        price: req.body.price,
        category: req.body.category,
        quantity: req.body.quantity,
      });
  
      if (!errors.isEmpty()) {
        // There are errors. Render form again with sanitized values/error messages.
  
        // Get categories for form.
        const allCategories = await Category.find().sort({ name: 1 }).exec();
  
        // Mark the selected category as checked.
        const selectedCategory = req.body.category;

        for(const category of allCategories) {
          if(category._id.toString() === selectedCategory) {
            category.checked = true;
          }
        }
        
        res.render("layout", {
          title: "Create Item",
          categories: allCategories,
          item: item,
          viewToInclude: "item_form",
          errors: errors.array(),
        });
      } else {
        // Data from form is valid. Save book.
        await item.save();
        res.redirect(item.url);
      }
    }),
  ];
  

// Display item delete form on GET
exports.item_delete_get = asyncHandler(async (req, res, next) => {
  // Get item by id from params and populate category field
  const item = await Item.findById(req.params.id)
  .populate('category')
  .exec();

  if (item === null) {
    // No results.
    res.redirect("/catalog/items");
  }

  res.render("layout", {
    title: "Delete Item",
    viewToInclude: "item_delete",
    item: item,
  });
});

// Handle Item delete on POST
exports.item_delete_post = asyncHandler(async (req, res, next) => {
  // Assume valid Item ID in field
  await Item.findByIdAndDelete(req.body.itemid);
  res.redirect("/catalog/items");
  
});

// Display item update form on GET
exports.item_update_get = asyncHandler(async (req, res, next) => {
  // Get item and category for form.
  const [item, allCategories] = await Promise.all([
    Item.findById(req.params.id).populate("category").exec(),
    Category.find().exec(),
  ]);

  if (item === null) {
    // No results.
    const err = new Error("Item not found");
    err.status = 404;
    return next(err);
  }
  
  res.render("layout", {
    title: "Update Item",
    viewToInclude: "item_form",
    categories: allCategories,
    item: item,
    errors: [],
  });
});


// Handle item update on POST
exports.item_update_post = [
  // Convert the category to an array.
  // (req, res, next) => {
  //   if (!Array.isArray(req.body.category)) {
  //     req.body.category =
  //       typeof req.body.category === "undefined" ? [] : [req.body.category];
  //   }
  //   next();
  // },

  // Validate and sanitize fields.
  body("productName", "Product name must not be empty.")
      .trim()
      .isLength({ min: 2 })
      .escape(),
  body("description", "description must not be empty.")
      .trim()
      .isLength({ min: 1 })
      .escape(),
  body("price", "Price must not be empty").trim().isFloat({ min: 0 }).escape(),
  body("category.*").escape(),
  body("quantity", "Quantity must not be empty").trim().isInt({ min: 0 }).escape(),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a Item object with escaped/trimmed data and old id.
    const item = new Item({
      productName: req.body.productName,
      description: req.body.description,
      price: req.body.price,
      category: req.body.category,
      quantity: req.body.quantity,
      _id: req.params.id, // This is required, or a new ID will be assigned!
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      // Get category for form
      const allCategories = await Category.find().exec();

      // Mark our selected genres as checked.
      // for (const category of allCategories) {
      //   if (item.category.indexOf(category._id) > -1) {
      //     category.checked = "true";
      //   }
      // }
      console.log(item);
      res.render("layout", {
        title: "Update Book",
        viewToInclude: "item_form",
        categories: allCategories,
        item: item,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid. Update the record.
      const updatedItem = await Item.findByIdAndUpdate(req.params.id, item, {});
      // Redirect to Item detail page.
      res.redirect(updatedItem.url);
    }
  }),
];
