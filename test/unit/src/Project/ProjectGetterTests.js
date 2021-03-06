/* eslint-disable
    camelcase,
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
const sinon = require('sinon')
const chai = require('chai')
const should = chai.should()
const { expect } = chai
const modulePath = '../../../../app/src/Features/Project/ProjectGetter.js'
const SandboxedModule = require('sandboxed-module')
const { ObjectId } = require('mongojs')
const { assert } = require('chai')

describe('ProjectGetter', function() {
  beforeEach(function() {
    this.callback = sinon.stub()
    return (this.ProjectGetter = SandboxedModule.require(modulePath, {
      requires: {
        '../../infrastructure/mongojs': {
          db: (this.db = {
            projects: {},
            users: {}
          }),
          ObjectId
        },
        'metrics-sharelatex': {
          timeAsyncMethod: sinon.stub()
        },
        '../../models/Project': {
          Project: (this.Project = {})
        },
        '../Collaborators/CollaboratorsHandler': (this.CollaboratorsHandler = {}),
        '../../infrastructure/LockManager': (this.LockManager = {
          runWithLock: sinon.spy((namespace, id, runner, callback) =>
            runner(callback)
          )
        }),
        './ProjectEntityMongoUpdateHandler': {
          lockKey(project_id) {
            return project_id
          }
        },
        'logger-sharelatex': {
          err() {},
          log() {}
        }
      }
    }))
  })

  describe('getProjectWithoutDocLines', function() {
    beforeEach(function() {
      this.project = { _id: (this.project_id = '56d46b0a1d3422b87c5ebcb1') }
      return (this.ProjectGetter.getProject = sinon.stub().yields())
    })

    return describe('passing an id', function() {
      beforeEach(function() {
        return this.ProjectGetter.getProjectWithoutDocLines(
          this.project_id,
          this.callback
        )
      })

      it('should call find with the project id', function() {
        return this.ProjectGetter.getProject
          .calledWith(this.project_id)
          .should.equal(true)
      })

      it('should exclude the doc lines', function() {
        const excludes = {
          'rootFolder.docs.lines': 0,
          'rootFolder.folders.docs.lines': 0,
          'rootFolder.folders.folders.docs.lines': 0,
          'rootFolder.folders.folders.folders.docs.lines': 0,
          'rootFolder.folders.folders.folders.folders.docs.lines': 0,
          'rootFolder.folders.folders.folders.folders.folders.docs.lines': 0,
          'rootFolder.folders.folders.folders.folders.folders.folders.docs.lines': 0,
          'rootFolder.folders.folders.folders.folders.folders.folders.folders.docs.lines': 0
        }

        return this.ProjectGetter.getProject
          .calledWith(this.project_id, excludes)
          .should.equal(true)
      })

      return it('should call the callback', function() {
        return this.callback.called.should.equal(true)
      })
    })
  })

  describe('getProjectWithOnlyFolders', function() {
    beforeEach(function() {
      this.project = { _id: (this.project_id = '56d46b0a1d3422b87c5ebcb1') }
      return (this.ProjectGetter.getProject = sinon.stub().yields())
    })

    return describe('passing an id', function() {
      beforeEach(function() {
        return this.ProjectGetter.getProjectWithOnlyFolders(
          this.project_id,
          this.callback
        )
      })

      it('should call find with the project id', function() {
        return this.ProjectGetter.getProject
          .calledWith(this.project_id)
          .should.equal(true)
      })

      it('should exclude the docs and files linesaaaa', function() {
        const excludes = {
          'rootFolder.docs': 0,
          'rootFolder.fileRefs': 0,
          'rootFolder.folders.docs': 0,
          'rootFolder.folders.fileRefs': 0,
          'rootFolder.folders.folders.docs': 0,
          'rootFolder.folders.folders.fileRefs': 0,
          'rootFolder.folders.folders.folders.docs': 0,
          'rootFolder.folders.folders.folders.fileRefs': 0,
          'rootFolder.folders.folders.folders.folders.docs': 0,
          'rootFolder.folders.folders.folders.folders.fileRefs': 0,
          'rootFolder.folders.folders.folders.folders.folders.docs': 0,
          'rootFolder.folders.folders.folders.folders.folders.fileRefs': 0,
          'rootFolder.folders.folders.folders.folders.folders.folders.docs': 0,
          'rootFolder.folders.folders.folders.folders.folders.folders.fileRefs': 0,
          'rootFolder.folders.folders.folders.folders.folders.folders.folders.docs': 0,
          'rootFolder.folders.folders.folders.folders.folders.folders.folders.fileRefs': 0
        }
        return this.ProjectGetter.getProject
          .calledWith(this.project_id, excludes)
          .should.equal(true)
      })

      return it('should call the callback with the project', function() {
        return this.callback.called.should.equal(true)
      })
    })
  })

  describe('getProject', function() {
    beforeEach(function() {
      this.project = { _id: (this.project_id = '56d46b0a1d3422b87c5ebcb1') }
      return (this.db.projects.find = sinon
        .stub()
        .callsArgWith(2, null, [this.project]))
    })

    describe('without projection', function() {
      describe('with project id', function() {
        beforeEach(function() {
          return this.ProjectGetter.getProject(this.project_id, this.callback)
        })

        return it('should call find with the project id', function() {
          expect(this.db.projects.find.callCount).to.equal(1)
          return expect(this.db.projects.find.lastCall.args[0]).to.deep.equal({
            _id: ObjectId(this.project_id)
          })
        })
      })

      return describe('without project id', function() {
        beforeEach(function() {
          return this.ProjectGetter.getProject(null, this.callback)
        })

        return it('should callback with error', function() {
          expect(this.db.projects.find.callCount).to.equal(0)
          return expect(this.callback.lastCall.args[0]).to.be.instanceOf(Error)
        })
      })
    })

    return describe('with projection', function() {
      beforeEach(function() {
        return (this.projection = { _id: 1 })
      })

      describe('with project id', function() {
        beforeEach(function() {
          return this.ProjectGetter.getProject(
            this.project_id,
            this.projection,
            this.callback
          )
        })

        return it('should call find with the project id', function() {
          expect(this.db.projects.find.callCount).to.equal(1)
          expect(this.db.projects.find.lastCall.args[0]).to.deep.equal({
            _id: ObjectId(this.project_id)
          })
          return expect(this.db.projects.find.lastCall.args[1]).to.deep.equal(
            this.projection
          )
        })
      })

      return describe('without project id', function() {
        beforeEach(function() {
          return this.ProjectGetter.getProject(null, this.callback)
        })

        return it('should callback with error', function() {
          expect(this.db.projects.find.callCount).to.equal(0)
          return expect(this.callback.lastCall.args[0]).to.be.instanceOf(Error)
        })
      })
    })
  })

  describe('getProjectWithoutLock', function() {
    beforeEach(function() {
      this.project = { _id: (this.project_id = '56d46b0a1d3422b87c5ebcb1') }
      return (this.db.projects.find = sinon
        .stub()
        .callsArgWith(2, null, [this.project]))
    })

    describe('without projection', function() {
      describe('with project id', function() {
        beforeEach(function() {
          return this.ProjectGetter.getProjectWithoutLock(
            this.project_id,
            this.callback
          )
        })

        return it('should call find with the project id', function() {
          expect(this.db.projects.find.callCount).to.equal(1)
          return expect(this.db.projects.find.lastCall.args[0]).to.deep.equal({
            _id: ObjectId(this.project_id)
          })
        })
      })

      return describe('without project id', function() {
        beforeEach(function() {
          return this.ProjectGetter.getProjectWithoutLock(null, this.callback)
        })

        return it('should callback with error', function() {
          expect(this.db.projects.find.callCount).to.equal(0)
          return expect(this.callback.lastCall.args[0]).to.be.instanceOf(Error)
        })
      })
    })

    return describe('with projection', function() {
      beforeEach(function() {
        return (this.projection = { _id: 1 })
      })

      describe('with project id', function() {
        beforeEach(function() {
          return this.ProjectGetter.getProjectWithoutLock(
            this.project_id,
            this.projection,
            this.callback
          )
        })

        return it('should call find with the project id', function() {
          expect(this.db.projects.find.callCount).to.equal(1)
          expect(this.db.projects.find.lastCall.args[0]).to.deep.equal({
            _id: ObjectId(this.project_id)
          })
          return expect(this.db.projects.find.lastCall.args[1]).to.deep.equal(
            this.projection
          )
        })
      })

      return describe('without project id', function() {
        beforeEach(function() {
          return this.ProjectGetter.getProjectWithoutLock(null, this.callback)
        })

        return it('should callback with error', function() {
          expect(this.db.projects.find.callCount).to.equal(0)
          return expect(this.callback.lastCall.args[0]).to.be.instanceOf(Error)
        })
      })
    })
  })

  describe('findAllUsersProjects', function() {
    beforeEach(function() {
      this.fields = { mock: 'fields' }
      this.Project.find = sinon.stub()
      this.Project.find
        .withArgs({ owner_ref: this.user_id }, this.fields)
        .yields(null, ['mock-owned-projects'])
      this.CollaboratorsHandler.getProjectsUserIsMemberOf = sinon.stub()
      this.CollaboratorsHandler.getProjectsUserIsMemberOf
        .withArgs(this.user_id, this.fields)
        .yields(null, {
          readAndWrite: ['mock-rw-projects'],
          readOnly: ['mock-ro-projects'],
          tokenReadAndWrite: ['mock-token-rw-projects'],
          tokenReadOnly: ['mock-token-ro-projects']
        })
      return this.ProjectGetter.findAllUsersProjects(
        this.user_id,
        this.fields,
        this.callback
      )
    })

    return it('should call the callback with all the projects', function() {
      return this.callback
        .calledWith(null, {
          owned: ['mock-owned-projects'],
          readAndWrite: ['mock-rw-projects'],
          readOnly: ['mock-ro-projects'],
          tokenReadAndWrite: ['mock-token-rw-projects'],
          tokenReadOnly: ['mock-token-ro-projects']
        })
        .should.equal(true)
    })
  })

  return describe('getProjectIdByReadAndWriteToken', function() {
    describe('when project find returns project', function() {
      this.beforeEach(function() {
        this.Project.findOne = sinon.stub().yields(null, { _id: 'project-id' })
        return this.ProjectGetter.getProjectIdByReadAndWriteToken(
          'token',
          this.callback
        )
      })

      it('should find project with token', function() {
        return this.Project.findOne
          .calledWithMatch({ 'tokens.readAndWrite': 'token' })
          .should.equal(true)
      })

      return it('should callback with project id', function() {
        return this.callback.calledWith(null, 'project-id').should.equal(true)
      })
    })

    describe('when project not found', function() {
      this.beforeEach(function() {
        this.Project.findOne = sinon.stub().yields()
        return this.ProjectGetter.getProjectIdByReadAndWriteToken(
          'token',
          this.callback
        )
      })

      return it('should callback empty', function() {
        return expect(this.callback.firstCall.args.length).to.equal(0)
      })
    })

    return describe('when project find returns error', function() {
      this.beforeEach(function() {
        this.Project.findOne = sinon.stub().yields('error')
        return this.ProjectGetter.getProjectIdByReadAndWriteToken(
          'token',
          this.callback
        )
      })

      return it('should callback with error', function() {
        return this.callback.calledWith('error').should.equal(true)
      })
    })
  })
})
