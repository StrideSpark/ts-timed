/**
 * Created by meganschoendorf on 11/22/16.
 */
import { assert } from 'chai';
import { timed, timedAsync } from '../src/index';

let className: string;
let functionName: string;
let duration: number;

class TestClass {
    @timedAsync(timedFunction)
    async foo() {
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
}

async function timedFunction(a: string, b: string, c: number) {
    className = a;
    functionName = b;
    duration = c;
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

    it('timed', function() {
        const testClass = new TestClass();
        assert.equal(testClass.foo2(), 'foo2');
        assert.equal(className, 'TestClass');
        assert.equal(functionName, 'foo2');
        assert.approximately(duration, 2, 2);
    });

    it('timed async errors', async function() {
        const errorClass = new ErrorClass();
        assert.equal(await errorClass.foo(), 5);
    });

    it('timed errors', function() {
        const errorClass = new ErrorClass();
        assert.equal(errorClass.bar(), 'bar');
    });
});
