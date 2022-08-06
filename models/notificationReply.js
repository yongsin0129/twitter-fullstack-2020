'use strict'

const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
  class NotificationReply extends Model {
    static associate (models) {
      NotificationReply.belongsTo(models.User, { as: 'celebrity', foreignKey: 'celebrityId' })
      NotificationReply.belongsTo(models.User, { as: 'subscriber', foreignKey: 'subscriberId' })
      NotificationReply.belongsTo(models.Reply, { as: 'replyEvent', foreignKey: 'replyeventId' })
    }
  }
  NotificationReply.init(
    {
      celebrityId: DataTypes.INTEGER,
      subscriberId: DataTypes.INTEGER,
      replyeventId: DataTypes.INTEGER,
      checked: DataTypes.BOOLEAN
    },
    {
      sequelize,
      modelName: 'NotificationReply',
      tableName: 'NotificationReplies',
      underscored: true
    }
  )
  return NotificationReply
}
