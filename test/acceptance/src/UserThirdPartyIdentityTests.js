/* eslint-disable
    handle-callback-err,
    max-len,
    no-unused-vars,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const Errors = require('../../../app/src/Features/Errors/Errors')
const Settings = require('settings-sharelatex')
const User = require('./helpers/User')
const ThirdPartyIdentityManager = require('../../../app/src/Features/User/ThirdPartyIdentityManager')
const chai = require('chai')

const { expect } = chai

describe('ThirdPartyIdentityManager', function() {
  beforeEach(function(done) {
    this.provider = 'provider'
    this.externalUserId = 'external-user-id'
    this.externalData = { test: 'data' }
    this.user = new User()
    return this.user.ensureUserExists(done)
  })

  afterEach(function(done) {
    return this.user.full_delete_user(this.user.email, done)
  })

  describe('login', function() {
    describe('when third party identity exists', function() {
      beforeEach(function(done) {
        return ThirdPartyIdentityManager.link(
          this.user.id,
          this.provider,
          this.externalUserId,
          this.externalData,
          done
        )
      })

      it('should return user', function(done) {
        ThirdPartyIdentityManager.login(
          this.provider,
          this.externalUserId,
          this.externalData,
          (err, user) => {
            expect(err).to.be.null
            expect(user._id.toString()).to.equal(this.user.id)
            return done()
          }
        )
      })

      return it('should merge external data', function(done) {
        this.externalData = {
          test: 'different',
          another: 'key'
        }
        ThirdPartyIdentityManager.login(
          this.provider,
          this.externalUserId,
          this.externalData,
          (err, user) => {
            expect(err).to.be.null
            expect(user.thirdPartyIdentifiers[0].externalData).to.deep.equal(
              this.externalData
            )
            return done()
          }
        )
      })
    })

    return describe('when third party identity does not exists', () =>
      it('should return error', function(done) {
        ThirdPartyIdentityManager.login(
          this.provider,
          this.externalUserId,
          this.externalData,
          (err, user) => {
            expect(err.name).to.equal('ThirdPartyUserNotFoundError')
            return done()
          }
        )
      }))
  })

  describe('link', function() {
    describe('when provider not already linked', () =>
      it('should link provider to user', function(done) {
        return ThirdPartyIdentityManager.link(
          this.user.id,
          this.provider,
          this.externalUserId,
          this.externalData,
          function(err, res) {
            expect(res.nModified).to.equal(1)
            return done()
          }
        )
      }))

    return describe('when provider is already linked', function() {
      beforeEach(function(done) {
        return ThirdPartyIdentityManager.link(
          this.user.id,
          this.provider,
          this.externalUserId,
          this.externalData,
          done
        )
      })

      it('should link provider to user', function(done) {
        return ThirdPartyIdentityManager.link(
          this.user.id,
          this.provider,
          this.externalUserId,
          this.externalData,
          function(err, res) {
            expect(res.nModified).to.equal(1)
            return done()
          }
        )
      })

      it('should not create duplicate thirdPartyIdentifiers', function(done) {
        return ThirdPartyIdentityManager.link(
          this.user.id,
          this.provider,
          this.externalUserId,
          this.externalData,
          (err, res) => {
            return this.user.get(function(err, user) {
              expect(user.thirdPartyIdentifiers.length).to.equal(1)
              return done()
            })
          }
        )
      })

      return it('should replace existing data', function(done) {
        this.externalData = { replace: 'data' }
        return ThirdPartyIdentityManager.link(
          this.user.id,
          this.provider,
          this.externalUserId,
          this.externalData,
          (err, res) => {
            return this.user.get((err, user) => {
              expect(user.thirdPartyIdentifiers[0].externalData).to.deep.equal(
                this.externalData
              )
              return done()
            })
          }
        )
      })
    })
  })

  return describe('unlink', function() {
    describe('when provider not already linked', () =>
      it('should succeed', function(done) {
        return ThirdPartyIdentityManager.unlink(
          this.user.id,
          this.provider,
          function(err, res) {
            expect(err).to.be.null
            expect(res.nModified).to.equal(0)
            return done()
          }
        )
      }))

    return describe('when provider is already linked', function() {
      beforeEach(function(done) {
        return ThirdPartyIdentityManager.link(
          this.user.id,
          this.provider,
          this.externalUserId,
          this.externalData,
          done
        )
      })

      return it('should remove thirdPartyIdentifiers entry', function(done) {
        return ThirdPartyIdentityManager.unlink(
          this.user.id,
          this.provider,
          (err, res) => {
            return this.user.get(function(err, user) {
              expect(user.thirdPartyIdentifiers.length).to.equal(0)
              return done()
            })
          }
        )
      })
    })
  })
})
