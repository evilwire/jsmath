/**
 * Author: GlassFin
 *   Date: 06/20/2010
 *  
 * Collection of classes for handling matrix multiplication,
 * and vector operations. You'll see.
 * 
 * Please feel free to optimize: the classes are defined with 
 * private variables either declared at the top of the class, 
 * or indicated with comments. It's not the most elegantly 
 * written, so improvements are welcome; just please let me
 * know what has been done.
 *
 * A word about matrix multiplication: I didn't implement the
 * Strassen because I intended the Matrix class to be used for
 * "small" matrices (e.g. ones used in graphics and comp geo).
 * If you find it difficult to swallow, you may wish to add to
 * it; the cut-off for HTML is about n = 20, and at some point
 * you can a description of the Strassen written in C, from
 * which you can surely extract the algorithm for javascript.
 * 
 */

/** _MEX - Static Class Extends the Math functionalities to 
 *  include Matrix and Vector operations.
 *  
 */
var _MEX = window._MEX =
{
   /** scale - scales an array of numbers by a fixed constant.
    * @param arr - expects <Array> of numbers
    * @param s - expects a number
    * @returns - a different <Array> of numbers, each entry
    *   scaled by [s], preserving the order of the entries.
    *   Empty lists return empty lists.
    */
   scale :
function (arr, s) 
{
   // the wrong way to do it: use a function determination
   // on map, and re-implement when all goes wrong.

   // why is this necessary?
   if(!arr.map)
   {
      var newArr = new Array();
      for(var i = 0; i < arr.length; i++) 
      {
	 newArr.push(arr[i] * s);
      }
      return newArr; 
   }

   // for all the nuts out there who wants one-liners
   // ...and for all the map enthusiasts
   return arr.map(function(elt){ elt * s; });
},
   
   /** Matrix - class for a Matrix
    * 
    * @constructor - takes a row number, a column number, and an
    *   array of rows (each expected to be of the same length)
    *
    * @param nR - expects number, represents the number of rows
    * @param nC - expects number, represents the number of columns
    * @param rows - expects <Array>, each element a row of the 
    *   matrix
    * 
    * @note - this is not a true immutable class - you can still
    *   access the entries of rows (take note!) and a potential
    *   place for error: will fix at some point.
    */
   Matrix : 
function (nR, nC, rows)
{
   // error checking, can remove if assume that
   // that the inputs are sanitized.
   if(rows.length != nR)
      return null;

   // checks the first row: not a great check
   if(rows[0].length != nC)
      return null;

   // @private rows - <Array> represents the rows
   // @private cols - <Array> represents the columns
   var cols = new Array();
   
   // populate the columns
   for(var j = 0; j < nC; j++)
   {
      var curCol = new Array();
      for(var i = 0; i < nR; i++)
      {
	 curCol.push((rows[i])[j]);
      }
      cols.push(curCol);
   }

   /** Entry - takes a row number and a column number and return
    **   the entry corresponding to the row and column number. If
    **   either column number or row number is unspecified, 
    **   returns the row and column respectively as specified.
    *
    * @param row - expects a number between 0 and nR - 1, 
    *    specifies the row number
    * @param col - expects a number between 0 and nC - 1,
    *    specifies the column number
    *
    * @returns - the entry (a number) when both row and column are
    *    specifies, the row (an <Array>) when only the row number
    *    is given, the column (an <Array>) when only the column number
    *    is given.
    *
    * @example -
    *    var m1 = new _MEX.Matrix([[1, 0],
    *                         [0, 1]]);
    *    var r0 = m1.Entry(0);            // returns the first row
    *                                     // can also do m1.Entry(0, undefined);
    *    var c1 = m1.Entry(undefined, 1); // returns the second column
    *
    *    alert(r0);                       // expects "1, 0"
    *    alert(c1);			  // expects "0, 1"
    */
   this.Entry = function(row, col)
   {
      if(row === undefined)
      {
	 if(col === undefined) return rows.slice(0); 

	 return cols[col].slice(0);
      }

      if(col === undefined) return rows[row].slice(0);

      return (rows[row])[col];
   }
   
   /** Scale - takes a number, and returns a new <Matrix> with 
    **   each entry scaled. 
    *
    * @param s - expects a number, the constant that the Matrix
    *    is scaled by.
    *
    * @returns - a new <Matrix> with each entry scaled by [s].
    */
   this.Scale = function(s)
   {
      var rArr = new Array();
      for(var i = 0; i < rows.length; i++)
      {
	 rArr.push(scale(rows[i], s));
      }
      return new _MEX.Matrix(nR, nC, rArr);
      /* <---- dd here
      // replace if you were dying reading the above
      return new Matrix(nR, nC,
	 rows.map(function(r){ scale(r, s); }));
      and dd here ----> */
   }

   /** GetRowNum - returns the number of row in the <Matrix>
    */
   this.GetRowNum = function(){ return nR; };

   /** GetColNum - returns the number of columns in the <Matrix>
    */
   this.GetColNum = function(){ return nC; };

   /** Multiply - if the input is a <Vector>, then returns a new
    **   <Vector> that is equal to the product of this matrix on
    **   the LEFT with the input.
    **
    **   If the input is a <Matrix>, then eturns a new <Matrix> 
    **   that is equal to the product of this matrix on the LEFT
    **   with the input.
    **
    **   For all multiplication, the element that invokes the
    **   method multiplies the argument on the LEFT.
    *
    * @param mat - expects <Vector> or <Matrix>, the element to be 
    *    multiplied (on the left) by this matrix. If the product
    *    is invalid (i.e. if the dimension of the <Vector> or
    *    <Matrix>) is invalid), then will return [null]
    * 
    * @returns - a <Vector> if the input is a <Vector> or <Matrix>
    *    if the input is a <Matrix> equal to the product of this
    *    Matrix (on the left) with the argument, except if the
    *    input is invalid (see #param mat#)
    */
   this.Multiply = function(mat)
   {
      // declare a private function: inner product of two Arrays, treating
      // each as a vector
      var dot = function(row, col)
      {
	 // self-explanatory
	 var sum = 0;
	 for(var j = 0; j < row.length; j++)
	 {
	    sum += row[j] * col[j]; 
	 }
	 return sum;
      };

      // tests to see if the input is a Vector by seeing if it has
      // the Vector.Dot functionality
      if(mat.Dot)
      {
	 // checks to see if the dimension work out
	 if(mat.Length() != nC)
	    return null;

	 var col = new Array();
	 for(var i = 0; i < nR; i++)
	 {
	    col.push(dot(rows[i], mat.Entry()));
	 }

	 return new _MEX.Vector(col);
      }

      // now handle a matrix
      // check the dimension
      if(mat.GetRowNum && (nC != mat.GetRowNum()))
	 return null;

      // construct an Array for rows
      var pRows = new Array();

      // Matrix multiplication: ith row with the jth column gives
      // the (i,j)-entry of the new matrix
      for(var j = 0; j < nR; j++)
      {
	 var row = new Array(); 
	 for(var i = 0; i < mat.GetColNum(); i++)
	 {
	    row.push(dot(rows[j], mat.Entry(undefined,i)));
	 }
	 pRows.push(row);
      }
      return new _MEX.Matrix(nR, mat.GetColNum(), pRows);
   }
},

/** Vector - nth dimensional vector of NUMBERS. If you are
 **   thinking about the C++ vector class, use <Array> instead.
 * 
 * @constructor - takes an <Array> holding the entries of the 
 *    element. The order that the entries occur in the <Array>
 *    will represent the order that the entries occur in the
 *    <Vector>.
 *
 * @param entries - expects <Array>, holding the entries of
 *    the <Vector>. Whether or not the <Array> contain empty
 *    entries is not checked, and will definitely break codes.
 *    If you are concerned, check!
 *   
 * @note - I think it is completely immutable class. (o: A bit
 *    tough on processing time. If you want to make it pseudo-
 *    mutable, remove all the 'slice(0)'s.
 */
   Vector :
function (entries)
{ 
   entries = entries.slice(0);

   /** Length - returns the dimension of the <Vector>.
    */
   this.Length = function()
   {
      return entries.length;
   }

   /** Entry - returns a specific entry if the index is given, or
    **   an <Array> holding the entries of the <Vector>
    *
    * @param index - expects a number between 0 and one less than 
    *    the size of the <Vector>, specifying the entry.
    *
    * @returns - the entry associated with the [index], or if the
    *    index is not specified, returns an <Array> containing all
    *    the entries in the order that they occur in the <Vector>
    */
   this.Entry = function(index)
   {
      if(index === undefined)
	 return entries.slice(0);

      if(index > entries.length) return null;

      return entries[index];
   }
  
   /** Dot - returns a number equal to the dot product of this
    **   <Vector> with the argument. If the argument is of the
    **   wrong dimension (i.e. a <Vector> with different length)
    * 
    * @param v - expects a <Vector> equal in length with this
    *    element
    * @returns - a number equal to the dot product of this
    *    element with the argument [v] if [v] has the same
    *    dimension as this element. Otherwise, it returns [NaN].
    */
   this.Dot = function(v)
   {
      if(v.Length() != this.Length())
	 return NaN;

      var sum = 0;
      var ve = v.Entry();

      // should mat the dot function more public and replace
      // this bit with that
      for(var i = 0; i < ve.length; i++)
      {
	 sum += (this.Entry(i) * ve[i]);
      }
      return sum;
   }

   /** Scale - returns a <Vector> whose entries are scaled by a 
    **   number.
    *
    * @param s - expects a number, the scalar with which each
    *    entry will be multiplied.
    *
    * @returns - a new <Vector> with each entry scaled by [s]. 
    */
   this.Scale = function(s)
   {
      return new _MEX.Vector(scale(this.Entry(), s)); 
   }

   /** Add - returns a new <Vector> whose entries are equal to
    **   the co-ordinate sum of this <Vector> and the argument.
    **   However, if the dimension of the argument is not correct, 
    **   then the method will return [null].
    * 
    * @param v - expects a <Vector> of the same dimension, the
    *    vector that will be added to this element.
    *
    * @returns - a new <Vector> equal to the vector sum of this
    *    element with [v].
    */
   this.Add = function(v)
   {
      if(v.Length() != this.Length()) 
	 return null;

      var newArr = new Array();
      for(var i = 0; i < this.Length(); i++)
      {
	 newArr.push(this.Entry(i) + v.Entry(i));
      }
      return new _MEX.Vector(newArr);      
   }

   /** Sub - returns a new <Vector> equal to this element 
    **   subtracted the argument, or [null] if the dimension
    **   don't match up.
    *
    *  @param v - the <Vector> that will subtract from
    *    this element.
    *  @returns - this - [v] if [v] has the same dimension;
    *    [null] otherwise.
    */
   this.Sub = function(v)
   {
      return this.Add(v.Scale(-1));
   }

   /** NormSq - returns the square of the norm of this Vector.
    *
    * @returns - the square of the normal of this Vector.
    */
   this.Norm = function()
   {
      return this.Dot(this);
   }
}

//////////////////////////////////////////////////////////
};
