/* eslint-env mocha */

import chai from 'chai'
import sinon from 'sinon'
import Bacon from 'baconjs'
import * as Logger from './main'

describe('Logger', () => {

  let sandbox, consoleLog, consoleInfo

  beforeEach(() => {
    sandbox = sinon.sandbox.create()
    consoleLog = sinon.stub()
    consoleInfo = sinon.stub()

    Logger.config({
      consoleLog: consoleLog,
      consoleInfo: consoleInfo
    })
  })

  it('should return a pre-reduce pluggable', () => {
    const preReduce = Logger.getPreReduce()

    chai.expect(preReduce).to.have.property('input')
      .that.is.instanceof(Bacon.Observable)
    chai.expect(preReduce).to.have.property('output')
      .that.is.instanceof(Bacon.Observable)
  })

  it('should return a post-reduce pluggable', () => {
    const postReduce = Logger.getPostReduce()

    chai.expect(postReduce).to.have.property('input')
      .that.is.instanceof(Bacon.Observable)
    chai.expect(postReduce).to.have.property('output')
      .that.is.instanceof(Bacon.Observable)
  })

  it('should not collapse by default', () => {
    chai.expect(Logger.config()).to.have.property('collapsed')
      .and.is.false
  })

  it('should have a default predicate to log', () => {
    chai.expect(Logger.config()).to.have.property('predicate')
      .and.is.a('function')
  })

  it('should log by default', () => {
    const shouldLog = Logger.config().predicate({})
    chai.expect(shouldLog).to.be.true
  })

  it('should not log with skipLog set to true by default', () => {
    const shouldLog = Logger.config().predicate({
      action: {
        skipLog: true
      }
    })

    chai.expect(shouldLog).to.be.false
  })

  it('should log action type', () => {
    const preReduce = Logger.getPreReduce()
    preReduce.output.onValue()
    preReduce.input.push({ action: { id: Date.now(), type: 'type' }})
    chai.expect(consoleLog.called).to.be.true
    chai.expect(consoleLog.lastCall.args[0]).to.equal('\u001b[1m\u001b[36mACTION_type\u001b[39m\u001b[22m')
  })

  it('should log action dispatch', () => {
    const preReduce = Logger.getPreReduce()
    preReduce.output.onValue()
    preReduce.input.push({ action: 'test' })
    chai.expect(consoleInfo.calledOnce).to.be.true
    chai.expect(consoleInfo.lastCall.args[0]).to.equal('dispatch:')
    chai.expect(consoleInfo.lastCall.args[1]).to.equal('test')
  })

  it('should skip duplicating actions', () => {
    const preReduce = Logger.getPreReduce()
    const reduceArgs = { action: { id: Date.now() }}
    preReduce.output.onValue()
    preReduce.input.push(reduceArgs)
    preReduce.input.push(reduceArgs)
    chai.expect(consoleInfo.calledOnce).to.be.true
  })

  it('should log store name', () => {
    const postReduce = Logger.getPostReduce()
    postReduce.output.onValue()
    postReduce.input.push({ name: 'test' })
    chai.expect(consoleLog.calledWith('\u001b[1m\u001b[36mSTORE_test\u001b[39m\u001b[22m')).to.be.true
  })

  it('should log store from state', () => {
    const postReduce = Logger.getPostReduce()
    postReduce.output.onValue()
    postReduce.input.push({ state: 'test' })
    chai.expect(consoleLog.calledWith('from state:', 'test')).to.be.true
  })

  it('should log store next state', () => {
    const postReduce = Logger.getPostReduce()
    postReduce.output.onValue()
    postReduce.input.push({ nextState: 'next' })
    chai.expect(consoleLog.calledWith('next state:', 'next')).to.be.true
  })

  it('should console log', () => {
    sandbox.stub(console, 'log')
    Logger.config({ consoleLog: null })

    const preReduce = Logger.getPreReduce()
    preReduce.output.onValue()
    preReduce.input.push({ action: { id: Date.now() }})

    const consoleLogCalled = console.log.called
    sandbox.restore()
    chai.expect(consoleLogCalled).to.be.true
  })

  it('should console info', () => {
    sandbox.stub(console, 'info')
    Logger.config({ consoleInfo: null })

    const preReduce = Logger.getPreReduce()
    preReduce.output.onValue()
    preReduce.input.push({ action: { id: Date.now() }})

    const consoleInfoCalled = console.info.called
    sandbox.restore()
    chai.expect(consoleInfoCalled).to.be.true
  })

  it('should console group', () => {
    const backup = console.group
    console.group = sinon.stub()

    const preReduce = Logger.getPreReduce()
    preReduce.output.onValue()
    preReduce.input.push({ action: { id: Date.now() }})

    const consoleGroupCalled = console.group.called
    console.group = backup
    chai.expect(consoleGroupCalled).to.be.true
  })

  it('should console groupCollapsed', () => {
    const backup = console.groupCollapsed
    console.groupCollapsed = sinon.stub()
    Logger.config({
      collapsed: true
    })

    const preReduce = Logger.getPreReduce()
    preReduce.output.onValue()
    preReduce.input.push({ action: { id: Date.now() }})

    const consoleGroupCalled = console.groupCollapsed.called
    console.groupCollapsed = backup
    chai.expect(consoleGroupCalled).to.be.true
  })

  it('should console groupEnd', () => {
    const backup = console.groupEnd
    console.groupEnd = sinon.stub()

    const preReduce = Logger.getPreReduce()
    preReduce.output.onValue()
    preReduce.input.push({ action: { id: Date.now() }})

    const consoleGroupEndCalled = console.groupEnd.called
    console.groupEnd = backup
    chai.expect(consoleGroupEndCalled).to.be.true
  })

  it('should configure to collapse', () => {
    Logger.config({
      collapsed: true
    })

    chai.expect(Logger.config()).to.have.property('collapsed')
      .and.is.true
  })

  it('should configure to custom predicate to log', () => {
    Logger.config({
      predicate: sinon.stub().returns(false)
    })

    const shouldLog = Logger.config().predicate({})
    chai.expect(shouldLog).to.be.false
  })

  afterEach(() => {
    sandbox.restore()
  })

})
