const { io } = require('./socketIo')
const { getAllSubscribers } = require('./_helpers')
const {
  User,
  Followship,
  NotificationFollow,
  NotificationLike,
  NotificationTweet,
  NotificationReply,
  Like,
  Tweet,
  Reply
} = require('./models')

module.exports = socket => {
  const loginUserId = Number(socket.handshake.auth.userId)

  // 監聽 followship notification event

  socket.on('notifyForAllSubscribers', async () => {
    const allSubscribers = await getAllSubscribers(loginUserId)

    // 通知所有訂閱者，更新自已的通知列表
    io.to(allSubscribers).emit('informSubscribersUpdateNote')
  })

  socket.on('updateNotification', async () => {
    console.log(`前端使用者 id: ${loginUserId} 要求更新列表`)

    setTimeout(() => {
      Promise.all([
        NotificationFollow.findAll({
          where: { subscriberId: loginUserId, checked: false },
          include: [
            { model: Followship, as: 'followEvent', include: User },
            { model: User, as: 'celebrity' }
          ],
          raw: true,
          nest: true
        }),
        NotificationLike.findAll({
          where: { subscriberId: loginUserId, checked: false },
          include: [
            { model: Like, as: 'likeEvent', include: { model: Tweet, include: User } },
            { model: User, as: 'celebrity' }
          ],
          raw: true,
          nest: true
        }),
        NotificationTweet.findAll({
          where: { subscriberId: loginUserId, checked: false },
          include: [
            { model: Tweet, as: 'tweetEvent', include: User },
            { model: User, as: 'celebrity' }
          ],
          raw: true,
          nest: true
        }),
        NotificationReply.findAll({
          where: { subscriberId: loginUserId, checked: false },
          include: [
            { model: Reply, as: 'replyEvent', include: { model: Tweet, include: User } },
            { model: User, as: 'celebrity' }
          ],
          raw: true,
          nest: true
        })
      ]).then(([follow, like, tweet, reply]) => {
        io.to(`${loginUserId}`).emit('updateNotification', { follow, like, tweet, reply })
      })
    }, 1000)
  })

  /**
   * subscription 用 express 來做會比較好，不需要用 socket.io   *
   */
  // socket.on('subscription', async targetId => {
  //   console.log('loginUserId : ', loginUserId)
  //   console.log('joinRoom : ', socket.adapter.rooms)
  //   console.log('targetId : ', Number(targetId))

  //   if (loginUserId === Number(targetId)) {
  //     return console.log('error_messages', '自己不能訂閱自已！')
  //   } else {
  //     await Subscription.create({
  //       celebrityId: loginUserId,
  //       subscriberId: Number(targetId)
  //     })
  //     return console.log('success_messages', '追隨成功！')
  //   }
  // })
}
