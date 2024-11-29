export function getRequestBody(request) {
	return new Promise(function (resolve, reject) {
		let chunks = [];

		request.on('data', function(chunk) {
			chunks.push(chunk);
		});

		request.on('error', function(err) {
			reject(err);
		});

		request.on('end', function() {
			let data = Buffer.concat(chunks).toString();

			resolve(data);
		});
	});
}