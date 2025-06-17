module.exports = {
  up: async (queryInterface, DataTypes) => {
    await queryInterface.createTable("tickets", {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      customer_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        onDelete: "CASCADE",
      },
      assigned_to: {
        type: DataTypes.INTEGER,
        allowNull: true,
        onDelete: "SET NULL",
      },
      department_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        onDelete: "SET NULL",
      },
      category_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        onDelete: "CASCADE",
      },
      priority_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        onDelete: "CASCADE",
      },
      status: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      subject: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      creator_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        onDelete: "SET NULL",
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    });

    await queryInterface.addIndex("tickets", ["customer_id"]);
    await queryInterface.addIndex("tickets", ["assigned_to"]);
    await queryInterface.addIndex("tickets", ["department_id"]);
    await queryInterface.addIndex("tickets", ["category_id"]);
    await queryInterface.addIndex("tickets", ["priority_id"]);
    await queryInterface.addIndex("tickets", ["creator_id"]);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable("tickets");
  },
};
