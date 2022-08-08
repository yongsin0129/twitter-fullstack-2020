const { Subscription, User, Tweet } = require('../models')
const helpers = require('../_helpers')
const { getUser } = require('../_helpers')

const messageController = {
  getAllChatroom: async (req, res, next) => {
    try {
      res.render('all_chatroom')
    } catch (err) {
      next(err)
    }
  },

  getPrivateMessage: async (req, res, next) => {
    const PmTargetUserId = req.params.id
    try {
      res.render('private_message', { PmTargetUserId })
    } catch (err) {
      next(err)
    }
  },
  getNotices: async (req, res, next) => {
    const observedUserId = req.params.id
    const loginUser = getUser(req)

    return User.findByPk(observedUserId, {
      nest: true,
      include: [Tweet, { model: User, as: 'Followings' }]
    })
      .then(user => {
        const result = user.Followings.map(user => {
          return {
            ...user.toJSON(),
            isFollowed: loginUser?.Followings.some(f => f.id === user.id)
          }
        }).sort((a, b) => b.Followship.createdAt - a.Followship.createdAt)
        res.render('notice', { observedUser: user.toJSON(), followings: result })
      })
      .catch(err => next(err))
  },
  postSubscribe: async (req, res, next) => {
    try {
      const loginUserId = helpers.getUser(req).id

      if (loginUserId === Number(req.body.id)) {
        req.flash('error_messages', '自己不能訂閱自己！')
        return res.redirect(200, 'back')
      }

      await Subscription.create({
        subscriberId: loginUserId,
        celebrityId: req.body.id
      })

      req.flash('success_messages', '訂閱成功！')
      return res.redirect('back')
    } catch (err) {
      next(err)
    }
  },
  deleteSubscribe: async (req, res, next) => {
    try {
      const loginUserId = helpers.getUser(req).id

      const subscription = await Subscription.findOne({
        where: {
          subscriberId: loginUserId,
          celebrityId: req.params.subscribeId
        }
      })
      await subscription.destroy()
      req.flash('success_messages', '取消訂閱成功！')
      return res.redirect('back')
    } catch (err) {
      next(err)
    }
  }
}
module.exports = messageController
