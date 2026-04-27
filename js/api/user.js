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

	document.getElementById("welcome").innerHTML = `
		Welcome, ${firstName} ${lastName}!
	`;

	document.getElementById("userInfo").innerHTML = `
		<h2>Your Space 10 dashboard</h2>
		<fieldset>
			<h3>username: </h3>
			<p>${user.login}</p>
		</fieldset>		
		<fieldset>
			<h3>id: </h3>
			<p>${user.id}</p>
		</fieldset>
		<fieldset>
			<h3>campus: </h3>
			<p>${user.campus}</p>
		</fieldset>
	`;
}