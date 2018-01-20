/* eslint-env mocha */

import chai from 'chai'
import sinon from 'sinon'
import Bacon from 'baconjs'
import { JSDOM } from 'jsdom'
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

  it('should console log action type', () => {
    sandbox.stub(console, 'log')
    const backup = Logger.config()
    Logger.config({
      consoleLog: null
    })

    const preReduce = Logger.getPreReduce()
    preReduce.output.onValue()
    preReduce.input.push({ action: { id: Date.now(), type: 'type' }})

    const consoleLogCalled = console.log.called
    const consoleLogFirstArg = console.log.lastCall.args[0]
    sandbox.restore()
    chai.expect(consoleLogCalled).to.be.true
    chai.expect(consoleLogFirstArg).to.equal('\u001b[1m\u001b[36mACTION_type\u001b[39m\u001b[22m')
    Logger.config(backup)
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
    postReduce.input.push({ name: 'test', state: {} })
    chai.expect(consoleLog.calledWith('\u001b[1m\u001b[36mSTORE_test\u001b[39m\u001b[22m')).to.be.true
  })

  it('should not log if state is unchanged', () => {
    const postReduce = Logger.getPostReduce()
    const state = {}
    postReduce.output.onValue()
    postReduce.input.push({ name: 'test', state, nextState: state })
    chai.expect(consoleLog.called).to.be.false
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

  it('should configure to collapse', () => {
    const backup = Logger.config()
    Logger.config({
      collapsed: true
    })

    chai.expect(Logger.config()).to.have.property('collapsed')
      .and.is.true
    Logger.config(backup)
  })

  it('should configure to custom predicate to log', () => {
    const backup = Logger.config()
    Logger.config({
      predicate: sinon.stub().returns(false)
    })

    const shouldLog = Logger.config().predicate({})
    chai.expect(shouldLog).to.be.false
    Logger.config(backup)
  })

  describe('with jsdom', () => {

    beforeEach(() => {
      const dom = new JSDOM('<html></html>')
      global.window = dom.window
      global.document = dom.window.document
      global.Element = dom.window.Element

      sandbox.stub(console, 'log')
      sandbox.stub(console, 'info')
      sandbox.stub(console, 'group')
      sandbox.stub(console, 'groupCollapsed')
      sandbox.stub(console, 'groupEnd')

      Logger.config({
        consoleLog: null,
        consoleInfo: null
      })
    })

    it('should console log', () => {
      const preReduce = Logger.getPreReduce()
      preReduce.output.onValue()
      preReduce.input.push({ action: { id: Date.now() }})

      const consoleLogCalled = console.log.called
      sandbox.restore()
      chai.expect(consoleLogCalled).to.be.true
    })

    it('should console info', () => {
      const preReduce = Logger.getPreReduce()
      preReduce.output.onValue()
      preReduce.input.push({ action: { id: Date.now() }})

      const consoleInfoCalled = console.info.called
      sandbox.restore()
      chai.expect(consoleInfoCalled).to.be.true
    })

    it('should console group', () => {
      const preReduce = Logger.getPreReduce()
      preReduce.output.onValue()
      preReduce.input.push({ action: { id: Date.now() }})

      const consoleGroupCalled = console.group.called
      sandbox.restore()
      chai.expect(consoleGroupCalled).to.be.true
    })

    it('should console groupCollapsed', () => {
      const backup = Logger.config()
      Logger.config({
        collapsed: true
      })

      const preReduce = Logger.getPreReduce()
      preReduce.output.onValue()
      preReduce.input.push({ action: { id: Date.now() }})

      const consoleGroupCollapsedCalled = console.groupCollapsed.called
      sandbox.restore()
      chai.expect(consoleGroupCollapsedCalled).to.be.true
      Logger.config(backup)
    })

    it('should console groupEnd', () => {
      const preReduce = Logger.getPreReduce()
      preReduce.output.onValue()
      preReduce.input.push({ action: { id: Date.now() }})

      const consoleGroupEndCalled = console.groupEnd.called
      sandbox.restore()
      chai.expect(consoleGroupEndCalled).to.be.true
    })

  })

  afterEach(() => {
    sandbox.restore()
  })

})
