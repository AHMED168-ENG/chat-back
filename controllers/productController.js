const { DataTypes } = require('sequelize');
const {Op} = require('sequelize');
const sequelize = require('../config/sequelizeDb.js');

const defineModelCategory= require('../models/category');
const Category = defineModelCategory(sequelize,DataTypes); 
const defineModelProduct= require('../models/product');
const Product = defineModelProduct(sequelize,DataTypes); 


// Create a product
exports.createProduct = async (req, res) => {
  try {
    if (!Array.isArray(req.body)) {
      return res.status(400).json({ error: 'Request body must be an array of categories.' });
    }
    const products = await Product.bulkCreate(req.body, { returning: true });
    res.status(201).json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all products (with category)
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.findAll({ include: Category });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, { include: Category });
    if (!product) return res.status(404).json({ message: 'Not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const [updated] = await Product.update(req.body, {
      where: { id: req.params.id }
    });
    if (!updated) return res.status(404).json({ message: 'Not found' });
    const updatedProduct = await Product.findByPk(req.params.id);
    res.json(updatedProduct);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const deleted = await Product.destroy({
      where: { id: req.params.id }
    });
    if (!deleted) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
