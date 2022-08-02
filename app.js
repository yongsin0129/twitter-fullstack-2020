if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}
const express = require('express')
const helpers = require('./_helpers')
const methodOverride = require('method-override')
const handlebars = require('express-handlebars')
const handlebarsHelpers = require('./helpers/handlebars-helpers')
const session = require('express-session')
const passport = require('passport')
const flash = require('connect-flash')
const bodyParser = require('body-parser')
const path = require('path')
const routes = require('./routes')
const app = express()
const http = require('http')
const server = http.createServer(app)
const { Server } = require('socket.io')
const io = new Server(server)
const port = process.env.PORT || 3000

const SESSION_SECRET = 'secret'

app.engine('hbs', handlebars({ extname: '.hbs', helpers: handlebarsHelpers }))
app.set('view engine', 'hbs')
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))
app.use(express.json())
app.use(session({ secret: SESSION_SECRET, resave: false, saveUninitialized: false }))
app.use(passport.initialize())
app.use(passport.session())
app.use(flash())
app.use(methodOverride('_method'))
app.use('/upload', express.static(path.join(__dirname, 'upload')))
app.use((req, res, next) => {
  res.locals.success_messages = req.flash('success_messages')
  res.locals.error_messages = req.flash('error_messages')
  res.locals.error_messages_account = req.flash('error_messages_account')
  res.locals.loginUser = helpers.getUser(req)
  next()
})

app.use(routes)
server.listen(3000, () => {
  console.log('listening on *:3000')
})

// 記錄之前的訊息
const historyLogs = [
  { name: 'Majer', message: 'Welcome Majer!' },
  { name: 'vincent', message: 'Welcome vincent' },
  { name: 'carl', message: 'Welcome carl' },
  { name: 'andy', message: 'Welcome andy' }
]

const chattingUsers = {}

// io 建立連線
io.on('connection', socket => {
  // 建立連線的用戶都可以看到以前的訊息
  historyLogs.forEach(log => {
    socket.emit('chat message', log)
  })

  // 有使用者上線
  socket.on('login', data => {
    console.log('a user ' + data.userName + ' connected')
    // saving userId to object with socket ID
    chattingUsers[socket.id] = {
      name: data.userName,
      avatar: data.avatar
    }
    io.sockets.emit('broadcast', { description: data.userName + ' 上線了 !!' })
    // io.emit('chat message', data.userName + ' 上線了 !!')
  })

  // 有使用者離線
  socket.on('disconnect', () => {
    console.log('user ' + chattingUsers[socket.id]?.name + ' disconnected')
    io.sockets.emit('broadcast', { description: chattingUsers[socket.id]?.name + ' 離線了 !!' })
    // remove saved socket from users object
    delete chattingUsers[socket.id]
  })

  // 監聽 chat message emit 的任何訊息
  socket.on('chat message', msg => {
    const returnObj = {
      name: chattingUsers[socket.id].name,
      avatar: chattingUsers[socket.id].avatar,
      message: msg
    }
    console.log('returnObj: ' + returnObj)
    // 將 訊息丟回到 socket chat message
    io.emit('chat message', returnObj)
  })
})

module.exports = app
