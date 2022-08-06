'use strict'

const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
  class Subscription extends Model {
    static associate (models) {
      Subscription.belongsTo(models.User, { as: 'celebrity', foreignKey: 'celebrityId' })
      Subscription.belongsTo(models.User, { as: 'subscriber', foreignKey: 'subscriberId' })
    }
  }
  Subscription.init(
    {
      celebrityId: DataTypes.INTEGER,
      subscriberId: DataTypes.INTEGER
    },
    {
      sequelize,
      modelName: 'Subscription',
      tableName: 'Subscriptions',
      underscored: true
    }
  )
  return Subscription
}
