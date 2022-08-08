const { io } = require('./socketIo')
const { PrivateMessage, User } = require('./models')
const { Op } = require('sequelize')

const privateUsers = {}

io.of('/private_message').on('connection', async socket => {
  const loginUserId = socket.handshake.auth.userId
  const loginUser = await User.findByPk(loginUserId, { raw: true })
  // saving userId to object with socket ID
  privateUsers[loginUser.id] = loginUser

  socket.on('updatePmList', targetUserId => {
    Promise.all([
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
      }),
      User.findByPk(targetUserId, { raw: true })
    ]).then(([PmDataArray, targetUserData]) => {
      io.of('/private_message')
        .to(socket.id)
        .emit('updatePmList', PmDataArray, targetUserData)
    })
  })

  // ----聊天室歷史訊息的邏輯 1 創立私訊房間
  socket.on('join room', async ({ oldRoom, targetUserId }) => {
    socket.leave(oldRoom)
    const newRoom = `${loginUserId}to${targetUserId}`
    socket.join(newRoom)
    await PrivateMessage.update(
      { unread: false },
      { where: { receiverId: loginUserId, senderId: targetUserId, unread: true } }
    )
    io.of('/private_message')
      .to(newRoom)
      .emit('createRoomSuccessful', newRoom)
  })
  // ----聊天室歷史訊息的邏輯 2 回傳歷史訊息
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

  // ----聊天室的邏輯區域   接收input私訊 存入資料庫
  socket.on('private message', async ({ receivedMsg, targetUserId }) => {
    const returnObj = {
      id: loginUserId,
      name: privateUsers[loginUser.id].name,
      avatar: privateUsers[loginUser.id].avatar,
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

  // ---- 使用全部已讀按鈕
  socket.on('readAllPrivateMessage', () => {
    PrivateMessage.update({ unread: false }, { where: { receiverId: loginUserId, unread: true } })
  })
})
