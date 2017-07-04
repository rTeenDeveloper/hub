import request from 'request-promise';

export const SERVER_URL = 'http://localhost:3000';
export const API_URL = `${SERVER_URL}/api/`;

/* eslint-disable */
export async function clearDB() {
  
}

export async function createDemoUser() {

}

export async function loginAsDemoUser() {

}

export async function startAuthenticatedRequest() {

}
/* eslint-enable */

export function initRequestLibrary() {
  request.defaults({ jar: true, resolveWithFullResponse: true });
  return request;
}
