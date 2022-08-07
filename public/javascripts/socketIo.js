//  ---建立連線
const socket = io()

socket.emit('updateNotification')

socket.on('informSubscribersUpdateNote', () => {
  console.log('收到，馬上跟後端聯絡拿取最新的通知資料')
  socket.emit('updateNotification')
})

socket.on('updateNotification', ({ follow, like, tweet, reply }) => {
  const array = follow.concat(like, tweet, reply)
  if (array.length > 0) {
    $('#tab-notification').addClass('main-color-blink')
  }
})

// ------button function for posting follow like comment reply
function notifyForAllSubscribers () {
  socket.emit('notifyForAllSubscribers')
}
