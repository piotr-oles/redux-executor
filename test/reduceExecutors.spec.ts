
import * as chai from 'chai';
import * as spies from 'chai-spies';
import { expect } from 'chai';
import { reduceExecutors } from '../src/index';

chai.use(spies);

describe('reduceExecutors', () => {
  it('should export reduceExecutors function', () => {
    expect(reduceExecutors).to.be.function;
  });

  it('should return valid executor for reduction of two executors', () => {
    let promiseAResolve, promiseAReject;
    let promiseBResolve, promiseBReject;

    function executorA() {
      return new Promise<void>((resolve, reject) => { promiseAResolve = resolve; promiseAReject = reject; });
    }

    function executorB() {
      return new Promise<void>((resolve, reject) => { promiseBResolve = resolve; promiseBReject = reject; });
    }

    const executorAB = reduceExecutors(executorA, executorB);

    expect(executorAB).to.be.function;
    let promise = executorAB({ type: 'FOO()' }, () => {}, {});

    let thenSpy = chai.spy();
    let catchSpy = chai.spy();

    expect(promise).to.exist;
    expect((promise as Promise<void>).then).to.be.function;
    expect((promise as Promise<void>).catch).to.be.function;

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

  it('should return executor that rejects on children reject', () => {
    let promiseAResolve, promiseAReject;
    let promiseBResolve, promiseBReject;

    function executorA() {
      return new Promise<void>((resolve, reject) => { promiseAResolve = resolve; promiseAReject = reject; });
    }

    function executorB() {
      return new Promise<void>((resolve, reject) => { promiseBResolve = resolve; promiseBReject = reject; });
    }

    const executorAB = reduceExecutors(executorA, executorB);

    expect(executorAB).to.be.function;
    let promise = executorAB({ type: 'FOO()' }, () => {}, {});

    let thenSpy = chai.spy();
    let catchSpy = chai.spy();

    expect(promise).to.exist;
    expect((promise as Promise<void>).then).to.be.function;
    expect((promise as Promise<void>).catch).to.be.function;

    (promise as Promise<void>).then(thenSpy).catch(catchSpy);

    // check promises combination
    expect(thenSpy).to.not.have.been.called;
    expect(catchSpy).to.not.have.been.called;

    promiseAReject();

    expect(thenSpy).to.not.have.been.called;
    expect(catchSpy).to.have.been.called;
  });

  it('should throw an exception for call with invalid argument', () => {
    expect(() => { (reduceExecutors as any)({ 'foo': 'bar' }); }).to.throw(Error);
    expect(() => { (reduceExecutors as any)([function() {}, undefined]); }).to.throw(Error);
  });
});
