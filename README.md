vector-js
=========

**vector-op.js** is a small module to facilitate limited 3D vector arithmetics based on unsigned 8 bit integers (`UInt8`).
The module emulates operator overloading in JavaScript and show its limitations in the context of an included tutorial and well documented sources.  


Check out the [documentation](https://github.com/lsauer/vector-js/vector-op.html) to learn more about using and 
extending *vector-js*

## Demo

There are several demonstrations of how to use vector.js in the tutorial section of *vector-js*.  
You can find these demos [here](http://lsauer.github.com/vector-js/index.html#demo)

## Authors

*vector-js* was written by [@sauerlo](http://lsauer.com)

## Building

No building steps are required. You can either download the repository from github, or use the [npm packager](https://npmjs.org/ ""):

    sudo npm install -g vector-js
    
If you run a windows command line with administrator priviledges no `sudo` prefix is required.
You can check if the package installed properly
    
```npm list -g```

To get started include `vector-op.js` in your web-site as follows, and exchange `res/js/` with the respective path of your file.

    <script type="text/javascript" src="res/js/vector-op.js"></script>

If you use *node.js* and `require` you can include the file via:

    var vectorop = require('./vector-js')

## Examples

- determine the maximum value for the *left bitshift* operation:
 ```javascript
    vectorop.d2b(1 << 31)
    //> "-10000000000000000000000000000000"



    vectorop.d2b(1 << 32)
    //> "1"
    vectorop.d2b(1 << 33%32)
    //> "10"
    vectorop.d2b(1 << 33%32) === vectorop.d2b(1 << 33)
    //> true
```

- creating a new vector
 ```javascript
    a=new vectorop.Vector(4, 10, 100)
    +a   //invoke a.toString();
    //> [x: 4, y: 10, z: 100]
    //> 6556164


- performing basic vector arithmetics

 ```javascript
    var a = vectorop.Vector(0, 3, 0);
    var b = vectorop.Vector(2, 0, 1);
    var c = vectorop.Vector(1, 0, 1);
    var d = vectorop.Vector(a + b - c);
    +d
    //> [x: 1, y: 3, z: 0]
    
    var scalarf = 1.3;
    var e = vectorop.Vector(d * scalarf);
    delete e; // delete the vector instance 'e'
    
    var a = new vectorop.Vector(10, 20, 30);
    var b = new vectorop.Vector(a/10);
    +b
    //> [x: 1, y: 2, z: 3]
    
 ```

- cross and dot product

 ```javascript
    var a = new vectorop.Vector(3, 55, 12);
    var b = new vectorop.Vector(1, 2, 3);
    +a.dot(b)
    //> 149
    +a.cross(a)
    //> 0        //fails due to UInt8-type constraints
    +b.cross(a)
    //> [x: 115, y: 2, z: 49]
    //> 3211891
 ```


## License

*vectorop.js* is released under the MIT license.

## See also

 - [MDN valueOf](https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Object/valueOf "") 
 - [JS Binary to Int, Hex, Decimal](http://lsauer.com/2011/09/javascript-binary-to-int-hex-decimal.html "")
 - [Vector to Matrix conversion](https://gist.github.com/lsauer/1582813 "")
