const express = require('express')
const router = express.Router()
const admin = require('./modules/admin')
const api = require('./modules/api')
const passport = require('../config/passport')
const tweetController = require('../controllers/tweetController')
const replyController = require('../controllers/replyController')
const followshipController = require('../controllers/followshipController')
const userController = require('../controllers/user-controller')
const { generalErrorHandler } = require('../middleware/error-handler')
const { authenticated } = require('../middleware/auth')
const { getRecommendedUsers } = require('../middleware/recommendedUser')

router.use('/admin', admin)
router.use('/api', authenticated, api)

router.post('/tweets/:tweet_id/replies', authenticated, replyController.postReply)
router.post('/tweets/:tweet_id/unlike', authenticated, tweetController.postUnlike)
router.post('/tweets/:tweet_id/like', authenticated, tweetController.postLike)
router.get('/tweets/:tweet_id/replies', authenticated, replyController.getReply)
router.get('/tweets', authenticated, tweetController.getTweets)
router.post('/tweets', authenticated, tweetController.postTweet)
router.delete('/followships/:followingId', authenticated, followshipController.removeFollowing)
router.post('/followships', authenticated, followshipController.addFollowing)

router.get('/signup', userController.signUpPage)
router.post('/signup', userController.signUp)
router.get('/signin', userController.signInPage)
router.post('/signin', passport.authenticate('local', { failureRedirect: '/signin', failureFlash: true }), userController.signIn)
router.get('/logout', userController.logout)
router.get('/users/:id/tweets', authenticated, getRecommendedUsers, userController.tweets)
router.get('/users/:id/replies', authenticated, getRecommendedUsers, userController.replies)
router.get('/users/:id/likes', authenticated, getRecommendedUsers, userController.likes)

router.get('/users/:id/setting', authenticated, userController.settingPage)
router.post('/users/:id/setting', authenticated, userController.putSetting)

router.get('/users/:id/followers', authenticated, getRecommendedUsers, userController.followers)
router.get('/users/:id/followings', authenticated, getRecommendedUsers, userController.followings)

router.use('/', generalErrorHandler)
router.use('/', authenticated, tweetController.getTweets)

module.exports = router
