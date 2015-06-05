/// <reference path="../modules/node.d.ts" />

var http = require("request"),
	fs = require("fs"),
	cheerio = require("cheerio");

//todo: try to find a way to get all names from genderize.io but the limit is 1k per day, so sad.
//var fun = function (n) {
//	http("https://api.genderize.io/?name=peter", function (error, response, body) {
//		if (!error && response.statusCode === 200) {
//			console.log(n, body);
//			fun(++n);
//		}
//	});
//};
//
//fun(0);


var csvInPath:string = "../data/data.csv",
	csvOutPath:string = "../data/" + (new Date()).toDateString() + "out.csv";

/**
 *
 * @sourcePath string that shows the location of the .csv to analyze.
 * @targetPath string that shows the location where you want to write the resulting .csv to analyze.
 * @fixerFunctions array with all the functions that will be executed to tidy up the data set, functions must return the dataSet.
 * @encode optional string parameter that allows to change the encoded type default is UTF-8.
 * @columnSeparator optional character that is used as the splitter between columns.
 * @rowSeparator optional character that is used as the splitter between the rows.
 *
 * */
var readCSVFile = function (sourcePath:string,
							targetPath:string,
							fixerFunctions:Array<Function>,
							encode:string = "UTF-8",
							columnSeparator:string = ",",
							rowSeparator:string = "\n") {

	fs.readFile(sourcePath, encode, function (err, data) {
		var dataSet:Array<Array<string>> = data
				.split(rowSeparator)
				.map(row => row.split(columnSeparator))
				.filter(row => row.length > 1),
			tempDataSet = dataSet;

		fixerFunctions.forEach(fun => {
				tempDataSet = fun(tempDataSet, csvOutPath);
			}
		);
		console.log(dataSet.length);
		console.log(tempDataSet.length);
	});
};

/**
 *
 * @dataSet Array of an Array of strings where all the data is stored.
 *
 * */
var findSpacedNames:Function = (dataSet:Array<Array<string>>) => {
	return dataSet.filter(row =>  row.length > 2 && row[1].indexOf(" ") > -1);
};

/**
 *
 * @dataSet Array of an Array of strings where all the data is stored.
 * @path string that shows the location where you want to write the resulting .csv to analyze.
 * @columnSeparator optional character that is used as the splitter between columns.
 * @rowSeparator optional character that is used as the splitter between the rows.
 *
 * */
var writeCSV:Function = (dataSet:Array<Array<string>>,
						 path:string,
						 columnSeparator:string = ",",
						 rowSeparator:string = "\n") => {
	fs.writeFile(path, dataSet.map(row =>
			row.join(columnSeparator)).join(rowSeparator), error => {
			if (error) throw error;
			console.log("File saved");
		}
	);
	return dataSet;
};

/**
 *
 * @dataSet Array of an Array of strings where all the data is stored.
 *
 * */
var getCompleteNames:Function = (dataSet:Array<Array<string>>) => {
	var ci:Array<Array<string>> = dataSet || [["19623747"], ["15458525"], ["12000000"], ["12000001"]],
		responses:Array<string> = [];

	ci.forEach(citizen => {
		http("http://cne.gob.ve/web/registro_electoral/ce.php?nacionalidad=V&cedula=" + citizen[0], (error, response, body) => {
			if (body && !error) {
				var $ = cheerio.load(body);

				var line = citizen[0] + "," + $("tr b")[3].children[0].data + "\n";
				fs.appendFileSync("trial.csv", line);
			}
		});
	});

	//writeCSV(responses, "trial.csv");
	return responses;// todo: return the dataSet
};

//readCSVFile(csvInPath, csvOutPath, [findSpacedNames, writeCSV]);
getCompleteNames();

//
//var favio = function () {
//	ugly.forEach(function (nombre) {
//		//fun(nombre.split(",")[0]);
//		console.log(nombre);
//	});
//	console.log(ugly.length);
//	fun(ugly[0]);
//};
//
//var fun = function (ci) {
//	http("http://cne.gob.ve/web/registro_electoral/ce_psuv2015.php?nacionalidad=V&cedula=" + ci, function (error, response, body) {
//		if (!error && response.statusCode === 200) {
//			console.log(body);
//		}
//	});
//};