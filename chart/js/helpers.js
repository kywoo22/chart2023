// Make requests to CryptoCompare API
export async function makeApiRequest(uri) {
	try {
		const response = await fetch(`https://live-rates.com/${uri}`);
		return response.json();
	} catch (error) {
		throw new Error(`CryptoCompare request error: ${error.status}`);
	}
}
export async function makeApiRequestByUrl(url) {
	try {
		const response = await fetch(url);
		return response.json();
	} catch (error) {
		throw new Error(`request error: ${error.status}`);
	}
}
export function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
}