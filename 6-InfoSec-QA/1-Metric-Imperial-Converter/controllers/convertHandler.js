const math = require('mathjs')

function ConvertHandler() {
  const unitsArr = [
    {
      name: 'l',
      spelled: 'liter',
      convertsTo: 'gal',
      factor: 0.26417
    },
    {
      name: 'gal',
      spelled: 'gallon',
      convertsTo: 'l',
      factor: 3.78541
    },
    {
      name: 'lbs',
      spelled: 'pound',
      convertsTo: 'kg',
      factor: 0.453592
    },
    {
      name: 'kg',
      spelled: 'kilogram',
      convertsTo: 'lbs',
      factor: 2.20462
    },
    {
      name: 'mi',
      spelled: 'mile',
      convertsTo: 'km',
      factor: 1.60934
    },
    {
      name: 'km',
      spelled: 'kilometer',
      convertsTo: 'mi',
      factor: 0.62137
    }
  ]
  
  // const validUnits = ['l', 'gal', 'lbs', 'kg', 'mi', 'km']
  
  this.getNum = function(input) {
    // console.log(input)
    // match everything not a-z
    let inputNum = input.match(/[^a-z]/gi)
    // console.log(inputNum)
    
    // check if no number is included
		if(inputNum == null){
			inputNum = '1'
		} else {
			inputNum = inputNum.join('')
		}
    
    let result
    if(inputNum.match(/[^0-9|\/|\.]/g)){
      return 'invalid number'
    } else {
      const doubleSlashCheck = inputNum.match(/\/.*\//g)
      if( doubleSlashCheck !== null) { return 'invalid number' }
      result = parseFloat(math.evaluate(inputNum))
    }
    
    return result
  };
  
  this.getUnit = function(input) {
    let unitStr = input.match(/[a-z]+/i)

    if(unitStr == null){
			return 'invalid unit'
		} else {
			// get array of just the unit names
    	const validUnits = unitsArr.map(unit => unit.name)
			
			unitStr = String(unitStr).toLowerCase()
      // console.log(unitStr)
				// check if the units are one of the valid options
			if(validUnits.indexOf(unitStr) > -1){
        if(unitStr === 'l'){return 'L'}
				return unitStr 
			} else {
  			return 'invalid unit'
			}
		}
  };
  
  this.getReturnUnit = function(initUnit) {
    if(initUnit !== 'invalid unit'){
      // map units for conversion
      const returnUnit = unitsArr.find(unit => unit.name === initUnit.toLowerCase()).convertsTo
      // console.log(returnUnit)
      return returnUnit
    } else {
      return false
    }
  };

  this.spellOutUnit = function(unit) {
    let result = unitsArr.find(elem => elem.name === unit.toLowerCase()).spelled
    if(result == 'l'){
      return 'L'
    }
    return result;
  };
  
  this.convert = function(initNum, initUnit) {
    if(initNum !== 'invalid number' && initUnit !== 'invalid unit') {
         const value = unitsArr.find(elem => elem.name === initUnit.toLowerCase()).factor
         const num = math.evaluate(initNum)
         const result = (num * value).toFixed(5)
         return parseFloat(result)
       } else {
         return false
       }
  };
  
  this.getString = function(initNum, initUnit, returnNum, returnUnit) {
    let result
    
    if(returnNum){
      result = `${initNum} ${this.spellOutUnit(initUnit)}${initNum !== 1 ? 's' : ''} converts to ${returnNum} ${this.spellOutUnit(returnUnit)}${returnNum !== 1 ? 's' : ''}`
    } else if(initNum == 'invalid number' && initUnit !== 'invalid unit'){
      result = 'invalid number'
    } else if(initNum !== 'invalid number' && initUnit == 'invalid unit'){
      result = 'invalid unit'
    } else {
      result = 'invalid number and unit'
    }
    
    return result;
  };
  
}

module.exports = ConvertHandler;
