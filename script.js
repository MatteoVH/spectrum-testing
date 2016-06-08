'use strict';


$(document).ready(_ => {

	const resultsChartCanvas = $('#resultsChart');
	const resultsChart = new Chart(resultsChartCanvas, {
		type: 'line',
		data: {
			datasets: [{
				label: 'Results',
				borderColor: '#34B7E3',
				data: []
			}]
		},
		options: {
			scales: {
				xAxes: [{
					type: 'linear',
					position: 'bottom'
				}]
			}
		}

	});

	let results = [];

	updateGraph();

	const doneTypingInterval = 500;  //time in ms (5 seconds)
	let typingTimer;                //timer identifier

	//on keyup, start the countdown
	$('#testCode textarea').keyup(function() {
		clearTimeout(typingTimer);
		typingTimer = setTimeout(updateGraph, doneTypingInterval);
	});	

	$('#testParameters textarea').keyup(function() {
		clearTimeout(typingTimer);
		typingTimer = setTimeout(updateGraph, doneTypingInterval);
	});	

	//when the code changes re-evaluate it
	function updateGraph() {
		$('#errors h1').empty();

		const testCodeString = $('#testCode textarea').val();
		const funcToTest = eval(testCodeString);

		const parameterString = '{' + $('#testParameters textarea').val().split('\n').join(',') + '}';

		const parameters = JSON.parse(parameterString);

		let results;
		try {
			results = test(funcToTest, parameters);
		} catch (error) {
			$('#errors h1').html(error);
		}

		resultsChart.data.datasets[0].data = results;
		resultsChart.update();

	}
});
