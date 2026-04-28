import { graphqlRequest } from "./graphql-request.js";

// 1) XP brut (toutes les transactions XP)
export async function getXPTransactions(token) {
	/*V1
	const query = `
		{
			transaction(
				where: {
					type: { _eq: "xp" },
					path: { _like: "%div-01%" },
					object: { 
						type: { _in: ["project", "exam"] }
					}
				}
			) {
				amount
				createdAt
				path
				object {
					name
					type
				}
			}
		}
	`;*/
	/*V2*/
	const query = `
	{
		transaction(
			where: {
				type: { _eq: "xp" },
				path: { _like: "%div-01%" }
			}
		) {
			amount
			createdAt
			path
			object {
				name
			}
			objectId
		}
		
		result(
			where: {
				isLast: { _eq: true }
			}
		) {
			objectId
			grade
		}
	}
	`;
	/*V3
	const query = `
	{
		transaction(
			where: {
				type: { _eq: "xp" },
				_and: [
					{ path: { _like: "%div-01%" } },
					{
					_or: [
						{ path: { _not_like: "%piscine-js/%" } }, 
						{ path: { _eq: "/rouen/div-01/piscine-js" } } 
					]
					}
				]
			}
		) {
			amount
			path
			object {
				name
			}
			objectId
		}

		result(
			where: {
			isLast: { _eq: true }
			}
		) {
			objectId
			grade
		}
	}
	`;*/

	const data = await graphqlRequest(query, token);
	//console.log("FULL DATA:", data);
	//return data.transaction;

	//debug
	const tx = data.transaction;
	/*console.log("sample transaction:", tx[0]);
	const paths = [...new Set(tx.map(t => t.path))];
	console.log("ALL PATHS:", paths);
	const types = [...new Set(tx.map(t => t.object?.type))];
	console.log("TYPES:", types);*/
	//console.log("yo:", tx.map(t => t.path));
	/*console.log(
		tx.filter(t => t.path.includes("forum"))
	);*/

	//return tx;
	// filtrage:
	const filtered = tx.filter(t => {
		const path = t.path;

		// garder uniquement div-01
		if (!path.includes("/div-01/")) return false;

		// ❌ exclure sous-exos piscine JS
		if (path.includes("/piscine-js/") && path !== "/rouen/div-01/piscine-js") {
			return false;
		}

		return true;
	});

	//console.log("FILTERED:", filtered.map(t => t.path));

	return filtered;
}

// 2) XP total
export async function getTotalXP(token) {
	const tx = await getXPTransactions(token);
	//const totalXP = tx.reduce((sum, t) => sum + t.amount, 0);

	const map = {};

	tx.forEach(t => {
		const project = t.path;

		if (!map[project]) {
			map[project] = 0;
		}

		// on garde le MAX au lieu de sommer
		if (t.amount > map[project]) {
			map[project] = t.amount;
		}
	});

	const totalXP = Object.values(map).reduce((sum, xp) => sum + xp, 0);

	//console.log("XP par projet (max):", map);
	//console.log("TOTAL XP corrigé:", totalXP);
	//console.log(tx.filter(t => t.path.includes("ascii-art")));

	return Math.round(totalXP / 1000);
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
