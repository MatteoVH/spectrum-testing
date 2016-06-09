'use strict';

let testIterations = 1000;

function generateRandomBool() {
	return Math.random() >= 0.5;
}

function generatePositiveFloat(min = 0, max = Number.MAX_SAFE_INTEGER) {
	const range = max - min;
	return Math.random() * range + min;
}

function generateFloat(min = Number.MAX_SAFE_INTEGER / 3 * -1, max = Number.MAX_SAFE_INTEGER / 3) {
	return Math.random() * (max - min) + min;
}

function generateInt(min = Number.MAX_SAFE_INTEGER * -1, max = Number.MAX_SAFE_INTEGER) {
	return Math.floor(generateFloat(min, max));
}

function* generateLinearFloat(rangeBottom = -25, rangeTop = 25) {

	
	const floatGap = (rangeTop - rangeBottom) / testIterations;

	let currentFloat = rangeBottom;

	while(floatGap < rangeTop - currentFloat) {
		yield currentFloat;
		currentFloat = currentFloat + floatGap;
	}
}

function* generateExponentialFloat(rangeBottom = 0, rangeTop = 25) {
	const smallestJSNumber = 1e-323;

	if (rangeBottom < 0)
		throw "Can't create exponential distribution with negative numbers";

	if (rangeBottom === 0)
		rangeBottom += smallestJSNumber;
	
	const exponentialParameterGenerator = generateLinearFloat(Math.log(rangeBottom), Math.log(rangeTop));

	let nextNumber = exponentialParameterGenerator.next();

	while (!nextNumber.done) {
		yield Math.pow(Math.E, nextNumber.value);
		nextNumber = exponentialParameterGenerator.next();
	}
}

function* generateLinearInt(rangeBottom = -25, rangeTop = 25) {
	const numberGenerator = generateLinearFloat(rangeBottom, rangeTop);
	
	let nextNumber = numberGenerator.next();
	
	while (!nextNumber.done) {
		yield Math.floor(nextNumber.value);
		nextNumber = numberGenerator.next();
	}
}

function* generateExponentialInt(rangeBottom = 0, rangeTop = 25) {
	const generator = generateExponentialFloat(rangeBottom, rangeTop); 
	
	let nextNumber = generator.next();

	while (!nextNumber.done) {
		yield Math.floor(nextNumber.value);
		nextNumber = generator.next();
	}
}

function* generateArray(type = [{"type": "number"}], options) {

	const generators = type.map( elem => {
		if (elem.type === "number")
			return generateFloat.bind(null, elem.min, elem.max);
		else if (elem.type === "integer")
			return generateInt.bind(null, elem.min, elem.max);
		else if (elem.type === "boolean")
			return generateRandomBool;
		else //we didn't find a matching string so default to a float
			return generateFloat;
	});

	let iterations = 0;

	let array = [];

	if (options.rangeBottom > 0) {
		while (array.length < options.rangeBottom) {
			array = [...array, generators[iterations % generators.length]()];
			iterations++;
		}
	}
		

	while (iterations <= testIterations && iterations <= options.rangeTop) {
		yield array;
		array = [...array, generators[iterations % generators.length]()];
		iterations++;
	}
}

function getGenerator(type = "number", options) {

	if (type === "number") {
		if (options.distributionType === "linear" || options.distributionType === undefined)
			return generateLinearFloat(options.rangeBottom, options.rangeTop);
		else if (options.distributionType === "exponential")
			return generateExponentialFloat(options.rangeBottom, options.rangeTop);
	} else if (type === "integer") {
		if (options.distributionType === "linear" || options.distributionType === undefined)
			return generateLinearInt(options.rangeBottom, options.rangeTop);
		else if (options.distributionType === "exponential")
			return generateExponentialInt(options.rangeBottom, options.rangeTop);
	} else if (Array.isArray(type)) {
		return generateArray(type, options);
	}
}	


function test(func, testParams) {
	if (testParams.testIterations)
		testIterations = testParams.testIterations;

	const generator = getGenerator(testParams.inputType, testParams);

	let testCases = [];

	let testLabels = [];

	let nextVal = generator.next();

	while(!nextVal.done) {
		testCases.push({
			x: nextVal.value 
		});

		if (Array.isArray(nextVal.value))
			testLabels.push(nextVal.value.length);
		else
			testLabels.push(nextVal.value);

		nextVal = generator.next();
	}

	const results = testCases.map( (testCase, index) => {
		try {
			testCase.y = func(testCase.x);
		} catch (error) {
			$('#errors h1').html('Index ' + index + ': ' + error);
		}
		testCase.x = testLabels[index];
		return testCase;
	});

	return results;
};
