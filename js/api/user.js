import { graphqlRequest } from "./graphql-request.js";

export async function getUser(token) {
	const query = `
		{
			user {
				id
				login
				attrs
				campus
			}
		}
	`;

	const data = await graphqlRequest(query, token);
	return data.user[0];
}


// Display:
export function displayUser(user) {
	const attrs = user.attrs || {};
	const firstName = attrs.firstName || "N/A";
	const lastName = attrs.lastName || "N/A";

	document.getElementById("userInfo").innerHTML = `
		<h2>Welcome, ${firstName} ${lastName}!</h2>
		<p>(ID: ${user.id})</p>
		<h3>username: ${user.login}</h3>
		<h3>Campus: ${user.campus}</h3>
	`;
}