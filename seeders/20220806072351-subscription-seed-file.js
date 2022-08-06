'use strict'
const { User } = require('../models')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const usersArray = await User.findAll({ where: { role: 'user' }, raw: true })

    const subscriptionArray = []
    // 讓每位使用者對隨機 10位 不重複的 user 點 subscribe , 而且不能是自已
    usersArray.forEach((user, index) => {
      // randonUsers using deep copy
      const randonUsers = [...usersArray]
      // 將自已從 array 中移除
      randonUsers.splice(index, 1)
      for (let i = 0; i < 10; i++) {
        const randonNumber = Math.floor(Math.random() * randonUsers.length)
        subscriptionArray.push({
          subscriber_id: user.id,
          celebrity_id: randonUsers[randonNumber].id,
          created_at: new Date(),
          updated_at: new Date()
        })
        // 將使用者已經 follow 過的 user 從 randonUsers 中移除，避免產生重複 follow
        randonUsers.splice(randonNumber, 1)
      }
    })

    // 測試指定專用的 種子資料
    subscriptionArray.push({
      subscriber_id: 3,
      celebrity_id: 6,
      created_at: new Date(),
      updated_at: new Date()
    })

    // 將 repliesArray 放入 Replies 資料庫中
    await queryInterface.bulkInsert('Subscriptions', subscriptionArray)
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Subscriptions', null, {})
  }
}
