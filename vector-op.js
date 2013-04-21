	// 
	// **vectorop:** 8bit vector arithmetics that emulate simple operator overloading 
	// in JavaScript, as a proof of principle. This script is intended as a tutorial!
	//
	// **@author:** (c) 10/2011 by Lorenz Lo Sauer; lsauer.com  
	// **@license:** MIT-LICENSE or BSD-LICENSE  
	// **@link:** https://www.github.com/lsauer/vectorop/  
	// **@version:** 0.1.0  
	//
	// **Background: **  
	// By default, JS doesn't allow operator overloading but does allow capturing the value-
	// coercion-function `stringTo` and `valueOf`, which converts an object to a primitive value
	// Respectively, `toString` acts in the context of a string coercion/conversion.  
	// If either method returns a non-primitive type, the respective other method is invoked 
	
	// **Note:**  
	// The code is purposefully not geared towards speed (at the gain of readability)
	// for comprehensive matrix and vector functionality use 'glmatrix'  
	// Only minimal Error checking is implemented. No overflow warnings are provided.   
	// Only positive values are supported < 255, i.e. UInt8,
	// otherwise only signed 7bit numbers would be possible
	// In principle any number types could be implemented, by adapting the bit masks and bit allocations.  
	// Due to certain 32bit constraints, the implemented number types are: `positive integer numbers R: -1 < R < 256`
	//
	//
	// **Todo:**  
	// - Allow negative 8bit numbers
	// - Add examples for other operators
	// - Implement a general purpose 'object to 64bit serialization'
	//
	// **See also:**  
	// 
	// - https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Object/valueOf
	// - http://lsauer.com/2011/09/javascript-binary-to-int-hex-decimal.html
	// - https://gist.github.com/lsauer/1582813 - Convert a Vector into a Matrix
	// - https://github.com/toji/gl-matrix - by Brandon Jones
	//
	// Permission is hereby granted, free of charge, to any person obtaining a copy
	// of this software and associated documentation files (the "Software"), to deal
	// in the Software without restriction, including without limitation the rights
	// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	// copies of the Software, and to permit persons to whom the Software is
	// furnished to do so, subject to the following conditions:
	// 
	// *The above copyright notice and this permission notice shall be included in*
	// *all copies or substantial portions of the Software.*
	// 

    // Global containment
    // -----
