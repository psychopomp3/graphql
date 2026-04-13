export async function graphqlRequest(query, token) {
	const res = await fetch("https://zone01normandie.org/api/graphql-engine/v1/graphql", {
		method: "POST",
		headers: {
			Authorization: `Bearer ${token}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ query }),
	});

	//return res.json();
	const json = await res.json();
	if (json.errors) {
		console.error("GraphQL errors:", json.errors);
		throw new Error("GraphQL error");
	}
	return json.data;
}