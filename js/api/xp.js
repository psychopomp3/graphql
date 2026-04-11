// js/api/api-xp.js
import { graphqlRequest } from "../graphql-request.js";

// 1) XP brut (toutes les transactions XP)
export async function getXPTransactions(token) {
	const query = `
		{
			transaction(where: { type: { _eq: "xp" } }) {
				amount
				createdAt
				path
				objectId
				object {
					name
					type
				}
			}
		}
	`;

	const data = await graphqlRequest(query, token);
	return data.transaction;
}

// 2) XP total
export async function getTotalXP(token) {
	const tx = await getXPTransactions(token);
	return tx.reduce((sum, t) => sum + t.amount, 0);
}

// 3) XP par projet (groupé)
export async function getXPByProject(token) {
	const tx = await getXPTransactions(token);

	const map = {};

	tx.forEach(t => {
		const name = t.object?.name || t.path || "Unknown";
		if (!map[name]) map[name] = 0;
		map[name] += t.amount;
	});

	return Object.entries(map).map(([project, xp]) => ({ project, xp }));
}
