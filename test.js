/* import {a as foo} from 'module2.js'; */

import {b as foo} from 'module2.js';
import {c as foo2} from 'module2.js';
import * as foo3 from 'module2.js';

(function() {
}());


var a = 10,
    b = 20;

function c () {
    return 30;
}

export { a, b, c as z };

export default c;
