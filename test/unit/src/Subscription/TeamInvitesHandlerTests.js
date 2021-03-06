/* eslint-disable
    handle-callback-err,
    max-len,
    no-return-assign,
    no-unused-vars,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const SandboxedModule = require('sandboxed-module')
const should = require('chai').should()
const sinon = require('sinon')
const { expect } = require('chai')
const querystring = require('querystring')
const modulePath =
  '../../../../app/src/Features/Subscription/TeamInvitesHandler'

const { ObjectId } = require('mongojs')
const Errors = require('../../../../app/src/Features/Errors/Errors')

describe('TeamInvitesHandler', function() {
  beforeEach(function() {
    this.manager = {
      id: '666666',
      first_name: 'Daenerys',
      last_name: 'Targaryen',
      email: 'daenerys@example.com'
    }

    this.token = 'aaaaaaaaaaaaaaaaaaaaaa'

    this.teamInvite = {
      email: 'jorah@example.com',
      token: this.token
    }

    this.subscription = {
      id: '55153a8014829a865bbf700d',
      _id: new ObjectId('55153a8014829a865bbf700d'),
      admin_id: this.manager.id,
      groupPlan: true,
      member_ids: [],
      teamInvites: [this.teamInvite],
      save: sinon.stub().yields(null)
    }

    this.SubscriptionLocator = {
      getUsersSubscription: sinon.stub(),
      getSubscription: sinon.stub().yields(null, this.subscription)
    }

    this.UserGetter = {
      getUser: sinon.stub().yields(),
      getUserByAnyEmail: sinon.stub().yields()
    }

    this.SubscriptionUpdater = {
      addUserToGroup: sinon.stub().yields()
    }

    this.LimitationsManager = {
      teamHasReachedMemberLimit: sinon.stub().returns(false)
    }

    this.Subscription = {
      findOne: sinon.stub().yields(),
      update: sinon.stub().yields()
    }

    this.EmailHandler = {
      sendEmail: sinon.stub().yields(null)
    }

    this.newToken = 'bbbbbbbbb'

    this.crypto = {
      randomBytes: () => {
        return { toString: sinon.stub().returns(this.newToken) }
      }
    }

    this.UserGetter.getUser.withArgs(this.manager.id).yields(null, this.manager)
    this.UserGetter.getUserByAnyEmail
      .withArgs(this.manager.email)
      .yields(null, this.manager)

    this.SubscriptionLocator.getUsersSubscription.yields(
      null,
      this.subscription
    )
    this.Subscription.findOne.yields(null, this.subscription)

    return (this.TeamInvitesHandler = SandboxedModule.require(modulePath, {
      requires: {
        'logger-sharelatex': { log() {} },
        crypto: this.crypto,
        'settings-sharelatex': { siteUrl: 'http://example.com' },
        '../../models/TeamInvite': { TeamInvite: (this.TeamInvite = {}) },
        '../../models/Subscription': { Subscription: this.Subscription },
        '../User/UserGetter': this.UserGetter,
        './SubscriptionLocator': this.SubscriptionLocator,
        './SubscriptionUpdater': this.SubscriptionUpdater,
        './LimitationsManager': this.LimitationsManager,
        '../Email/EmailHandler': this.EmailHandler,
        '../Errors/Errors': Errors
      }
    }))
  })

  describe('getInvite', function() {
    it("returns the invite if there's one", function(done) {
      return this.TeamInvitesHandler.getInvite(
        this.token,
        (err, invite, subscription) => {
          expect(err).to.eq(null)
          expect(invite).to.deep.eq(this.teamInvite)
          expect(subscription).to.deep.eq(this.subscription)
          return done()
        }
      )
    })

    return it("returns teamNotFound if there's none", function(done) {
      this.Subscription.findOne = sinon.stub().yields(null, null)

      return this.TeamInvitesHandler.getInvite(this.token, function(
        err,
        invite,
        subscription
      ) {
        expect(err).to.be.instanceof(Errors.NotFoundError)
        return done()
      })
    })
  })

  describe('createInvite', function() {
    it('adds the team invite to the subscription', function(done) {
      return this.TeamInvitesHandler.createInvite(
        this.manager.id,
        this.subscription,
        'John.Snow@example.com',
        (err, invite) => {
          expect(err).to.eq(null)
          expect(invite.token).to.eq(this.newToken)
          expect(invite.email).to.eq('john.snow@example.com')
          expect(invite.inviterName).to.eq(
            'Daenerys Targaryen (daenerys@example.com)'
          )
          expect(this.subscription.teamInvites).to.deep.include(invite)
          return done()
        }
      )
    })

    it('sends an email', function(done) {
      return this.TeamInvitesHandler.createInvite(
        this.manager.id,
        this.subscription,
        'John.Snow@example.com',
        (err, invite) => {
          this.EmailHandler.sendEmail
            .calledWith(
              'verifyEmailToJoinTeam',
              sinon.match({
                to: 'john.snow@example.com',
                inviterName: 'Daenerys Targaryen (daenerys@example.com)',
                acceptInviteUrl: `http://example.com/subscription/invites/${
                  this.newToken
                }/`
              })
            )
            .should.equal(true)
          return done()
        }
      )
    })

    it('refreshes the existing invite if the email has already been invited', function(done) {
      const originalInvite = Object.assign({}, this.teamInvite)

      return this.TeamInvitesHandler.createInvite(
        this.manager.id,
        this.subscription,
        originalInvite.email,
        (err, invite) => {
          expect(err).to.eq(null)
          expect(invite).to.exist

          expect(this.subscription.teamInvites.length).to.eq(1)
          expect(this.subscription.teamInvites).to.deep.include(invite)

          expect(invite.email).to.eq(originalInvite.email)

          this.subscription.save.calledOnce.should.eq(true)

          return done()
        }
      )
    })

    return it('removes any legacy invite from the subscription', function(done) {
      return this.TeamInvitesHandler.createInvite(
        this.manager.id,
        this.subscription,
        'John.Snow@example.com',
        (err, invite) => {
          this.Subscription.update
            .calledWith(
              { _id: new ObjectId('55153a8014829a865bbf700d') },
              { $pull: { invited_emails: 'john.snow@example.com' } }
            )
            .should.eq(true)
          return done()
        }
      )
    })
  })

  describe('importInvite', function() {
    beforeEach(function() {
      return (this.sentAt = new Date())
    })

    return it('can imports an invite from v1', function() {
      return this.TeamInvitesHandler.importInvite(
        this.subscription,
        'A-Team',
        'hannibal@a-team.org',
        'secret',
        this.sentAt,
        error => {
          expect(error).not.to.exist

          this.subscription.save.calledOnce.should.eq(true)

          const invite = this.subscription.teamInvites.find(
            i => i.email === 'hannibal@a-team.org'
          )
          expect(invite.token).to.eq('secret')
          return expect(invite.sentAt).to.eq(this.sentAt)
        }
      )
    })
  })

  describe('acceptInvite', function() {
    beforeEach(function() {
      this.user = {
        id: '123456789',
        first_name: 'Tyrion',
        last_name: 'Lannister',
        email: 'tyrion@example.com'
      }

      this.UserGetter.getUserByAnyEmail
        .withArgs(this.user.email)
        .yields(null, this.user)

      return this.subscription.teamInvites.push({
        email: 'john.snow@example.com',
        token: 'dddddddd',
        inviterName: 'Daenerys Targaryen (daenerys@example.com)'
      })
    })

    it('adds the user to the team', function(done) {
      return this.TeamInvitesHandler.acceptInvite(
        'dddddddd',
        this.user.id,
        () => {
          this.SubscriptionUpdater.addUserToGroup
            .calledWith(this.subscription._id, this.user.id)
            .should.eq(true)
          return done()
        }
      )
    })

    return it('removes the invite from the subscription', function(done) {
      return this.TeamInvitesHandler.acceptInvite(
        'dddddddd',
        this.user.id,
        () => {
          this.Subscription.update
            .calledWith(
              { _id: new ObjectId('55153a8014829a865bbf700d') },
              { $pull: { teamInvites: { email: 'john.snow@example.com' } } }
            )
            .should.eq(true)
          return done()
        }
      )
    })
  })

  describe('revokeInvite', () =>
    it('removes the team invite from the subscription', function(done) {
      return this.TeamInvitesHandler.revokeInvite(
        this.manager.id,
        this.subscription,
        'jorah@example.com',
        () => {
          this.Subscription.update
            .calledWith(
              { _id: new ObjectId('55153a8014829a865bbf700d') },
              { $pull: { teamInvites: { email: 'jorah@example.com' } } }
            )
            .should.eq(true)

          this.Subscription.update
            .calledWith(
              { _id: new ObjectId('55153a8014829a865bbf700d') },
              { $pull: { invited_emails: 'jorah@example.com' } }
            )
            .should.eq(true)
          return done()
        }
      )
    }))

  describe('createTeamInvitesForLegacyInvitedEmail', function(done) {
    beforeEach(function() {
      this.subscription.invited_emails = [
        'eddard@example.com',
        'robert@example.com'
      ]
      this.TeamInvitesHandler.createInvite = sinon.stub().yields(null)
      return (this.SubscriptionLocator.getGroupsWithEmailInvite = sinon
        .stub()
        .yields(null, [this.subscription]))
    })

    return it('sends an invitation email to addresses in the legacy invited_emails field', function(done) {
      return this.TeamInvitesHandler.createTeamInvitesForLegacyInvitedEmail(
        'eddard@example.com',
        (err, invite) => {
          expect(err).not.to.exist

          this.TeamInvitesHandler.createInvite
            .calledWith(
              this.subscription.admin_id,
              this.subscription,
              'eddard@example.com'
            )
            .should.eq(true)

          this.TeamInvitesHandler.createInvite.callCount.should.eq(1)

          return done()
        }
      )
    })
  })

  return describe('validation', function() {
    it("doesn't create an invite if the team limit has been reached", function(done) {
      this.LimitationsManager.teamHasReachedMemberLimit = sinon
        .stub()
        .returns(true)
      return this.TeamInvitesHandler.createInvite(
        this.manager.id,
        this.subscription,
        'John.Snow@example.com',
        (err, invite) => {
          expect(err).to.deep.equal({ limitReached: true })
          return done()
        }
      )
    })

    it("doesn't create an invite if the subscription is not in a group plan", function(done) {
      this.subscription.groupPlan = false
      return this.TeamInvitesHandler.createInvite(
        this.manager.id,
        this.subscription,
        'John.Snow@example.com',
        (err, invite) => {
          expect(err).to.deep.equal({ wrongPlan: true })
          return done()
        }
      )
    })

    return it("doesn't create an invite if the user is already part of the team", function(done) {
      const member = {
        id: '1a2b',
        _id: '1a2b',
        email: 'tyrion@example.com'
      }

      this.subscription.member_ids = [member.id]
      this.UserGetter.getUserByAnyEmail
        .withArgs(member.email)
        .yields(null, member)

      return this.TeamInvitesHandler.createInvite(
        this.manager.id,
        this.subscription,
        'tyrion@example.com',
        (err, invite) => {
          expect(err).to.deep.equal({ alreadyInTeam: true })
          expect(invite).not.to.exist
          return done()
        }
      )
    })
  })
})
