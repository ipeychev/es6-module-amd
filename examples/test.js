import {a,b} from 'module2.js';
import {jquery} from 'https://code.jquery.com/jquery-2.1.3.min.js';
import {d as foo2} from 'sub1/sub1.js';

var e = 10,
    f = 20;

function c () {
    return 30;
}

let empty = () => {};

(() => "foobar")() // returns "foobar"

var simple = a => a > 15 ? 15 : a;
simple(16); // 15
simple(10); // 10

var complex = (a, b) => {
    if (a > b) {
        return a;
    } else {
        return b;
    }
}

export { e, f as z };

export default c;