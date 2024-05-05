#! /usr/bin/env node

const Item = require("./models/item");
const Category = require("./models/category");

// Get arguments passed on command line
const userArgs = process.argv.slice(2);

const categories = [];
const items = [];

const mongoose = require("mongoose");
mongoose.set("strictQuery", false);


const mongoDB = userArgs[0];

main().catch((err) => console.log(err));

async function main() {
  console.log("Debug: About to connect");
  await mongoose.connect(mongoDB);
  console.log("Debug: Should be connected?");
  await createCategories();
  await createItems();
  console.log("Debug: Closing mongoose");
  mongoose.connection.close();
}

async function categoryCreate(index, name) {
  const category = new Category({ name: name});
  await category.save();
  categories[index] = category;
  console.log(`Added category: ${name}`);
}

async function itemCreate(index, productName, description, price, category, quantity) {
  const itemdetail = {
    productName: productName,
    description: description,
    price: price,
    category: category,
    quantity: quantity,
  };

  const item = new Item(itemdetail);
  await item.save();
  items[index] = item;
  console.log(`Added item: ${productName}`);
}

async function createCategories() {
  console.log("Adding categories");
  await Promise.all([
    categoryCreate(0, "Sony"),
    categoryCreate(1, "Microsoft"),
    categoryCreate(2, "Nintendo"),
  ]);
};

async function createItems() {
  console.log("Adding Items");
  await Promise.all([
    itemCreate(0,
      "Playstation 5",
      "The PlayStation 5's main hardware features include a solid-state drive customized for high-speed data streaming to enable significant improvements in storage performance, an AMD GPU capable of 4K resolution display at up to 120 frames per second, hardware-accelerated ray tracing for realistic lighting and reflections.",
      400,
      categories[0],
      20
    ),
    itemCreate(1,
      "Playstation 4",
      "The console features a hardware on-the-fly zlib decompression module. The original PS4 model supports up to 1080p and 1080i video standards, while the Pro model supports 4K resolution. The console includes a 500 gigabyte hard drive for additional storage, which can be upgraded by the user.",
      300,
      categories[0],
      20
    ),
    itemCreate(2,
      "Xbox one",
      "The Xbox One is a home video game console developed by Microsoft. Announced in May 2013, it is the successor to Xbox 360.",
      150,
      categories[1],
      10
    ),
    itemCreate(3,
      "Xbox series x",
      "Both Xbox Series X console deliver next-generation capabilities powered by the Xbox Velocity Architecture, such as faster loading, the ability to seamlessly switch between multiple games with Quick Resume, richer and more dynamic worlds, and frame rates up to 120 FPS.",
      399,
      categories[1],
      200
    ),
    itemCreate(4,
      "Nintendo switch",
      "The Switch is a tablet that can either be docked for home console use or used as a portable device, making it a hybrid console.",
      199,
      categories[2],
      300
    ),
    itemCreate(5,
      "Test item 1",
      "Summary of test item 1",
      50,
      categories[2],
      1.99
    ),
    itemCreate(6,
      "Test item 2",
      "Summary of test item 2",
      2.99,
      categories[0],
      100
    ),
  ]);
}