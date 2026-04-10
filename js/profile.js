import { graphqlRequest } from "./graphql-request.js";

const token = localStorage.getItem("token");

if (!token) {
	window.location.href = "index.html";
}

/*MARK: Logout
*/
document.getElementById("logoutBtn").addEventListener("click", () => {
	localStorage.removeItem("token");
	window.location.href = "index.html";
});



/*MARK: loadUser
*/
async function loadUser(token) {
	const data = await graphqlRequest(`
		{
		user {
			id
			login
		}
		}
	`, token);

	const user = data.data.user[0];

	document.getElementById("user").innerHTML = `
		<h2>${user.login}</h2>
		<p>ID: ${user.id}</p>
	`;
}

/*MARK: loadXP
*/
async function loadXP(token) {
	const data = await graphqlRequest(`
		{
		transaction(where: { type: { _eq: "xp" } }) {
			amount
		}
		}
	`, token);

	const transactions = data.data.transaction;

	// 👉 total XP
	const totalXP = transactions.reduce((sum, t) => sum + t.amount, 0);

	document.getElementById("xp").innerHTML = `
		<h2>XP total</h2>
		<p>${totalXP}</p>
	`;
}

/*MARK: 1.loadXPProgress
*/
async function loadXPProgress(token) {
	const data = await graphqlRequest(`
		{
		transaction(where: { type: { _eq: "xp" } }) {
			amount
			createdAt
		}
		}
	`, token);

	return data.data.transaction;
}

function processXPData(transactions) {
	// trier par date
	transactions.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

	let total = 0;

	return transactions.map(t => {
		total += t.amount;
		return {
		date: new Date(t.createdAt),
		xp: total
		};
	});
}

//graphique
function generatePath(data, width, height) {
	const maxXP = Math.max(...data.map(d => d.xp));
	const minDate = data[0].date;
	const maxDate = data[data.length - 1].date;

	const points = data.map(d => {
		const x = ((d.date - minDate) / (maxDate - minDate)) * width;
		const y = height - (d.xp / maxXP) * height;
		return `${x},${y}`;
	});

	return "M " + points.join(" L ");
}

/*V1
function drawXPChart(data) {
	const svg = document.getElementById("xpChart");

	const width = svg.clientWidth;
	const height = svg.clientHeight;

	const pathData = generatePath(data, width, height);

	svg.innerHTML = `
		<path d="${pathData}" 
			fill="none" 
			stroke="blue" 
			stroke-width="2"/>
	`;
}
V2*/
function drawXPChart(data) {
	const svg = document.getElementById("xpChart");
	const width = svg.clientWidth;
	const height = svg.clientHeight;

	const pathData = generatePath(data, width, height);

	const points = data.map(d => {
		const maxXP = Math.max(...data.map(d => d.xp));
		const minDate = data[0].date;
		const maxDate = data[data.length - 1].date;

		const x = ((d.date - minDate) / (maxDate - minDate)) * width;
		const y = height - (d.xp / maxXP) * height;

		return `<circle cx="${x}" cy="${y}" r="3" fill="red"/>`;
	}).join("");

	svg.innerHTML = `
		<path d="${pathData}" fill="none" stroke="blue" stroke-width="2"/>
		${points}
	`;
}

async function initXPChart(token) {
	const rawData = await loadXPProgress(token);
	const processed = processXPData(rawData);
	drawXPChart(processed);
}

/*MARK: 2.loadProgress
*/
async function loadProgress(token) {
	const data = await graphqlRequest(`
		{
		progress {
			grade
		}
		}
	`, token);

	return data.data?.progress || [];
}

function processProgress(data) {
	let pass = 0;
	let fail = 0;

	data.forEach(p => {
		if (p.grade === 1) pass++;
		else fail++;
	});

	return { pass, fail };
}

//camembert graphique
function drawPieChart({ pass, fail }) {
	const svg = document.getElementById("pieChart");

	const total = pass + fail;

	if (total === 0) return;

	const passPercent = pass / total;
	const failPercent = fail / total;

	const radius = 80;
	const circumference = 2 * Math.PI * radius;

	const passLength = passPercent * circumference;
	const failLength = failPercent * circumference;

	svg.innerHTML = `
		<circle
			cx="100"
			cy="100"
			r="${radius}"
			fill="none"
			stroke="green"
			stroke-width="30"
			stroke-dasharray="${passLength} ${circumference}"
			transform="rotate(-90 100 100)"
		/>
		<circle
			cx="100"
			cy="100"
			r="${radius}"
			fill="none"
			stroke="red"
			stroke-width="10"
			stroke-dasharray="${failLength} ${circumference}"
			stroke-dashoffset="-${passLength}"
			transform="rotate(-90 100 100)"
		/>
	`;
	svg.innerHTML += `
		<text x="100" y="100" text-anchor="middle" dy="5">
			${Math.round(passPercent * 100)}%
		</text>
	`;
}

async function initPieChart(token) {
	const raw = await loadProgress(token);
	const stats = processProgress(raw);
	drawPieChart(stats);
}

/*MARK: 3.loadXPByProject
*/
async function loadXPByProject(token) {
	const data = await graphqlRequest(`
		{
		transaction(where: { type: { _eq: "xp" } }) {
			amount
			path
		}
		}
	`, token);

	return data.data?.transaction || [];
}

//plusieurs transactions peuvent exister pour un même projet, donc on doit additionner
function groupXPByProject(transactions) {
	const map = {};

	transactions.forEach(t => {
		const project = t.path;

		if (!map[project]) {
			map[project] = 0;
		}

		map[project] += t.amount;
	});

	// transformer en array exploitable
	return Object.entries(map).map(([project, xp]) => ({
		project,
		xp
	}));
}

//limiter pour ne pas avoir trop de barres
function getTopProjects(data, limit = 10) {
	return data
		.sort((a, b) => b.xp - a.xp)
		.slice(0, limit);
}

//graphique barres
function drawBarChart(data) {
	const svg = document.getElementById("barChart");

	const width = svg.clientWidth;
	const height = svg.clientHeight;

	const barWidth = width / data.length;

	const maxXP = Math.max(...data.map(d => d.xp));

	const bars = data.map((d, i) => {
		const barHeight = (d.xp / maxXP) * height;

		const x = i * barWidth;
		const y = height - barHeight;

		return `
			<rect 
				x="${x}" 
				y="${y}" 
				width="${barWidth - 5}" 
				height="${barHeight}" 
				fill="blue"
			/>
		`;
	}).join("");

	const labels = data.map((d, i) => {
		const x = i * barWidth + barWidth / 2;

		return `
			<text 
				x="${x}" 
				y="${height - 5}" 
				text-anchor="middle"
				font-size="10"
			>
				${d.project.split("/").pop()}
			</text>
		`;
	}).join("");

	svg.innerHTML = bars + labels;
}

async function initBarChart(token) {
	const raw = await loadXPByProject(token);
	const grouped = groupXPByProject(raw);
	const top = getTopProjects(grouped, 10);

	drawBarChart(top);
}

//////////////////////////////////////////////////////////////////
/*MARK: //////////////
*/

loadUser(token);
loadXP(token);
initXPChart(token);
initPieChart(token);
initBarChart(token);