const Category = require("../models/category");
const Item = require("../models/item");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const debug = require("debug")("category");

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
exports.category_create_get = (req, res, next) => {

    res.render("layout", 
        {
            title: "Create Category",
            viewToInclude: "category_form",
            category: {},
            errors: [],
        }
    );
    
};

// Handle Category create on POST
exports.category_create_post = [
    // Validate and sanitize the name field.
    body("name", "Category name must contain at least 3 characters")
      .trim()
      .isLength({ min: 3 })
      .escape(),
  
    // Process request after validation and sanitization.
    asyncHandler(async (req, res, next) => {
      // Extract the validation errors from a request.
      const errors = validationResult(req);
  
      // Create a category object with escaped and trimmed data.
      const category = new Category({ name: req.body.name });
  
      if (!errors.isEmpty()) {
        // There are errors. Render the form again with sanitized values/error messages.
        res.render("layout", {
          title: "Create category",
          category: category,
          viewToInclude: "category_form",
          errors: errors.array(),
        });
        return;
      } else {
        // Data from form is valid.
        // Check if category with same name already exists.
        const categoryExists = await Category.findOne({ name: req.body.name })
            .collation({locale: "en", strength: 2})
            .exec();
        if (categoryExists) {
          // category exists, redirect to its detail page.
          res.redirect(categoryExists.url);
        } else {
          await category.save();
          // New category saved. Redirect to category detail page.
          res.redirect(category.url);
        }
      }
    }),
  ];

// Display Category delete form on GET
exports.category_delete_get = asyncHandler(async (req, res, next) => {
  // Get details of category and all their items (in parallel)
  const [category, allItemsByCategory] = await Promise.all([
    Category.findById(req.params.id).exec(),
    Item.find({ category: req.params.id }, "productName description").exec(),
  ]);

  if (category === null) {
    // No results.
    res.redirect("/catalog/categories");
  }

  res.render("layout", {
    title: "Delete Category",
    viewToInclude: "category_delete",
    category: category,
    category_items: allItemsByCategory,
  });
});


// Handle Category delete on POST
exports.category_delete_post = asyncHandler(async (req, res, next) => {
  // Get details of category and all their items (in parallel)
  const [category, allItemsByCategory] = await Promise.all([
    Category.findById(req.params.id).exec(),
    Item.find({ category: req.params.id }, "productName description").exec(),
  ]);
  console.log(category);
  if (allItemsByCategory.length > 0) {
    // Category has items. Render in same way as for GET route.
    res.render("layout", {
      title: "Delete Category",
      viewToInclude: "category_delete",
      category: category,
      category_items: allItemsByCategory,
    });
    return;
  } else {
    // Category has no items. Delete object and redirect to the list of categories.
    console.log(req.body.categoryid);
    await Category.findByIdAndDelete(req.body.categoryid);
    res.redirect("/catalog/categories");
  }
});


// Display Category update form on GET
exports.category_update_get = asyncHandler(async (req, res, next) => {
  // Get item and category for form.
  const category = await 
    Category.findById(req.params.id).exec();

  if (category === null) {
    // No results.
    debug(`id not found on update: ${req.params.id}`)
    const err = new Error("Item not found");
    err.status = 404;
    return next(err);
  }
  
  res.render("layout", {
    title: "Update Category",
    viewToInclude: "category_form",
    category: category,
    errors: [],
  });
});

// Handle Category update on POST
exports.category_update_post = [
  // Validate and sanitize fields.
  body("name", "Category name must not be empty.")
      .trim()
      .isLength({ min: 2 })
      .escape(),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a Category object with escaped/trimmed data and old id.
    const category = new Category({
      name: req.body.name,
      _id: req.params.id, // This is required, or a new ID will be assigned!
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      res.render("layout", {
        title: "Update Category",
        viewToInclude: "category_form",
        category: category,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid. Update the record.
      const updatedCategory = await Category.findByIdAndUpdate(req.params.id, category, {});
      // Redirect to Category detail page.
      res.redirect(updatedCategory.url);
    }
  }),
];