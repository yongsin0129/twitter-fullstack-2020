const { io, chattingUsers } = require('./socketIo')

module.exports = socket => {
  socket.on('private message', ({ receivedMsg, receiver }) => {
    const returnObj = {
      id: chattingUsers[socket.id].id,
      name: chattingUsers[socket.id].name,
      avatar: chattingUsers[socket.id].avatar,
      message: receivedMsg,
      to: receiver
    }
    // 將 訊息丟回到 socket chat message
    io.to(receiver).emit('private message', returnObj)
  })

  socket.on('join room', room => {
    socket.join(room)
  })

  socket.on('checkPM', userId => {
    io.emit('checkPM', {})
  })
}
