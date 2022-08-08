const { Subscription, Tweet, User } = require('./models')

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

async function findTweetOwnerId (tweetId) {
  // 查找被 like 的 tweet 資料
  const likedTweet = await Tweet.findByPk(tweetId, {
    include: User,
    raw: true,
    nest: true
  })
  return likedTweet.User.id
}

module.exports = {
  ensureAuthenticated,
  getUser,
  getAllSubscribers,
  findTweetOwnerId
}
