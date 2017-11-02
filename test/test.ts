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
    async foo() {}

    @timed(timedFunction)
    foo2() {}
}

async function timedFunction(a: string, b: string, c: number) {
    className = a;
    functionName = b;
    duration = c;
}

describe('test', function() {
    it('timed async', async function() {
        const testClass = new TestClass();
        await testClass.foo();
        assert.equal(className, 'TestClass');
        assert.equal(functionName, 'foo');
        assert.approximately(duration, 2, 2);
    });

    it('timed', async function() {
        const testClass = new TestClass();
        testClass.foo2();
        assert.equal(className, 'TestClass');
        assert.equal(functionName, 'foo2');
        assert.approximately(duration, 2, 2);
    });
});
