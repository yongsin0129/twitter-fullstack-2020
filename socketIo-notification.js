const { io, chattingUsers } = require('./socketIo')
const { User, Followship, Subscription, NotificationFollow } = require('./models')
const { raw } = require('express')

module.exports = socket => {
  const loginUserId = Number(socket.handshake.auth.userId)

  // 監聽 followship notification event

  socket.on('notificationFollow', async targetId => {
    const targetUserId = Number(targetId)

    console.log('loginUserId : ', loginUserId)
    console.log('joinRoom : ', socket.adapter.rooms)
    console.log('targetId : ', targetUserId)

    const allSubscribers = (
      await Subscription.findAll({
        where: { celebrity_id: loginUserId },
        raw: true
      })
    ).map(user => user.subscriberId)

    console.log('allSubscribers', allSubscribers)

    if (loginUserId === Number(targetId)) {
      return console.log('error_messages', '自己不能追隨自己！')
    } else {
      return console.log('success_messages', '追隨成功！')
    }
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
