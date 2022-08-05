const { io, chattingUsers } = require('./socketIo')
const { PrivateMessage, User } = require('./models')
const { Op } = require('sequelize')
let PrivateMessageArray = []

module.exports = socket => {
  const loginUserId = chattingUsers[socket.id].id

  socket.on('private message', async ({ receivedMsg, targetUserId }) => {
    const returnObj = {
      id: loginUserId,
      name: chattingUsers[socket.id].name,
      avatar: chattingUsers[socket.id].avatar,
      message: receivedMsg,
      to: targetUserId
    }
    await PrivateMessage.create({
      senderId: loginUserId,
      receiverId: targetUserId,
      message: receivedMsg
    })
    // 將 訊息丟回到 socket chat message
    io.to(`${loginUserId}to${targetUserId}`)
      .to(`${targetUserId}to${loginUserId}`)
      .emit('private message', returnObj)
  })

  socket.on('join room', targetUserId => {
    socket.join(`${loginUserId}to${targetUserId}`)
  })

  socket.on('updatePmList', targetUserId => {
    Promise.all([
      PrivateMessage.findAll({
        include: [
          { model: User, as: 'sender' },
          { model: User, as: 'receiver' }
        ],
        raw: true,
        nest: true
      }),
      User.findByPk(targetUserId, { raw: true })
    ]).then(([PmDataArray, targetUserData]) => {
      io.emit('updatePmList', PmDataArray, targetUserData)
    })
  })

  socket.on('updateChatBox', targetUserId => {
    PrivateMessage.findAll({
      where: {
        [Op.or]: [{ senderId: loginUserId }, { receiverId: loginUserId }]
      },
      include: [
        { model: User, as: 'sender' },
        { model: User, as: 'receiver' }
      ],
      raw: true,
      nest: true
    }).then(result => {
      io.emit('updateChatBox', result)
    })
  })
}
