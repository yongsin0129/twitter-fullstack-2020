const { User, Tweet, Reply, Like } = require('../models')
const { getUser } = require('../_helpers')
const bcrypt = require('bcryptjs')
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

    } catch (err) {
      next(err)
    }
  },
  deleteSubscribe: async (req, res, next) => {
    try {

    } catch (err) {
      next(err)
    }
  }
}
module.exports = messageController
