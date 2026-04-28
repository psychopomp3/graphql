import { graphqlRequest } from "./graphql-request.js";

/*MARK: getAudits
*/
export async function getAudits(token) {
	const query = `
	{
		transaction(
			where: {
				_or: [
					{ type: { _eq: "up" } },
					{ type: { _eq: "down" } }
				]
			}
		) {
			type
			amount
		}
	}
	`;

	const data = await graphqlRequest(query, token);
	return data.transaction;
}

/*MARK: computeRatio
*/
export function computeAuditRatio(audits) {
	let done = 0;     // audits fais
	let received = 0; // audits reçus

	audits.forEach(t => {
		if (t.type === "up") done += t.amount;
		if (t.type === "down") received += t.amount;
	});

	if (received === 0) return { ratio: 0, done: 0, received: 0 };

	//console.log("DONE:", done);
	//console.log("RECEIVED:", received);
	return {
		ratio: done / received, 
		done, 
		received 
	};
}


/*MARK: displayAudit
*/
function formatXP(value) {
	if (value >= 1_000_000) {
		return (value / 1_000_000).toFixed(2) + " MB";
	}
	if (value >= 1_000) {
		return (value / 1_000).toFixed(2) + " kB";
	}
	return value + " B";
}

export function displayAudit(data) {
	const { ratio, done, received } = data;

	document.getElementById("audit").innerHTML = `
		<h2>Audit ratio</h2>
		<p>${ratio.toFixed(2)}</p>
		<fieldset>
			<h3>↑ done: </h3>
			<!--<p>${done} B</p>-->
			<p>${formatXP(done)}</p>
		</fieldset>		
		<fieldset>
			<h3>↓ received: </h3>
			<!--<p>${received} B</p>-->
			<p>${formatXP(received)}</p>
		</fieldset>
	`;
}
