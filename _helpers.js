const { Subscription } = require('./models')

function ensureAuthenticated (req) {
  return req.isAuthenticated()
}

function getUser (req) {
  return req.user
}

async function getAllSubscribers (loginUserId) {
  const allSubscribers = (
    await Subscription.findAll({
      where: { celebrity_id: loginUserId },
      raw: true
    })
  ).map(user => user.subscriberId.toString())
  return allSubscribers
}

module.exports = {
  ensureAuthenticated,
  getUser,
  getAllSubscribers
}
