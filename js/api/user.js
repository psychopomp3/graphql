import { graphqlRequest } from "./graphql-request.js";

export async function getUser(token) {
	const query = `
		{
			user {
				id
				login
				attrs
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
		<h3>@${user.login}</h3>
		<p>ID: ${user.id}</p>
	`;
}