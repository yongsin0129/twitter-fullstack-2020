'use strict'

const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
  class NotificationFollow extends Model {
    static associate (models) {
      NotificationFollow.belongsTo(models.User, { as: 'celebrity', foreignKey: 'celebrityId' })
      NotificationFollow.belongsTo(models.User, { as: 'subscriber', foreignKey: 'subscriberId' })
      NotificationFollow.belongsTo(models.Followship, { as: 'followEvent', foreignKey: 'followeventId' })
    }
  }
  NotificationFollow.init(
    {
      celebrityId: DataTypes.INTEGER,
      subscriberId: DataTypes.INTEGER,
      followeventId: DataTypes.INTEGER,
      checked: DataTypes.BOOLEAN
    },
    {
      sequelize,
      modelName: 'NotificationFollow',
      tableName: 'NotificationFollows',
      underscored: true
    }
  )
  return NotificationFollow
}
