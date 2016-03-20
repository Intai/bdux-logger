import chai from 'chai';
import sinon from 'sinon';
import Bacon from 'baconjs';
import * as Logger from './main';

describe('Logger', () => {

  it('should return a pre-reduce pluggable', () => {
    let preReduce = Logger.getPreReduce();

    chai.expect(preReduce).to.have.property('input')
      .that.is.instanceof(Bacon.Observable);
    chai.expect(preReduce).to.have.property('output')
      .that.is.instanceof(Bacon.Observable);
  });

  it('should return a post-reduce pluggable', () => {
    let postReduce = Logger.getPostReduce();

    chai.expect(postReduce).to.have.property('input')
      .that.is.instanceof(Bacon.Observable);
    chai.expect(postReduce).to.have.property('output')
      .that.is.instanceof(Bacon.Observable);
  });

});
