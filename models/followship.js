'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Followship extends Model {
    static associate (models) {
      Followship.belongsTo(models.User, { foreignKey: 'followingId' })
    }
  }
  Followship.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      followerId: DataTypes.INTEGER,
      followingId: DataTypes.INTEGER
    },
    {
      sequelize,
      modelName: 'Followship',
      tableName: 'Followships',
      underscored: true
    }
  )
  return Followship
}
