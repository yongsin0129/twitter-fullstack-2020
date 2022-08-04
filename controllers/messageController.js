const messageController = {
  getAllChatroom: async (req, res, next) => {
    try {
      res.render('all_chatroom')
    } catch (err) {
      next(err)
    }
  },

  getPrivateMessage: async (req, res, next) => {
    try {
      res.render('private_message')
    } catch (err) {
      next(err)
    }
  }
}
module.exports = messageController
