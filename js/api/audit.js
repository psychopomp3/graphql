import { graphqlRequest } from "./graphql-request.js";

export async function getAudits(token) {
	const query = `
		{
			audit {
				grade
			}
		}
	`;

	const data = await graphqlRequest(query, token);
	return data.audit;
}

export function computeAuditRatio(audits) {
	const done = audits.filter(a => a.grade !== null);
	const passed = done.filter(a => a.grade >= 1);

	if (done.length === 0) return 0;

	return (passed.length / done.length) * 100;
}

// Display:
export function displayAudit(ratio) {
	document.getElementById("audit").innerHTML = `
		<h2>Audit ratio</h2>
		<p>${ratio.toFixed(1)}%</p>
	`;
}
