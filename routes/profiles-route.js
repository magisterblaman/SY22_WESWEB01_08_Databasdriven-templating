import http from 'http';
import { getRequestBody } from '../utilities.js';
import { dbo } from '../index.js';
import { ObjectId } from 'mongodb';
import fs from 'fs/promises';

/**
 * 
 * @param {string[]} pathSegments 
 * @param {http.IncomingMessage} request 
 * @param {http.ServerResponse} response 
 */
export async function handleProfilesRoute(pathSegments, request, response) {
	let nextSegment = pathSegments.shift();
	if (!nextSegment) {
		if (request.method !== 'POST') {
			response.writeHead(405, { 'Content-Type': 'text/plain' });
			response.write('405 Method Not Allowed');
			response.end();
			return;
		}

		let body = await getRequestBody(request);

		let params = new URLSearchParams(body);

		if (!params.get('profileName') || !params.get('profileEmail')
			|| params.get('profileAge') < 13 || params.get('profileAge') > 99) {

			response.writeHead(400, { 'Content-Type': 'text/plain' });
			response.write('400 Bad Request');
			response.end();
			return;
		}

		await dbo.collection('profiles').insertOne({
			'name': params.get('profileName'),
			'email': params.get('profileEmail'),
			'age': params.get('profileAge')
		});

		response.writeHead(201, { 'Content-Type': 'text/plain' });
		response.write('201 Created');
		response.end();
		return;
	}

	if (request.method !== 'GET') {
		response.writeHead(405, { 'Content-Type': 'text/plain' });
		response.write('405 Method Not Allowed');
		response.end();
		return;
	}


	let profileDocument;
	try {
		profileDocument = await dbo.collection('profiles').findOne({
			"_id": new ObjectId(nextSegment)
		});
	} catch (e) {
		response.writeHead(404, { 'Content-Type': 'text/plain' });
		response.write('404 Not Found');
		response.end();
		return;
	}

	if (!profileDocument) {
		response.writeHead(404, { 'Content-Type': 'text/plain' });
		response.write('404 Not Found');
		response.end();
		return;
	}

	let template = (await fs.readFile('templates/profile.volvo')).toString();

	template = template.replaceAll('%{profileName}%', profileDocument.name);
	template = template.replaceAll('%{profileEmail}%', profileDocument.email);
	template = template.replaceAll('%{profileAge}%', profileDocument.age);

	response.writeHead(200, { 'Content-Type': 'text/html;charset=UTF-8' });
	response.write(template);
	response.end();
	return;
}