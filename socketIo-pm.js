const { io } = require('./socketIo')
const { PrivateMessage, User } = require('./models')
const { Op } = require('sequelize')

const privateUsers = {}

io.of('/private_message').on('connection', async socket => {
  const loginUserId = socket.handshake.auth.userId
  const loginUser = await User.findByPk(loginUserId, { raw: true })
  // saving userId to object with socket ID
  privateUsers[socket.id] = loginUser

  io.of('/private_message')
    .to(socket.id)
    .emit('connected')

  socket.on('private message', async ({ receivedMsg, targetUserId }) => {
    const returnObj = {
      id: loginUserId,
      name: privateUsers[socket.id].name,
      avatar: privateUsers[socket.id].avatar,
      message: receivedMsg,
      to: targetUserId
    }
    await PrivateMessage.create({
      senderId: loginUserId,
      receiverId: targetUserId,
      message: receivedMsg
    })
    // 將 訊息丟回到 socket chat message
    io.of('/private_message')
      .to(`${loginUserId}to${targetUserId}`)
      .to(`${targetUserId}to${loginUserId}`)
      .emit('private message', returnObj)
  })

  socket.on('join room', ({ oldRoom, targetUserId }) => {
    socket.leave(oldRoom)
    const NewRoom = `${loginUserId}to${targetUserId}`
    socket.join(NewRoom)
    PrivateMessage.update(
      { read: true },
      { where: { receiverId: loginUserId, senderId: targetUserId, read: false } }
    )
    io.of('/private_message')
      .to(NewRoom)
      .emit('createRoomSuccessful', NewRoom)
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
      io.of('/private_message')
        .to(socket.id)
        .emit('updatePmList', PmDataArray, targetUserData)
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
      io.of('/private_message')
        .to(socket.id)
        .emit('updateChatBox', result)
    })
  })

  socket.on('readAllPrivateMessage', () => {
    PrivateMessage.update({ read: true }, { where: { receiverId: loginUserId, read: false } })
  })
})
