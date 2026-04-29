import { graphqlRequest } from "./graphql-request.js";

// 1) Progress brut
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

// 4) Compute skills
/*export function computeSkills(progressList) {
	const skills = {};

	progressList.forEach(p => {
		const type = p.object?.type;

		// sécurité si données incomplètes
		if (!type || typeof p.grade !== "number") return;

		if (!skills[type]) {
			skills[type] = { total: 0, count: 0 };
		}

		skills[type].total += p.grade;
		skills[type].count++;
	});

	// map pour changer les intitulés
	const labelMap = {
		games: "Games",
		project: "Projects",
		exercise: "Exercises",
		piscine: "Piscine",
		exam: "Exams"
	};

	const result = Object.entries(skills).map(([name, data]) => ({
		name: labelMap[name] || name,
		value: (data.total / data.count) * 100
	}));

	console.log("skills:", result);

	return result;
}*/
export function computeSkills(progressList) {
	const skills = {};

	// mapping des mots-clés → skills
	const skillMap = {
		"piscine-go": "Go",
		"go": "Go",
		"piscine-js": "JavaScript",
		"js": "JavaScript",
		"algo": "Algorithms",
		"algorithm": "Algorithms",
		"frontend": "Frontend",
		"front": "Frontend",
		"back": "Backend",
		"backend": "Backend",
		"graphql": "Backend",
		"docker": "Docker",
		"unix": "Unix",
		"shell": "Unix",
		"ui": "UI",
		"ux": "UX"
	};

	progressList.forEach(p => {
		const path = p.path?.toLowerCase() || "";

		for (const key in skillMap) {
			if (path.includes(key)) {
				const skill = skillMap[key];

				if (!skills[skill]) {
					skills[skill] = { total: 0, count: 0 };
				}

				skills[skill].total += p.grade;
				skills[skill].count++;
			}
		}
	});

	const result = Object.entries(skills).map(([name, data]) => ({
		name,
		value: (data.total / data.count) * 100
	}));

	console.log("real skills:", result);

	return result;
}

// Display:
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