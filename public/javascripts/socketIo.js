socket.emit('updateNotification')

setInterval(() => {
  socket.emit('updateNotification')
}, 5000)

socket.on('informSubscribersUpdateNote', () => {
  socket.emit('updateNotification')
})

socket.on('updateNotification', ({ follow, like, tweet, reply }) => {
  const array = follow.concat(like, tweet, reply)
  if (array.length > 0) {
    $('#tab-notification').addClass('main-color-blink')
    $('#tab-notification')
      .find('.nav-circle')
      .addClass('nav-circle-count')
    $('#tab-notification')
      .find('.nav-circle-count')
      .html(array.length)
  }
})

// ------button function for posting follow like comment reply
function notifyForAllSubscribers () {
  socket.emit('notifyForAllSubscribers')
}

function timeFormat (timeObj) {
  const hour = timeObj.getHours() //0-24
  const minute = timeObj.getMinutes() //0-59
  if (hour >= 12) return `下午${hour - 12}:${minute}`
  else return `上午${hour}:${minute}`
}
