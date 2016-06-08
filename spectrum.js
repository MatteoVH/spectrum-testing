'use strict';

const testIterations = 1000;

function generateRandomBool() {
	return Math.random() >= 0.5;
}

function generatePositiveFloat(min = 0, max = Number.MAX_SAFE_INTEGER) {
	const range = max - min;
	return Math.random() * range + min;
}

function generateFloat() {
	if(generateRandomBool())
		return generatePositiveFloat() * -1;
	else
		return generatePositiveFloat();
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

function test(func, testParams) {
	let generator;
	
	//decide generator
	if (testParams.inputType === "number" || testParams.inputType === undefined) {
		if (testParams.distributionType === "linear" || testParams.distributionType === undefined)
			generator = generateLinearFloat(testParams.rangeBottom, testParams.rangeTop);
		else if (testParams.distributionType === "exponential")
			generator = generateExponentialFloat(testParams.rangeBottom, testParams.rangeTop);
	} else if (testParams.inputType === "integer") {
		if (testParams.distributionType === "linear" || testParams.distributionType === undefined)
			generator = generateLinearInt(testParams.rangeBottom, testParams.rangeTop);
		else if (testParams.distributionType === "exponential")
			generator = generateExponentialInt(testParams.rangeBottom, testParams.rangeTop);
	}
			
	let testCases = [];

	let nextVal = generator.next();

	while(!nextVal.done) {
		testCases.push({
			x: nextVal.value
		});
		nextVal = generator.next();
	}

	const results = testCases.map( (testCase) => {
		testCase.y = func(testCase.x);
		return testCase;
	});

	return results;
};
