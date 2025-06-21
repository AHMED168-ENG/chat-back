const express = require("express");
const router = express.Router();
const category = require("../controllers/categoryController.js");

// categories
router.post("/categories", category.createCategory);
router.get("/categories", category.getAllCategories);
router.get("/categories/:id", category.getCategoryById);
router.put("/categories/:id", category.updateCategory);
router.delete("/categories/:id", category.deleteCategory);
// Products
const product = require("../controllers/productController.js");
router.post("/products", product.createProduct);
router.get("/products", product.getAllProducts);
router.get("/products/:id", product.getProductById);
router.put("/products/:id", product.updateProduct);
router.delete("/products/:id", product.deleteProduct);

module.exports = router;
