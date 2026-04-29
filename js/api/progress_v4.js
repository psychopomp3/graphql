import { graphqlRequest } from "./graphql-request.js";

/*MARK: getProgress
	1) Progress brut*/
export async function getProgress(token) {
	const query = `
		{
			progress {
				grade
				createdAt
				path
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

/*MARK: getProgressByType
	2) Filtrer par type d’event (project, exercise, piscine, exam…)*/
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

/*MARK: computePassFail
	3) Calcul PASS/FAIL*/
export function computePassFail(progressList) {
	const map = {};

	progressList.forEach(p => {
		const key = p.path || p.object?.name;

		if (!key) return;

		// garder le plus récent
		if (
			!map[key] ||
			new Date(p.createdAt) > new Date(map[key].createdAt)
		) {
			map[key] = p;
		}
	});

	let pass = 0;
	let fail = 0;

	Object.values(map).forEach(p => {
		if (p.grade >= 1) pass++;
		else fail++;
	});

	console.log("PASS:", pass);
	console.log("FAIL:", fail);

	return { pass, fail };
}

/*MARK: computeSkills
	4) Compute skills*/
export function computeSkills(progressList, projectsData) {

	const last = {};

	// 1. dernier état par projet
	progressList.forEach(p => {
		if (!p.path) return;

		if (
			!last[p.path] ||
			new Date(p.createdAt) > new Date(last[p.path].createdAt)
		) {
			last[p.path] = p;
		}
	});

	const acquired = {};
	const total = {};

	// 2. parcourir tous les projets connus
	projectsData.forEach(project => {
		const name = project.displayedName;
		const skills = project.baseSkills || {};

		const path = `/rouen/div-01/${name}`;
		const progress = last[path];

		const isValid = progress && progress.grade >= 1;

		for (const skill in skills) {
			const value = skills[skill];

			// total possible
			if (!total[skill]) total[skill] = 0;
			total[skill] += value;

			// acquis
			if (isValid) {
				if (!acquired[skill]) acquired[skill] = 0;
				acquired[skill] += value;
			}
		}
	});

	// 3. ratio %
	return Object.keys(total).map(skill => ({
		name: skill,
		value: total[skill]
			? (acquired[skill] / total[skill]) * 100
			: 0
	}));
}

/*MARK: displaySkills
*/
export function displaySkills(skills) {
	const skillsDisplay = skills.map(s => `
		<fieldset>
			<h3>${s.name}: </h3>
			<p>${s.value.toFixed(1)}%</p>
		</fieldset>
	`).join("");

	document.getElementById("skills").innerHTML = `
		<h2>Skills</h2>
		<p>${skillsDisplay}</p>
	`;
}