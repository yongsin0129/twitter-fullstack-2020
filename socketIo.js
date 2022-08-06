const app = require('./app')
const http = require('http')
const server = http.createServer(app)
const { Server } = require('socket.io')
const io = new Server(server)
const { User } = require('./models')

// 記錄之前的訊息
// const historyLogs = [{}]

const chattingUsers = {}

// --------------    io --------------    建立連線
io.on('connection', async socket => {
  // 建立連線的用戶都可以看到以前的訊息
  // historyLogs.forEach(log => {
  //   socket.emit('chat message', log)
  // })
  const loginUserId = socket.handshake.auth.userId
  socket.join(loginUserId)
  // 透過資料庫找尋使用者資料
  const loginUser = await User.findByPk(loginUserId, { raw: true })
  // saving userId to object with socket ID
  chattingUsers[socket.id] = { userSocketId: socket.id, ...loginUser }
  console.log('a user ' + chattingUsers[socket.id].name + ' connected')

  // -------------- Login 事件
  socket.on('login', () => {
    io.sockets.emit('loginEvent', chattingUsers[socket.id])
    io.sockets.emit('broadcast', chattingUsers)
  })

  // -------------- Logout 事件
  socket.on('disconnect', () => {
    // 在前後端都留下訊息
    console.log('user ' + chattingUsers[socket.id]?.name + ' disconnected')
    io.sockets.emit('logoutEvent', chattingUsers[socket.id])
    // remove saved socket from users object
    delete chattingUsers[socket.id]
    io.sockets.emit('broadcast', chattingUsers)
  })

  // --------------   監聽 --------------   chat message emit 的任何訊息
  socket.on('chat message', receivedMsg => {
    const returnObj = {
      id: chattingUsers[socket.id].id,
      name: chattingUsers[socket.id].name,
      avatar: chattingUsers[socket.id].avatar,
      message: receivedMsg
    }
    // 將 訊息丟回到 socket chat message
    io.emit('chat message', returnObj)
  })

  // --------------   監聽 --------------   private Message 的任何訊息
  require('./socketIo-pm')(socket)

  // -------------   監聽 --------------   notification 的任何訊息
  require('./socketIo-notification')(socket)
})

server.listen(3000, () => {
  console.log('listening on *:3000')
})

module.exports = { io, chattingUsers }
