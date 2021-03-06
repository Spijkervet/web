/* eslint-disable
    camelcase,
    max-len,
    no-unused-vars,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let EditorRealTimeController
const Settings = require('settings-sharelatex')
const RedisWrapper = require('../../infrastructure/RedisWrapper')
const rclient = RedisWrapper.client('realtime')
const os = require('os')
const crypto = require('crypto')

const HOST = os.hostname()
const RND = crypto.randomBytes(4).toString('hex') // generate a random key for this process
let COUNT = 0

module.exports = EditorRealTimeController = {
  emitToRoom(room_id, message, ...payload) {
    // create a unique message id using a counter
    const message_id = `web:${HOST}:${RND}-${COUNT++}`
    return rclient.publish(
      'editor-events',
      JSON.stringify({
        room_id,
        message,
        payload,
        _id: message_id
      })
    )
  },

  emitToAll(message, ...payload) {
    return this.emitToRoom('all', message, ...Array.from(payload))
  }
}
