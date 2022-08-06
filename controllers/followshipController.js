const { Followship, Subscription, NotificationFollow } = require('../models')
const helpers = require('../_helpers')
const followshipController = {
  addFollowing: async (req, res, next) => {
    try {
      if (helpers.getUser(req).id === Number(req.body.id)) {
        req.flash('error_messages', '自己不能追隨自己！')
        return res.redirect(200, 'back')
      }
      const loginUserId = helpers.getUser(req).id

      // Followship 記錄最新一筆追蹤資料
      const newestFollowship = await Followship.create({
        followerId: helpers.getUser(req).id,
        followingId: req.body.id
      })

      // 查找訂閱 loginUser 的所有 subscriber 並 mapping 為id
      const allSubscribers = (
        await Subscription.findAll({
          where: { celebrity_id: loginUserId },
          raw: true
        })
      ).map(user => user.subscriberId)

      // 制做 array 準備用在 NotificationFollow bulkCreate
      const createDataArray = allSubscribers.map(id => {
        return {
          celebrityId: loginUserId,
          subscriberId: id,
          followeventId: newestFollowship.dataValues.id
        }
      })

      // 更新通知列表 for 訂閱 loginUser 的所有 subscriber
      await NotificationFollow.bulkCreate(createDataArray)

      req.flash('success_messages', '追隨成功！')
      return res.redirect('back')
    } catch (err) {
      next(err)
    }
  },
  removeFollowing: async (req, res, next) => {
    try {
      const followship = await Followship.findOne({
        where: {
          followerId: helpers.getUser(req).id,
          followingId: req.params.followingId
        }
      })
      await followship.destroy()
      req.flash('success_messages', '取消追隨成功！')
      return res.redirect('back')
    } catch (err) {
      next(err)
    }
  }
}
module.exports = followshipController
