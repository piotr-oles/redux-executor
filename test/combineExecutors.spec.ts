
import * as chai from 'chai';
import * as promised from 'chai-as-promised';
import * as spies from 'chai-spies';
import { assert, expect } from 'chai';
import { combineExecutors } from '../src/index';

chai.use(promised);
chai.use(spies);

describe('combineExecutors', () => {
  it('should export combineExecutors function', () => {
    assert.isFunction(combineExecutors);
  });

  it('should return valid executor for combination of two executors', () => {
    let promiseAResolve, promiseAReject;
    let promiseBResolve, promiseBReject;

    function executorA() {
      return new Promise<void>((resolve, reject) => { promiseAResolve = resolve; promiseAReject = reject; });
    }

    function executorB() {
      return new Promise<void>((resolve, reject) => { promiseBResolve = resolve; promiseBReject = reject; });
    }

    const executorAB = combineExecutors(executorA, executorB);

    assert.isFunction(executorAB);
    let promise = executorAB({}, { type: 'FOO', command: true }, () => {});

    let thenSpy = chai.spy();
    let catchSpy = chai.spy();

    assert.isDefined(promise);
    assert.isFunction((promise as Promise<void>).then);
    assert.isFunction((promise as Promise<void>).catch);

    (promise as Promise<void>).then(thenSpy).catch(catchSpy);

    // check promises combination
    expect(thenSpy).to.not.have.been.called;
    expect(catchSpy).to.not.have.been.called;

    promiseAResolve();

    expect(thenSpy).to.not.have.been.called;
    expect(catchSpy).to.not.have.been.called;

    promiseBResolve();

    expect(thenSpy).to.have.been.called;
    expect(catchSpy).to.have.been.called;
  });

  it('should throw an exception for call with invalid argument', () => {
    assert.throws(() => { (combineExecutors as any)({ 'foo': 'bar' }); }, Error);
    assert.throws(() => { (combineExecutors as any)([function() {}, undefined]); }, Error);
  });
});
