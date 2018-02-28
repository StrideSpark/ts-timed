/**
 * Created by meganschoendorf on 11/22/16.
 */
import { assert } from 'chai';
import { timed, timedAsync, timedAsyncWithTags } from '../src/index';

let className: string;
let functionName: string;
let duration: number;
let tags: Object;

class TestClass {
    @timedAsync(timedFunction)
    async foo() {
        return 3;
    }

    @timedAsyncWithTags(timedFunctionWithTags, { category: 'cat' })
    async fooTags() {
        return 3;
    }

    @timed(timedFunction)
    foo2() {
        return 'foo2';
    }
}

class ErrorClass {
    @timedAsync(errorFunction)
    async foo() {
        return 5;
    }

    @timed(errorFunction)
    bar() {
        return 'bar';
    }

    @timed(5 as any)
    notAFunc() {
        return 'notAFunc';
    }

    @timedAsync(undefined as any)
    async notAFuncAsync() {
        return 'notAFuncAsync';
    }

    @timedAsyncWithTags(errorFunction, { category: 'cat' })
    async fooTags() {
        return 3;
    }
}

async function timedFunction(a: string, b: string, c: number) {
    className = a;
    functionName = b;
    duration = c;
}

async function timedFunctionWithTags(a: string, b: string, c: number, tag: object) {
    className = a;
    functionName = b;
    duration = c;
    tags = tag;
}

async function errorFunction(_a: string, _b: string, _c: number) {
    throw new Error('I was set up to fail from the start');
}

describe('test', function() {
    it('timed async', async function() {
        const testClass = new TestClass();
        assert.equal(await testClass.foo(), 3);
        assert.equal(className, 'TestClass');
        assert.equal(functionName, 'foo');
        assert.approximately(duration, 2, 2);
    });

    it('timed async with tags', async function() {
        const testClass = new TestClass();
        assert.equal(await testClass.fooTags(), 3);
        assert.equal(className, 'TestClass');
        assert.equal(functionName, 'fooTags');
        assert.approximately(duration, 2, 2);
        assert.deepEqual(tags, { category: 'cat' });
    });

    it('timed', function() {
        const testClass = new TestClass();
        assert.equal(testClass.foo2(), 'foo2');
        assert.equal(className, 'TestClass');
        assert.equal(functionName, 'foo2');
        assert.approximately(duration, 2, 2);
    });

    describe('errors', function() {
        it('timed async errors', async function() {
            const errorClass = new ErrorClass();
            errorClass.foo.apply({}, {});
            errorClass.notAFuncAsync.apply({}, {});
            assert.equal(await errorClass.foo(), 5);
            assert.equal(await errorClass.notAFuncAsync(), 'notAFuncAsync');
        });

        it('timed async with tags errors', async function() {
            const errorClass = new ErrorClass();
            errorClass.fooTags.apply({}, {});
            assert.equal(await errorClass.fooTags(), 3);
        });

        it('timed errors', function() {
            const errorClass = new ErrorClass();
            assert.equal(errorClass.bar(), 'bar');
            assert.equal(errorClass.notAFunc(), 'notAFunc');
        });
    });

    describe('disable works', function() {
        before(function() {
            process.env.DISABLE_TS_TIMED = 'true';
            className = 'not set';
            functionName = 'not set';
            duration = -1;
            tags = {};
        });
        after(function() {
            process.env.DISABLE_TS_TIMED = undefined;
        });
        it('timed async', async function() {
            const testClass = new TestClass();
            assert.equal(await testClass.foo(), 3);
            assert.equal(className, 'not set');
            assert.equal(functionName, 'not set');
            assert.equal(duration, -1);
        });

        it('timed async with tags', async function() {
            const testClass = new TestClass();
            assert.equal(await testClass.fooTags(), 3);
            assert.equal(className, 'not set');
            assert.equal(functionName, 'not set');
            assert.equal(duration, -1);
            assert.deepEqual(tags, {});
        });

        it('timed', function() {
            const testClass = new TestClass();
            assert.equal(testClass.foo2(), 'foo2');
            assert.equal(className, 'not set');
            assert.equal(functionName, 'not set');
            assert.equal(duration, -1);
        });
    });
});
