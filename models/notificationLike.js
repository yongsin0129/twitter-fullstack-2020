'use strict'

const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
  class NotificationLike extends Model {
    static associate (models) {
      NotificationLike.belongsTo(models.User, { as: 'celebrity', foreignKey: 'celebrityId' })
      NotificationLike.belongsTo(models.User, { as: 'subscriber', foreignKey: 'subscriberId' })
      NotificationLike.belongsTo(models.Like, { as: 'likeEvent', foreignKey: 'likeeventId' })
    }
  }
  NotificationLike.init(
    {
      celebrityId: DataTypes.INTEGER,
      subscriberId: DataTypes.INTEGER,
      likeeventId: DataTypes.INTEGER,
      checked: DataTypes.BOOLEAN
    },
    {
      sequelize,
      modelName: 'NotificationLike',
      tableName: 'NotificationLikes',
      underscored: true
    }
  )
  return NotificationLike
}
