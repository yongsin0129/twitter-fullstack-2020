const { Tweet, User, Like, Reply } = require('../models')
const helpers = require('../_helpers')

const messageController = {
  getMessage: async (req, res, next) => {
    try {
      const user = await User.findByPk(helpers.getUser(req).id,
        {
          raw: true,
          nest: true
        })
      res.render('message', { user })
    }
    catch (err) {
      next(err)
    }
  }
}
module.exports = messageController 