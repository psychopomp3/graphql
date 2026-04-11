import { graphqlRequest } from "../graphql-request.js";

// 1) Progress brut
export async function getProgress(token) {
	const query = `
		{
			progress {
				grade
				createdAt
				object {
					name
					type
				}
			}
		}
	`;

	const data = await graphqlRequest(query, token);
	return data.progress;
}

// 2) Filtrer par type d’event (project, exercise, piscine, exam…)
export async function getProgressByType(token, type) {
	const query = `
		{
			progress(where: { object: { type: { _eq: "${type}" } } }) {
				grade
				createdAt
				object {
					name
					type
				}
			}
		}
	`;

	const data = await graphqlRequest(query, token);
	return data.progress;
}

// 3) Calcul PASS/FAIL
export function computePassFail(progressList) {
	let pass = 0;
	let fail = 0;

	progressList.forEach(p => {
		if (p.grade >= 1) pass++;
		else fail++;
	});

	return { pass, fail };
}
