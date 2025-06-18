const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelizeDb");

const CustomersModel = sequelize.define(
  "customers",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    creator_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      onDelete: "SET NULL",
    },
    type: {
      type: DataTypes.ENUM("customer", "lead"),
      allowNull: false,
      defaultValue: "customer",
    },
  },
  {
    tableName: "customers",
    timestamps: false, // لأننا بنتحكم في created_at يدويًا
  }
);

module.exports = CustomersModel;
