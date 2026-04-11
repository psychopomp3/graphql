import { graphqlRequest } from "../graphql-request.js";

export async function getUser(token) {
	const query = `
		{
			user {
				id
				login
				profile
			}
		}
	`;

	const data = await graphqlRequest(query, token);
	return data.user[0];

	/*document.getElementById("user").innerHTML = `
		<h2>${user.login}</h2>
		<p>ID: ${user.id}</p>
	`;*/
}
