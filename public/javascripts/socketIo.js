socket.emit('updateNotification')
socket.emit('checkIfUnreadPrivateMessage')

setInterval(() => {
  socket.emit('updateNotification')
  socket.emit('checkIfUnreadPrivateMessage')
}, 3000)

socket.on('informSubscribersUpdateNote', () => {
  socket.emit('updateNotification')
})

socket.on('updateNotification', ({ follow, like, tweet, reply }) => {
  const array = follow.concat(like, tweet, reply)
  if (array.length > 0) {
    $('#tab-notification').addClass('main-color-blink')
    $('#tab-notification').find('.nav-circle').addClass('nav-circle-count')
    $('#tab-notification').find('.nav-circle-count').html(array.length)
  }  
})

socket.on('updatePMNumberCount', result => {
  if (result.length > 0) {
    $('#tab-privateMessage').addClass('main-color-blink')
    $('#tab-privateMessage').find('.nav-circle').addClass('nav-circle-count')
    $('#tab-privateMessage').find('.nav-circle-count').html(result.length)
  } else {
    $('#tab-privateMessage').removeClass('main-color-blink')
    $('#tab-privateMessage').find('.nav-circle-count').html('')
    $('#tab-privateMessage').find('.nav-circle').removeClass('nav-circle-count')
  }
})

// ------button function for posting follow like comment reply
function notifyForAllSubscribers () {
  socket.emit('notifyForAllSubscribers')
}

function timeFormat (timeObj) {
  const hour = timeObj.getHours()
  const minute = timeObj.getMinutes()
  if (hour >= 12) return `下午${hour - 12}:${minute}`
  else return `上午${hour}:${minute}`
}

function showMessageOnChatBox (receivedObj) {
  if (Number(receivedObj.id) !== loginUserId) {
    // 他人的訊息 --- 出現在左邊
    const leftHandMessage = document.createElement('li')
    leftHandMessage.className = 'li-left-message'
    leftHandMessage.innerHTML =
      `
      <div class="message-img">
        <img src="${receivedObj.avatar}" class=""
          style="width:40px;height:40px;border-radius: 50px;" alt="Picture">
      </div>
      <span class="message-time">${timeFormat(new Date())}</span>
      <div class="message-span">
        <span>
          ${receivedObj.message}
        </span>
      </div>
      `
    messagesDOM.appendChild(leftHandMessage)
  } else {
    // 自已的訊息 --- 出現在右邊
    const rightHandMessage = document.createElement('li')
    rightHandMessage.className = 'li-right-message'
    rightHandMessage.innerHTML =
      `
      <span class="message-time">${timeFormat(new Date())}</span>
      <div class="message-span">
        <span class="span-message">
          ${receivedObj.message}
        </span>
      </div>
      `
    messagesDOM.appendChild(rightHandMessage)
  }
  scrollbarRegion.scrollTo(0, scrollbarRegion.scrollHeight)
}