// 主要 Io 連線
const app = require('./app')
const http = require('http')
const server = http.createServer(app)
const { Server } = require('socket.io')
const io = new Server(server)
const { User } = require('./models')

const chattingUsers = {}

// 建立 all chatroom 連線
io.of('/all_chatroom').on('connection', async socket => {
  const loginUserId = socket.handshake.auth.userId
  const loginUser = await User.findByPk(loginUserId, { raw: true })
  // saving userId to object with socket ID
  chattingUsers[socket.id] = loginUser

  // -------------- Login 事件
  socket.on('login', () => {
    io.of('/all_chatroom').emit('loginEvent', chattingUsers[socket.id])
    io.of('/all_chatroom').emit('broadcast', chattingUsers)
  })

  // -------------- Logout 事件
  socket.on('disconnect', () => {
    // 在前後端都留下訊息
    io.of('/all_chatroom').emit('logoutEvent', chattingUsers[socket.id])
    // remove saved socket from users object
    delete chattingUsers[socket.id]
    io.of('/all_chatroom').emit('broadcast', chattingUsers)
  })

  // -------------- chat message 時時更新聊天室
  socket.on('chat message', receivedMsg => {
    const returnObj = {
      id: chattingUsers[socket.id].id,
      name: chattingUsers[socket.id].name,
      avatar: chattingUsers[socket.id].avatar,
      message: receivedMsg
    }
    // 將 訊息丟回到 socket chat message
    io.of('/all_chatroom').emit('chat message', returnObj)
  })
})

server.listen(3000, () => {
  console.log('listening on *:3000')
})

module.exports = { io }

require('./socketIo-pm')
require('./socketIo-notification')
