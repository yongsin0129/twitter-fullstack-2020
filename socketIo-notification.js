const { io } = require('./socketIo')
const { getAllSubscribers } = require('./_helpers')
const {
  User,
  Followship,
  NotificationFollow,
  NotificationLike,
  NotificationTweet,
  NotificationReply,
  PrivateMessage,
  Like,
  Tweet,
  Reply
} = require('./models')

io.on('connection', socket => {
  const loginUserId = Number(socket.handshake.auth.userId)
  socket.join(`${loginUserId}`)

  // 監聽 followship notification event

  socket.on('notifyForAllSubscribers', async () => {
    const allSubscribers = await getAllSubscribers(loginUserId)

    // 通知所有訂閱者，更新自已的通知列表
    io.to(allSubscribers).emit('informSubscribersUpdateNote')
  })

  socket.on('updateNotification', async () => {
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

  socket.on('cleanAllNotifications', () => {
    Promise.all([
      NotificationFollow.destroy({
        where: { subscriberId: loginUserId, checked: false }
      }),
      NotificationLike.destroy({
        where: { subscriberId: loginUserId, checked: false }
      }),
      NotificationTweet.destroy({
        where: { subscriberId: loginUserId, checked: false }
      }),
      NotificationReply.destroy({
        where: { subscriberId: loginUserId, checked: false }
      })
    ]).then(() => {
      io.to(`${loginUserId}`).emit('informSubscribersUpdateNote')
    })
  })

  socket.on('checkIfUnreadPrivateMessage', async () => {
    PrivateMessage.findAll({
      where: { receiverId: loginUserId, unread: true },
      raw: true,
      nest: true
    }).then(result => {
      io.to(socket.id).emit('updatePMNumberCount', result)
    })
  })
})
