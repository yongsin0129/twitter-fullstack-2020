'use strict'

const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
  class NotificationTweet extends Model {
    static associate (models) {
      NotificationTweet.belongsTo(models.User, { as: 'celebrity', foreignKey: 'celebrityId' })
      NotificationTweet.belongsTo(models.User, { as: 'subscriber', foreignKey: 'subscriberId' })
      NotificationTweet.belongsTo(models.Tweet, { as: 'tweetEvent', foreignKey: 'tweeteventId' })
    }
  }
  NotificationTweet.init(
    {
      celebrityId: DataTypes.INTEGER,
      subscriberId: DataTypes.INTEGER,
      tweeteventId: DataTypes.INTEGER,
      checked: DataTypes.BOOLEAN
    },
    {
      sequelize,
      modelName: 'NotificationTweet',
      tableName: 'NotificationTweets',
      underscored: true
    }
  )
  return NotificationTweet
}
