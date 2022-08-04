const { io, chattingUsers } = require('./socketIo')

module.exports = socket => {
  const loginUserId = chattingUsers[socket.id].id

  socket.on('private message', ({ receivedMsg, targetUserId }) => {
    const returnObj = {
      id: loginUserId,
      name: chattingUsers[socket.id].name,
      avatar: chattingUsers[socket.id].avatar,
      message: receivedMsg,
      to: targetUserId
    }
    // 將 訊息丟回到 socket chat message
    io.to(`${loginUserId}to${targetUserId}`)
      .to(`${targetUserId}to${loginUserId}`)
      .emit('private message', returnObj)
    console.log("socket.on ~ targetUserId", targetUserId)
    console.log("socket.on ~ loginUserId", loginUserId)
    console.log(`${targetUserId}to${loginUserId}`)
  })

  socket.on('join room', targetUserId => {
    socket.join(`${loginUserId}to${targetUserId}`)
  })

  socket.on('checkPM', userId => {
    io.emit('checkPM', {})
  })
}
