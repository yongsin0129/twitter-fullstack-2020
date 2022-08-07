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
    try {
      res.render('notice')
    } catch (err) {
      next(err)
    }
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
