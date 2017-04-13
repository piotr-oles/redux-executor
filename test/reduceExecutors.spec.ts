
import * as chai from 'chai';
import * as spies from 'chai-spies';
import * as promised from 'chai-as-promised';
import { expect } from 'chai';
import { reduceExecutors } from '../src/index';

chai.use(spies);
chai.use(promised);

describe('reduceExecutors', () => {
  let executorResolved, executorRejected, executorVoid;
  let dumbDispatch, dumbGetState;

  beforeEach(() => {
    executorResolved = () => Promise.resolve();
    executorRejected = () => Promise.reject(new Error());
    executorVoid = () => undefined;

    dumbDispatch = () => undefined;
    dumbGetState = () => ({})
  });

  it('should export reduceExecutors function', () => {
    expect(reduceExecutors).to.be.function;
  });

  it('should return valid executor for reduction of two executors', () => {
    const executor = reduceExecutors(executorResolved, executorVoid);

    expect(executor).to.be.function;
    let promise: Promise<void> = executor({ type: 'FOO()' }, dumbDispatch, dumbGetState) as Promise<void>;

    expect(promise).to.exist;
    expect(promise.then).to.be.function;
    expect(promise.catch).to.be.function;

    expect(promise).to.be.fulfilled;
    expect(promise).to.become(undefined);
  });

  it('should return executor that rejects on children reject', () => {
    const executor = reduceExecutors(executorResolved, executorRejected, executorVoid);

    expect(executor).to.be.function;
    let promise: Promise<void> = executor({ type: 'FOO()' }, dumbDispatch, dumbGetState) as Promise<void>;

    expect(promise).to.exist;
    expect(promise.then).to.be.function;
    expect(promise.catch).to.be.function;

    expect(promise).to.be.rejected;
  });

  it('should throw an exception for call with invalid argument', () => {
    expect(() => { (reduceExecutors as any)(undefined); }).to.throw(Error);
    expect(() => { (reduceExecutors as any)({ 'foo': 'bar' }); }).to.throw(Error);
    expect(() => { (reduceExecutors as any)([function() {}, undefined]); }).to.throw(Error);
  });
});
