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
}
