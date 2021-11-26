;(function(){
'use strict';
var fs = require('fs');
var https = require('https');

function httpGet(url, callback) {
	const index = url.indexOf('/', 8);
	const hostname = url.substring(0, index);
	const path = url.substring(index);
	const req = https.request({ hostname, path, method: 'GET' }, res => {
		let rawData = '';
		res.on('data', chunk => rawData += chunk);
		res.on('end', () => callback(rawData));
	});
	req.on('error', e => callback(null));
	req.write(data);
	req.end();
}

function getData(source, dir){
	if(fs.existsSync(dir)){
		console.log('[ignore] : existing ' +  dir);
		return;
	}
	fs.mkdirSync(dir);

	console.log('[info] gettting ' + source);

	httpGet.get(source, function (res) {
		if(!res){
			console.error('[ERR] download file error (' + source + '): ');
		}else{
			saveFile(res, 'node', dir);
			saveFile(res, 'link', dir);
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

	// api: http://lib.csdn.net/base/php/structure
	getData('http://lib.csdn.net/base/' + name + '/structure', 'data/' + name);

});

}());