(function() {
    
    // Module Setup
    // -----
    
    // Define the internal vectorop object
    var vectorop = {};
    
    // Export the vectorop object as either a CommonJS module, or as the global object
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = vectorop;
    } else {
        this.vectorop = vectorop;
    }
    
    // Set the vectorop version
    vectorop.version = '0.1.0';

	/**
	* CONSTANTS
	*/
    
	vectorop.RADIAN = 57.2957795;
	
	/**
	* Utility Functions
	*/
	
    // number utility functions
    // ------------------------

    // `d2b`: Converts a decimal to a binary representation
	//
	// 	@param d {Int} #decimal number
	// 	@return b {String} binary number representation
	vectorop.d2b = function d2b(d){ 
		return d.toString(2); 
	}
	
    // `b2d`: Converts a binary representation to a decimal
	//
	// 	@param d {String} #number in binary representation
	// 	@return d {Int} decimal number representation
	vectorop.b2d = function b2d(d){
		return parseInt(d,2);
	}

    // objects utility functions
    // -------------------------

	// `listToMatrix`: converts a 1D array to a 2D array
	//
	// 	@param a {Array} list of elements
	// 	@param len {Int} number of elements in each row
	// 	@return matrix {[[,..],[,...],...]} 2D array containing matrix elements
	vectorop.listToMatrix = function Array1dTo2d(a, len){
	  var b=[];
	  for(var i=0; i<a.length; i+=len)
		b.push( a.slice(i,i+len) );
	  return b;
	}

	// `matrix`: Converts a linear list of elements into an n x m matrix
	//
	// 	@param alist {Array} linear list of elements 
	// 	@param n {Int} #rows of the matrix
	// 	@param m {Int} #rows of the matrix optional:true; else n=m
	// 	@return matrix {[[,..],[,...],...]} 2D array containing matrix elements
	vectorop.matrix = function matrix(alist,n,m) {
		m||(m = n);
		var mat = []
		for(var i=0,len=n*m;i<len;i+=m)
			mat.push(alist.slice(i,i+m))
		return mat;
	}
	
	// `list`: inverse operation to the function `matrix`: flattens an array
	//
	// 	@param mat {Array} 2D array, representing an n x m matrix
	// 	@return array {Array} 1D array containing vector elements
	vectorop.list = function list(mat){
		return (mat+'')
				.split(',')
				.map(parseFloat);
	}
	

	// `matcmpr`:  compares (non-strictly) two matrices and returns true or false
	//
	// 	@param mat1 {Array} 1st 2d array of n x m matrix elements
	// 	@param mat1 {Array} 2nd 2d array of n x m matrix elements, to be compared to
	// 	@return isEq {Boolean} true is returned in the case of matrix equality
	vectorop.matcmpr = function matcmpr(mat1,mat2){
		if(undefined === mat1[0][0]) {
			mat1 = [mat1]; 
			mat2 = [mat2];
		}
		for(i in mat1)
			for(j in mat1[i])
				if(mat1[i][j] != mat2[i][j])
					return false;
		return true;
	}


	// vector object functions
    // -----------------------

	// *Todo:*

	//	- Dynamic bitsize-allocation per number:
	//	- Implement cutting off the number via `&range|lower`, according to a dynamic bitsize per number
	//  - Alternatively: allow 16bit numbers in the case of 2D vectors

	// *Notes:*
	
	// The shifting operation could be refactored out into toString
	// The Vector object contains the original x,y,z representation
	// The z-value is ignored in a 2D vector, and thus placed beyond the 16bit position
	
	// `_Vector`: packs x,y,z 8bit Integers (<255), into an vector object
	//
	// 	@param x,y,z {Int} 8bit Integers holding coordinate values
	// 	@return point {Int} 32bit/64bit (JS runtime dependent), Integer containing x,y,z.
	vectorop._Vector = function _Vector(x,y,z) {
		var  point;
		// allow passing arguments as an array
		if(x instanceof Array){
				 z = x[2]
				,y = x[1]
				,x = x[0]; //initial array `x` is now unreferenced
		}
		//Todo: allocate sign to Bit 30(x),29(y), 28(z)
		//initialize empty variables, as Integers
		x = (x|0) || 0;
		y = (y|0) || 0;
		z = (z|0) || 0;
		// allow passing arguments as single number i.e. a point?
		// otherwise pack x,y,z values into `point`
		if(x > 255)
			point = x;
		else
			point = (z<< 16) ^ (y<< 8) ^ x;	// overlay ad-hoc-created bitmaps via XOR
		// assign local variables to an instance
		if(this){							//-> for readability:
			 this.z = z						// this.z = z<< 16;
			,this.y = y						// this.y = y<< 8;	
			,this.x = x;					// this.x = x;	
			this.point = point;
		} else {
			return point;
		}
	}
	
	// `Vector`: helper function that returns an Vector instanc
	//
	// 	@param x,y,z {Int} 8bit Integers holding coordinate values
	// 	@return vector {Object} _Vector object containing 8bit 3D coordinates
	vectorop.Vector = function Vector(x,y,z) {
		if(arguments.length > 3){
			return null;
		}
		var vobj = new vectorop._Vector(x,y,z);
			//define attribute-like functions
			vobj.__defineGetter__('length', vectorop._Vector.prototype.len);

		return vobj;
	}
	
	// `isVectorInstance`: helper function that checks if a passed object is a Vector instance and handles errors
	//
	// 	@param v {Object} obejct tested to by an instance of _Vector
	// 	@return state {Boolean} returns true if the object is a _Vector instance
	vectorop.Vector.isVectorInstance = function(v){
		if( ! (v instanceof vectorop._Vector)){
			throw new TypeError("A Vector instance must be passed to:" + arguments.callee);
		}else {
			return true;
		}
	}
		
	// Vector: prototypal functions
    // ---------------------------

	// demonstrate that `valueOf` would get precedence, if defined...
	/*	vectorop._Vector.prototype.valueOf = function() {
	 *		console.log("valueOf was invoked" )
	 *	}
	 */
	
	// `toString`: overloaded function, to pack 8bit x,y,z values into a 32bit number of the vector instance
	//
	// 	@return point {Int} 32bit number containing x,y,z 3D coordinates as 8bit integers	
	// 	The function is mainly invoked through the '+' plus operator acting upon a vector instance
	vectorop.Vector.prototype.toString = function() {
	   var x = this.x << 16;					// each coordinate x,y,z is allocated 8bit, and shifted upwards
	   var y = this.y << 8;
	   var z = this.z;
	   console.log("Vector.toString invoked");
	   return x + y + z;						//return a 32bit number containing x,y,z
	}
	
	// `toString`: overloaded function, to unpack a 32bit number into 8bit x,y,z values of the vector instance
	//
	// 	@param isRetstring {Bool} when set to true, a pretty-printed string is returned rather than a bit-serialized number/point
	// 	@return point {Int} 32bit number containing x,y,z 3D coordinates as 8bit integers
	vectorop._Vector.prototype.toString = function(isRetstring) {
		this.z = (this.point >> 16) &255;			//byte = UInt8; 255 = "11111111" 8bit Bitmask
													//get rid of the upper bits, then shift down:
		this.y = (this.point >>  8) &255;			//alternative: var y = (this.point -= (z << 16)) >> 8;
		this.x = (this.point      ) &255;
		//Todo: read sign from Bit 30(x),29(y), 28(z)
		//read sign-bits put at the front of the 32bits; x being closer to the Most Significant Bit position
		//if( this.point & (1<<30) ){
		//	this.x = -this.x;
		//}
		//if( this.point & (1<<29) ){
		//	this.y = -this.y;
		//}
		//if( this.point & (1<<28) ){
		//	this.z = -this.z;
		//}
		var retstring = '[x: '+this.x+', y: '+this.y+', z: '+this.z+']';
		if( typeof isRetstring !== "undefined" && true === Boolean(isRetstring) ){
			return retstring;
		}else{
			console.log( retstring );
			return this.point;
		}
	}

	// `toArray`: returns an 1d array containing x,y,z cartesian coordinates
	//
	// 	@return array {Array} 1D array containing vector values x,y,z
	vectorop._Vector.prototype.toArray = function(){
		return [ this.x, this.y, this.z ];
	}

	// `mul`: calculates the vector product between the pertaining vector instance and a vector passed as argument
	//
	// 	@param v2 {Vector} second Vector
	// 	@return point {Int} 32bit number containing x,y,z 3D coordinates as 8bit integers
	vectorop._Vector.prototype.mul = function(v2) {
		vectorop.Vector.isVectorInstance(v2);
		return new vectorop.Vector(
			 this.x * v2.x
			,this.y * v2.y
			,this.z * v2.z
		);
	}
	
	// `div`: calculates the division between the pertaining vector instance and a vector passed as argument
	//
	// 	@param v2 {Vector} second Vector
	// 	@return point {Int} 32bit number containing x,y,z 3D coordinates as 8bit integers
	vectorop._Vector.prototype.div = function(v2) {
		vectorop.Vector.isVectorInstance(v2);
		return new vectorop.Vector(
			 this.x / v2.x
			,this.y / v2.y
			,this.z / v2.z
		);
	}

	// `dot`: calculates the dot product between the pertaining vector instance and a vector passed as argument
	//
	// 	@param v2 {Vector} second Vector
	// 	@return point {Int} 32bit number containing x,y,z 3D coordinates as 8bit integers
	vectorop._Vector.prototype.dot = function(v2) {
		vectorop.Vector.isVectorInstance(v2);
		return   this.x * v2.x 
				+this.y * v2.y 
				+this.z * v2.z;
	}

	// `cross`: calculates the cross product between the pertaining vector instance and a vector passed as argument  
	// The cross product can be defined as the determinant of a suitable 3×3 matrix (See: *Sarrus rule*)
	// The cross product is anticommutative, implying negative numbers.
	// Calculating the cross product with the current implementation is possible only in select cases.
	//
	// 	@param v2 {Vector} second Vector
	// 	@return vector {Object} _Vector object containing 8bit 3D coordinates
	vectorop._Vector.prototype.cross = function(v2) {
		vectorop.Vector.isVectorInstance(v2);
		return new vectorop.Vector(
			 this.y * v2.z - this.z * v2.y
			,this.z * v2.x - this.x * v2.z
			,this.x * v2.y - this.y * v2.x
		);
	}

	// `dotcross`: calculates the scalar triple product between the pertaining vector instance and two vector passed as argument  
	// The result of the scalar triple product may be negative and can thus not be handled by the current implementation.   
	// The scalar value can be thought of as the volume V of a parallelepiped, spanned by the three given vector instances 
	//
	// 	@param v2 {Vector} second Vector
	// 	@param v3 {Vector} third Vector
	// 	@return vector {Object} _Vector object containing 8bit 3D coordinates
	vectorop._Vector.prototype.dotcross = function(v2, v3) {
		vectorop.Vector.isVectorInstance(v2);
		vectorop.Vector.isVectorInstance(v3);
		return (v2.cross(v3)).dot(this);
	}

	// `abs`, `length{attr}`, `len`: calculates the magnitude or length of the pertaining vector instance
	//
	// 	@return point {Int} 32bit number containing x,y,z 3D coordinates as 8bit integers
	vectorop._Vector.prototype.abs =
	vectorop._Vector.prototype.len = function() {
		return Math.sqrt( 
			 this.x * this.x 
			+this.y * this.y 
			+this.z * this.z
		);
	}

	// `unit`,`norm`: calculates a normalized or unit vector of the pertaining vector instance and a passed normalization factor
	// Note: By necessity, floating point numbers are required and thus `unit` is incompatible with the current implementation
	//
	// 	@param v2 {Vector|Int} second Vector object or integer value as normalization factor
	// 	@return vector {Object} _Vector object containing normalized 8bit 3D coordinates
	vectorop._Vector.prototype.unit = 
	vectorop._Vector.prototype.norm = function(v2) {
		var len;
		if( v2 instanceof Object && v2.len instanceof Function ){
			len = v2.len();
		} else if(typeof v2 === 'number') {
			len = v2;
		} else{
			// no argument passed: normalize by the own length
			len = this.len();
		}
		return new vectorop.Vector(
		   this.x / len
		  ,this.y / len
		  ,this.z / len
		);
	}

	// `unit`,`norm`: calculates a normalized or unit vector
	//
	// 	@param v1 {Vector} Vector object to be normalized
	// 	@param v2 {Vector|Int} second Vector object or integer value as normalization factor
	// 	@return vector {Object} _Vector object containing normalized 8bit 3D coordinates
	vectorop.Vector.unit = 
	vectorop.Vector.norm = function(v1, v2) {
		var len;
		if( v2 instanceof Object && v2.len instanceof Function ){
			len = v2.len();
		} else if(typeof v2 === 'number') {
			len = v2;
		} else{
			// no argument passed: normalize by the own length
			len = v1.len();
		}
		return new vectorop.Vector(
		   v1.x / len
		  ,v1.y / len
		  ,v1.z / len
		);
	}

	// `unit`,`norm`: copies the pertaining Vector object
	//
	// 	@return vector {Object} _Vector object containing 8bit 3D coordinates
	vectorop._Vector.prototype.copy = function() {
		return new vectorop.Vector(this.x, this.y, this.z);
	}
	
	// `min`: calculates the minimum vector coordinates between two vectors passed as argument
	//
	// 	@param v1 {Vector} first Vector object
	// 	@param v2 {Vector} second Vector object 
	// 	@return vector {Object} _Vector object containing the minimum 8bit 3D coordinates
	vectorop.Vector.min = function(v1, v2) {
		if( ! v1 instanceof vectorop._Vector && ! v2 instanceof vectorop._Vector ){
			throw new TypeError("Two Vector instances must be passed to:" + arguments.callee); 
		}
		return new vectorop.Vector(
			 Math.min(v1.x, v2.x)
			,Math.min(v1.y, v2.y)
			,Math.min(v1.z, v2.z)
		);
	}
	
	// `min`: calculates the minimum vector coordinates of the pertaining v instance and a Vector passed as argument
	//
	// 	@param v1 {Vector} first Vector object
	// 	@param v2 {Vector} second Vector object 
	// 	@return vector {Object} _Vector object containing the minimum 8bit 3D coordinates
	vectorop._Vector.prototype.min = function(v2) {
		vectorop.Vector.isVectorInstance(v2);
		return new vectorop.Vector(
			 Math.min(this.x, v2.x)
			,Math.min(this.y, v2.y)
			,Math.min(this.z, v2.z)
		);
	}

	// `max`: calculates the maximum vector coordinates between two Vectors passed as argument
	//
	// 	@param v1 {Vector} first Vector object
	// 	@param v2 {Vector} second Vector object 
	// 	@return vector {Object} _Vector object containing the maximum 8bit 3D coordinates
	vectorop.Vector.max = function(v1, v2) {
		if( ! v1 instanceof vectorop._Vector && ! v2 instanceof vectorop._Vector ){
			throw new TypeError("Two Vector instances must be passed to:" + arguments.callee); 
		}
		return new vectorop.Vector(
			 Math.max(v1.x, v2.x)
			,Math.max(v1.y, v2.y)
			,Math.max(v1.z, v2.z)
		);
	}
	
	// `max`: calculates the maximum vector coordinates of the pertaining Vector instance and a Vector passed as argument
	//
	// 	@param v1 {Vector} first Vector object
	// 	@param v2 {Vector} second Vector object 
	// 	@return vector {Object} _Vector object containing the maximum 8bit 3D coordinates
	vectorop._Vector.prototype.max = function(v2) {
		vectorop.Vector.isVectorInstance(v2);
		return new vectorop.Vector(
			 Math.max(this.x, v2.x)
			,Math.max(this.y, v2.y)
			,Math.max(this.z, v2.z)
		);
	}

	// `deg`,`spherical`: calculates the spherical values of the pertaining Vector instance, or sets the coordinates when `r,p,t (radius, phi, theta)` is passed
	//
	// 	@param r {Vector} r, the radius or radial distance 
	// 	@param t {Vector} theta, the inclination or polar angle
	// 	@param p {Vector} phi, the azimuth or azimuthal angle
	// 	@return vector {Object} Object containing `r,p,t (radius, phi, theta)` or a Vector containing the 8bit 3D coordinates
	vectorop._Vector.prototype.deg =
	vectorop._Vector.prototype.spherical = function() {
		if( 0 === arguments.length ){
			var len = this.len();
			return {
				 r: len
				,p: Math.atan2(this.y, this.x)		/*theta*/
				,t: Math.acos(this.z / len)			/*phi*/
			}
		} else{
			var  x = r * Math.sin(phi) * Math.cos(the)
				,y = r * Math.sin(phi) * Math.sin(the)
				,z = r * Math.cos(phi);
			
			this.point = (z<< 16) ^ (y<< 8) ^ x;	// update the coordinates of the vector instance
			return new vectorop.Vector(x,y,z);
		}
	}
	

	// `sph2cart`,`fromSpherical`:  calculates the carthesian coordinate values `x,y,z` of the spherical coordinates passed as `r,p,t (radius, phi, theta)`
	//
	// 	@param r {Vector} r, the radius or radial distance 
	// 	@param t {Vector} theta, the inclination or polar angle
	// 	@param p {Vector} phi, the azimuth or azimuthal angle
	// 	@return vector {Object} _Vector object containing the maximum 8bit 3D coordinates
	vectorop.Vector.sph2cart = 
	vectorop.Vector.cartesian = function(r, phi, the) {
		return new vectorop.Vector(
			 r * Math.sin(phi) * Math.cos(the)
			,r * Math.sin(phi) * Math.sin(the)
			,r * Math.cos(phi)
		);
	}
 
	// `rot`: rotates the pertaining vector instance given the specified rotation angles of each axis   
	// See: http://stackoverflow.com/questions/5081842/3d-z-y-x-rotation-of-vector
	//
	// 	@param degx {Int} angle of rotation around the x-axis
	// 	@param degy {Int} angle of rotation around the y-axis
	// 	@param degz {Int} angle of rotation around the z-axis
	// 	@return vector {Object} _Vector object containing 8bit 3D coordinates
	vectorop._Vector.prototype.rot = function(degx,degy,degz) {
		//Not implemented due to the current lack of floting number support
		return null;
	}

})();
