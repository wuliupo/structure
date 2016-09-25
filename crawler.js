;(function(){
'use strict';
var fs = require('fs');
var superagent = require('superagent');

function getData(source, dir){
	if(fs.existsSync(dir)){
		console.log('[ignore] : existing ' +  dir);
		return;
	}
	fs.mkdirSync(dir);

	console.log('[info] gettting ' + source);

	superagent.get(source).end(function (error, response) {
		if(error || response.statusCode !== 200 || !response.text){
			console.error('[ERR] download file error (' + source + '): ');
		}else{
			saveFile(response.text, 'node', dir);
			saveFile(response.text, 'link', dir);
		}
	});
}

function saveFile(data, from, dir){
	data = data.substring(data.indexOf(from + 'str')) || '';
	data = data.substring(data.indexOf('['), data.indexOf(']') + 1) || '';
	data = data.replace(/&#34;/g, '"').replace(/\t/g,'');
	var fileName = dir + '/' + from + '.json';

	if(!data){
		console.log('[ERR] no content when parsing' + fileName);
		return;
	}

	writeFile(fileName, data);
}

function writeFile(fileName, data){
	fs.writeFile(fileName, data, function(err){
		if(!err){
			console.log('[' + fileName + '] successfully ...');
		}else{
			console.log('[ERR] encounter error (' + fileName + '): ' + err);
		}
	});
}

fs.readFileSync('list.txt', 'utf-8').split('\n').forEach(function(name){
	if(!name){
		return;
	}
	console.log('[info] starting ...' + name);
	name = name.replace(/\s+/g, '').replace(/\+/g, 'plus').replace(/#/g, 'sharp').toLowerCase();

	getData('http://lib.csdn.net/base/' + name + '/structure', 'data/' + name);

});

}());