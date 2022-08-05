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
  }
}
module.exports = messageController
