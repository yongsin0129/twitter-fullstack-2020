const { io, chattingUsers } = require('./socketIo')

module.exports = socket => {
  socket.on('notification', value => {
    console.log(value)
  })
}
