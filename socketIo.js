const app = require('./app')
const http = require('http')
const server = http.createServer(app)
const { Server } = require('socket.io')
const io = new Server(server)
const { User } = require('./models')

// 記錄之前的訊息
const historyLogs = [
  { name: 'Majer', message: 'Welcome Majer!' },
  { name: 'vincent', message: 'Welcome vincent' },
  { name: 'carl', message: 'Welcome carl' },
  { name: 'andy', message: 'Welcome andy' }
]

const chattingUsers = {}

// --------------    io --------------    建立連線
io.on('connection', socket => {
  // 建立連線的用戶都可以看到以前的訊息
  historyLogs.forEach(log => {
    socket.emit('chat message', log)
  })

  // --------------   有使用者上線
  socket.on('login', async loginData => {
    // 透過資料庫找尋使用者資料
    const loginUser = await User.findByPk(loginData.userId, { raw: true })
    // saving userId to object with socket ID
    chattingUsers[socket.id] = loginUser
    // 在前後端都留下訊息
    console.log('a user ' + chattingUsers[socket.id].name + ' connected')
    io.sockets.emit('broadcast', { description: chattingUsers[socket.id].name + ' 上線了 !!' })
  })

  // --------------   有使用者離線
  socket.on('disconnect', () => {
    console.log('user ' + chattingUsers[socket.id]?.name + ' disconnected')
    io.sockets.emit('broadcast', { description: chattingUsers[socket.id]?.name + ' 離線了 !!' })
    // remove saved socket from users object
    delete chattingUsers[socket.id]
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
})

server.listen(3000, () => {
  console.log('listening on *:3000')
})
