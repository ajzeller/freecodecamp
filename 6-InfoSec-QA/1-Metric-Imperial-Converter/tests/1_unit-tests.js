/*
*
*
*       FILL IN EACH UNIT TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]----
*       (if additional are added, keep them at the very end!)
*/

const chai = require('chai');
const assert = chai.assert;

// get convert handler constructor
const ConvertHandler = require('../controllers/convertHandler.js');

// make a new instance of convert handler
const convertHandler = new ConvertHandler();

suite('Unit Tests', function(){
  
  suite('Function convertHandler.getNum(input)', function() {
    
    test('Whole number input', function(done) {
      const input = '32L';
      assert.equal(convertHandler.getNum(input), 32);
      done();
    });
    
    test('Decimal Input', function(done) {
      const input = '0.99L'
      assert.equal(convertHandler.getNum(input), 0.99)
      done();
    });
    
    test('Fractional Input', function(done) {
      const input = '1/2gal'
      assert.equal(convertHandler.getNum(input), '0.50000')
      done();
    });
    
    test('Fractional Input w/ Decimal', function(done) {
      const input = '1.2/2gal'
      assert.equal(convertHandler.getNum(input), '0.60000')
      done();
    });
    
    test('Invalid Input (double fraction)', function(done) {
      const input = '1/2/3mi'
      assert.equal(convertHandler.getNum(input), 'invalid number')
      done();
    });
    
    test('No Numerical Input', function(done) {
      const input = 'gal'
      assert.equal(convertHandler.getNum(input), 1)
      done();
    }); 
    
  });
  
  suite('Function convertHandler.getUnit(input)', function() {
    
    test('For Each Valid Unit Inputs', function(done) {
      const input = ['gal','l','mi','km','lbs','kg','GAL','L','MI','KM','LBS','KG'];
      
      const expected = ['gal','L','mi','km','lbs','kg','gal','L','mi','km','lbs','kg',]
      
      input.forEach(function(ele, i) {
        assert.equal(convertHandler.getUnit(ele), expected[i], `${ele} failed`)
      });
      done();
    });
    
    test('Unknown Unit Input', function(done) {
      const input = '1.5jiffy'
      assert.equal(convertHandler.getUnit(input), 'invalid unit')
      done();
    });  
    
  });
  
  suite('Function convertHandler.getReturnUnit(initUnit)', function() {
    
    test('For Each Valid Unit Inputs', function(done) {
      const input = ['gal','l','mi','km','lbs','kg'];
      const expect = ['l','gal','km','mi','kg','lbs'];
      input.forEach(function(ele, i) {
        assert.equal(convertHandler.getReturnUnit(ele), expect[i]);
      });
      done();
    });
    
  });  
  
  suite('Function convertHandler.spellOutUnit(unit)', function() {
    
    test('For Each Valid Unit Inputs', function(done) {
      //see above example for hint
      const input = ['gal','l','mi','km','lbs','kg']
      const expect = ['gallon','liter','mile','kilometer','pound','kilogram']
      input.forEach((ele, i) => {
        assert.equal(convertHandler.spellOutUnit(ele), expect[i])
      })
      done();
    });
    
  });
  
  suite('Function convertHandler.convert(num, unit)', function() {
    
    test('Gal to L', function(done) {
      var input = [5, 'gal'];
      var expected = 18.9271;
      assert.approximately(convertHandler.convert(input[0],input[1]),expected,0.1); //0.1 tolerance
      done();
    });
    
    test('L to Gal', function(done) {
      const input = [4, 'L']
      const expected = 1.05669
      assert.approximately(convertHandler.convert(input[0],input[1]), expected, 0.1)
      done();
    });
    
    test('Mi to Km', function(done) {
      const input = [2.5, 'mi']
      const expected = 4.02336
      assert.approximately(convertHandler.convert(input[0],input[1]), expected, 0.1)
      done();
    });
    
    test('Km to Mi', function(done) {
      const input = [1.5, 'km']
      const expected = 0.93206
      assert.approximately(convertHandler.convert(input[0],input[1]), expected, 0.1)
      done();
    });
    
    test('Lbs to Kg', function(done) {
      const input = [180, 'lbs']
      const expected = 81.6466
      assert.approximately(convertHandler.convert(input[0],input[1]), expected, 0.1)
      done();
    });
    
    test('Kg to Lbs', function(done) {
      const input = [40, 'kg']
      const expected = 88.1849
      assert.approximately(convertHandler.convert(input[0],input[1]), expected, 0.1)
      done();
    });
    
  });

});