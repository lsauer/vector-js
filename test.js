var vectorop = require('./vector-js'),
    assert = require('assert');

// Test **vectorop.d2b**
assert.equal( '1111111', vectorop.d2b(127) );
assert.equal('1001001100101100000001011010010', vectorop.d2b(1234567890));

// Test **vectorop.b2d**
assert.equal( 127, vectorop.b2d('1111111') );
assert.equal(1234567890, vectorop.b2d('1001001100101100000001011010010'));

    
// Test **vectorop.Vector**
assert.ok( vectorop.Vector() instanceof vectorop._Vector , 'Vector creation failed: 0 args');
assert.ok( vectorop.Vector(1) instanceof vectorop._Vector , 'Vector creation failed: 1 args');
assert.ok( vectorop.Vector(1,2) instanceof vectorop._Vector , 'Vector creation failed: 2 args');
assert.ok( vectorop.Vector(1,2,3) instanceof vectorop._Vector , 'Vector creation failed: 3 args');
assert.ok( vectorop.Vector(1,2,3,4) instanceof vectorop._Vector , 'Vector creation failed: 4 args');

// Test **vectorop.Vector.sph2cart**
var a = vectorop.Vector.sph2cart(100, -31,32);
assert.equal(true, a.x == 50 && a.y == 22 && a.z == 83, 'vectorop.sph2cart failed.');
assert.equal(true, +a === 5445170, 'vectorop.sph2cart toString failed.');

// Test **vectorop.Vector.cartesian**
//will fail, as only UInt8 coordinates are currently suported
var b = vectorop.Vector.cartesian(100, 31,32);  
assert.equal(true, b.x == 50 && b.y == -22 && b.z == 83, 'vectorop.cartesian failed.');
assert.equal(false,  +a === -5445070, 'vectorop.cartesian toString: wrong point value.');


// Test **vectorop.Vector.max**
var a = vectorop.Vector.max( vectorop.Vector(1,2,3), vectorop.Vector(-4,5,-6));
assert.equal(true, a.x == 1 && a.y == 5 && a.z == 3 );

// Test **vectorop._Vector.max**
var a = vectorop.Vector(1,2,3).max( vectorop.Vector(-4,5,-6) );
assert.equal(true, a.x == 1 && a.y == 5 && a.z == 3 );


// Test **vectorop.Vector.min**
var a = vectorop.Vector.min( vectorop.Vector(1,2,3), vectorop.Vector(-4,5,-6));
assert.equal(true, a.x == -4 && a.y == 2 && a.z == -6 );

// Test **vectorop._Vector.max**
var a = vectorop.Vector(1,2,3).min( vectorop.Vector(-4,5,-6) );
assert.equal(true, a.x == -4 && a.y == 2 && a.z == -6 );


// Test **vectorop.Vector.deg**
var a = vectorop.Vector(100,31,32).deg();
assert.equal(true, a.r === 109.47602477255009 && a.t === 1.2741638253775283 && a.p == 0.3006056700423954 );

// Test **vectorop.Vector.copy**
var a = vectorop.Vector(100,127,3);
assert.equal(true, a.x == 100 && a.y == 127 && a.z == 3 );
var b = a.copy();
assert.equal(true, a.x == b.x && a.y == b.y && a.z == b.y && +a == +b);


// Test **vectorop.Vector.* ** 
var a = new vectorop.Vector(10, 20, 30);
assert.ok(1971210 === +a, 'Vector(10, 20, 30) is OK. ');
assert.equal(5913630, vectorop.Vector(a*3));

// Test **vectorop.Vector. <*>** 
var a = new vectorop.Vector(23, 14, 15);
assert.ok(986647 === +a, 'Vector(10, 20, 30) is OK. ');
assert.equal(5913630, vectorop.Vector(a*3));

// Test **vectorop.Vector. </>** 
var a = new vectorop.Vector(10, 20, 30);
assert.ok(1971210 === +a, 'Vector(10, 20, 30) is OK. ');
a = new vectorop.Vector(a/10);
assert.equal(197121, +a);
assert.equal(a.x == 1 && a.y==2 && a.z == 3, +a);

// the following test will fail as only integer scenarios can be handled
var a = new vectorop.Vector(23, 14, 15);
assert.ok(986647 === +a, 'Vector(23, 14, 15) is OK. ');
var b = new vectorop.Vector(a/2);
assert.ok(493323.5 !== +b, 'Vector floating point division incorrect. ');


// Test **vectorop.Vector.div** 
var b = a.div( new vectorop.Vector(1,2,3));
assert.equal( 329495, +b );
assert.equal(true, b.x == 23 && b.y == 7 && b.z == 5 );

// Test **vectorop.Vector.mul** 
var b = a.mul( new vectorop.Vector(1,2,3) );
assert.equal( 2956311, +b );
assert.equal(true, b.x == 23 && b.y == 28 && b.z == 45 );

// Test **vectorop.Vector.dot** 
var a = new vectorop.Vector(3, 55, 12);
var b = new vectorop.Vector(1, 2, 3);
assert.ok(800515 === +a, 'Vector(3, 55, 12) is OK. ');
assert.equal( 149, +a.dot(b) );

// Test **vectorop.Vector.cross** 
assert.equal( 0, +a.cross(a) );
assert.equal( 0, +b.cross(b) );
assert.equal( 3211891, +b.cross(a) );
assert.equal( -3211891, +a.cross(b) );

// Test **vectorop.Vector.unit** 
var a = new vectorop.Vector(3, 55, 12);
assert.ok(0 !== +a.unit(), 'Unit vector cannot be zero!');
assert.ok(0 !== +vectorop.Vector.unit(a), 'Unit vector cannot be zero!');

// Test **vectorop.Vector.abs**, **vectorop.Vector.len**
assert.equal(109.47602477255009, vectorop.Vector(100,31,32).abs());
assert.equal(109.47602477255009, vectorop.Vector(100,31,32).length);



