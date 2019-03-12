const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000

express()
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('index.html'))
  .get('/getRate', calculateRate)
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))

// Get the rate for a first-class package
function getFirstClassRate(weight) {
	if (weight <= 0)
		return "Weight must be greater than 0."
	else if (weight <= 4)
		return 3.50
	else if (weight <= 8)
		return 3.75
	else if (weight <= 13)
		return 3.75 + .35 * (Math.ceil(weight) - 8)
	else
		return "Weight exceeds the maximum for a first-class package (13 oz.)."
}

// Get the function for determining the rate (or parameters for a linear rate function)
const rateFunctions = {
	stamped:    {base: .29, incr: .21, max: 3.5, name: "stamped letter"     },
	metered:    {base: .26, incr: .21, max: 3.5, name: "metered letter"     },
	flats:      {base: .79, incr: .21, max: 13,  name: "large envelope"     },
	firstclass: {rate: getFirstClassRate}
}

// Get the rate for the package, given the type and weight
function getPostageRate(type, weight) {
	data = rateFunctions[type]
	if (data.base) {
		if ((0 < weight) && (weight <= data.max)) {
			return data.base + data.incr * Math.ceil(weight)
		} else if (weight <= 0) {
			return "Weight must be greater than 0."
		} else {
			return "Weight exceeds the maximum for a " + data.name + " (" + data.max + " oz.)." 
		}
	} else {
		return data.rate(weight)
	}
}

// Get the rate for the package being sent
// Rates are given according to the USPS.
function calculateRate(req, res) {
	var query = req.query
	var type = query.type
	var weight = parseFloat(query.weight)
	if (isNaN(weight)) {
		res.render('pages/getRate', {rate: "Weight not given."})
		return
	}
	
	rate = getPostageRate(type, weight)
	
	if (!isNaN(rate))
		rate = "$" + rate.toFixed(2)
	
	res.render('pages/getRate', {rate: rate})
}