
import * as chai from 'chai';
import * as spies from 'chai-spies';
import * as promised from 'chai-as-promised';
import { expect } from 'chai';
import { combineExecutors } from '../src/index';

chai.use(spies);
chai.use(promised);

describe('combineExecutors', () => {
  it('should export combineExecutors function', () => {
    expect(combineExecutors).to.be.function;
  });

  it('should return valid executor for combination of two executors', () => {
    function executorResolved() {
      return Promise.resolve();
    }

    function executorRejected() {
      return Promise.reject(new Error());
    }

    function executorVoid() {
    }

    const executorABC = combineExecutors({
      a: executorResolved,
      b: executorResolved,
      c: executorVoid
    });

    expect(executorABC).to.be.function;
    let promiseABC: Promise<void> = executorABC({ type: 'FOO()' }, () => {}, {}) as Promise<void>;

    let thenSpy = chai.spy();
    let catchSpy = chai.spy();

    expect(promiseABC).to.exist;
    expect(promiseABC.then).to.be.function;
    expect(promiseABC.catch).to.be.function;

    expect(promiseABC).to.be.fulfilled;
    expect(promiseABC).to.become(undefined);
  });

  it('should return executor that rejects on children reject', () => {
    function executorResolved() {
      return Promise.resolve();
    }

    function executorRejected() {
      return Promise.reject(new Error());
    }

    function executorVoid() {
    }

    const executorABC = combineExecutors({
      a: executorResolved,
      b: executorRejected,
      c: executorVoid
    });

    expect(executorABC).to.be.function;
    let promise: Promise<void> = executorABC({ type: 'FOO()' }, () => {}, {}) as Promise<void>;

    expect(promise).to.exist;
    expect(promise.then).to.be.function;
    expect(promise.catch).to.be.function;

    expect(promise).to.be.rejected;
  });

  it('should pass sub-state to sub-executors', () => {
    const state = {
      a: 'foo',
      b: 'bar'
    };
    const executorA = chai.spy();
    const executorB = chai.spy();
    const dispatch = chai.spy();

    const executorAB = combineExecutors({
      a: executorA,
      b: executorB
    });

    executorAB({ type: 'FOO()' }, dispatch, state);
    expect(executorA).to.have.been.called.with({ type: 'FOO()' }, dispatch, state.a);
    expect(executorB).to.have.been.called.with({ type: 'FOO()' }, dispatch, state.b);
  });
  it('should pass sub-state to sub-executors for undefined state', () => {
    const executorA = chai.spy();
    const executorB = chai.spy();
    const dispatch = chai.spy();

    const executorAB = combineExecutors({
      a: executorA,
      b: executorB
    });

    executorAB({ type: 'FOO()' }, dispatch, undefined);
    expect(executorA).to.have.been.called.with({ type: 'FOO()' }, dispatch, undefined);
    expect(executorB).to.have.been.called.with({ type: 'FOO()' }, dispatch, undefined);
  });
  //
  // it('should throw an exception for call with invalid argument', () => {
  //   expect(() => { (reduceExecutors as any)({ 'foo': 'bar' }); }).to.throw(Error);
  //   expect(() => { (reduceExecutors as any)([function() {}, undefined]); }).to.throw(Error);
  // });
});
