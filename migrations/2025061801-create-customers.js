module.exports = {
  up: async (queryInterface, DataTypes) => {
    await queryInterface.createTable("customers", {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      name: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      phone: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: true,
      },
      email: {
        type: DataTypes.TEXT,
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
    });

    // إضافة حقل type عبر ALTER TABLE
    await queryInterface.addColumn("customers", "type", {
      type: DataTypes.ENUM("customer", "lead"),
      allowNull: false,
      defaultValue: "customer",
    });

    // إضافة الفهارس
    await queryInterface.addIndex("customers", ["creator_id"]);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable("customers");
  },
};
