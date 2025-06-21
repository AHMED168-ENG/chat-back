'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Product.init({
    name_en: DataTypes.STRING,
    name_ar: DataTypes.STRING,
    description_en: DataTypes.TEXT,
    description_ar: DataTypes.TEXT,
    price: DataTypes.DECIMAL,
    available_quantity: DataTypes.INTEGER,
    unit: DataTypes.STRING,
    barcode: DataTypes.STRING,
    status: DataTypes.BOOLEAN,
    categoryId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Product',
  });
  return Product;
};