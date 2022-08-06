const { Tweet, User, Like, Reply, NotificationLike, NotificationTweet } = require('../models')
const helpers = require('../_helpers')
const tweetController = {
  getTweets: async (req, res, next) => {
    try {
      let tweets = await Tweet.findAll({
        include: [User, Reply, Like],
        order: [['createdAt', 'DESC']]
      })

      let users = await User.findAll({
        include: [
          { model: User, as: 'Followers' },
          { model: User, as: 'Followings' }
        ]
      })

      const user = await User.findByPk(helpers.getUser(req).id, {
        raw: true,
        nest: true
      })

      const likes = await Like.findAll({
        where: { UserId: helpers.getUser(req).id }
      })

      tweets = await tweets.map(tweet => ({
        ...tweet.toJSON(),
        likedCount: tweet.Likes.length,
        repliedCount: tweet.Replies.length,
        isLiked: likes.map(l => l.TweetId).includes(tweet.id)
      }))

      users = await users.map(user => ({
        ...user.toJSON(),
        followerCount: user.Followers.length,
        isFollowed: helpers
          .getUser(req)
          .Followings.map(f => f.id)
          .includes(user.id)
      }))
      users = users.sort((a, b) => b.followerCount - a.followerCount).slice(0, 10)

      return res.render('tweets', { tweets, users, user })
    } catch (err) {
      next(err)
    }
  },
  postTweet: async (req, res, next) => {
    try {
      const { description } = req.body
      if (!description) {
        req.flash('error_messages', 'Tweet 內容不存在!')
        return res.redirect('back')
      }
      if (description.trim() === '') {
        req.flash('error_messages', 'Tweet 內容不能為空！')
        return res.redirect('back')
      }
      if (description && description.length > 140) {
        req.flash('error_messages', 'Tweet 內容不能超過140字!')
        return res.redirect('back')
      }

      const loginUserId = helpers.getUser(req).id
      // Tweet 記錄最新一筆 發文 資料
      const newestTweet = await Tweet.create({
        UserId: loginUserId,
        description
      })
      // 查找訂閱 loginUser 的所有 subscriber 並 mapping 為id
      const allSubscribers = await helpers.getAllSubscribers(loginUserId)
      // 制做 array 準備用在 NotificationLike bulkCreate
      const createDataArray = allSubscribers.map(id => {
        return {
          celebrityId: loginUserId,
          subscriberId: id,
          tweeteventId: newestTweet.dataValues.id
        }
      })
      // 更新通知列表 for 訂閱 loginUser 的所有 subscriber
      await NotificationTweet.bulkCreate(createDataArray)

      req.flash('success_messages', '成功新增Tweet!')
      return res.redirect('/tweets')
    } catch (err) {
      next(err)
    }
  },
  postLike: async (req, res, next) => {
    try {
      const loginUserId = helpers.getUser(req).id
      // like 記錄最新一筆 愛心 資料
      const newestLike = await Like.create({
        UserId: loginUserId,
        TweetId: req.params.tweet_id
      })

      // 查找訂閱 loginUser 的所有 subscriber 並 mapping 為id
      const allSubscribers = await helpers.getAllSubscribers(loginUserId)

      // 制做 array 準備用在 NotificationLike bulkCreate
      const createDataArray = allSubscribers.map(id => {
        return {
          celebrityId: loginUserId,
          subscriberId: id,
          likeeventId: newestLike.dataValues.id
        }
      })

      // 更新通知列表 for 訂閱 loginUser 的所有 subscriber
      await NotificationLike.bulkCreate(createDataArray)

      req.flash('success_messages', '成功 Like!')
      return res.redirect('back')
    } catch (err) {
      next(err)
    }
  },
  postUnlike: async (req, res, next) => {
    try {
      const like = await Like.findOne({
        where: {
          UserId: helpers.getUser(req).id,
          TweetId: req.params.tweet_id
        }
      })
      if (!like) return req.flash('error_messages', '你沒有like這個tweet!')
      await like.destroy()
      req.flash('success_messages', '成功 Unlike!')
      return res.redirect('back')
    } catch (err) {
      next(err)
    }
  }
}
module.exports = tweetController
