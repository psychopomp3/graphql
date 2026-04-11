import { getUser } from "./api/user.js";
import { getXPTransactions, getTotalXP, getXPByProject } from "./api/xp.js";
import { getProgress, getProgressByType, computePassFail } from "./api/progress.js";

import { drawXPTimeline } from "./graphs/1-xp-timeline.js";
import { drawPassFail } from "./graphs/2-pass-fail.js";
import { drawXPProjects } from "./graphs/3-xp-by-project.js";

/*MARK: Token
*/
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


/*MARK: Init
*/
async function initProfile() {
	try {
		// 1) USER
		const user = await getUser(token);
		document.getElementById("userInfo").innerHTML = `
			<h2>${user.login}</h2>
			<p>ID: ${user.id}</p>
		`;

		// 2) XP TOTAL
		const totalXP = await getTotalXP(token);
		document.getElementById("xpTotal").innerHTML = `
			<h3>Total XP</h3>
			<p>${totalXP}</p>
		`;

		// 3) XP TIMELINE GRAPH
		const xpTransactions = await getXPTransactions(token);
		const svgTimeline = document.getElementById("xpTimeline");
		drawXPTimeline(svgTimeline, xpTransactions);

		// 4) PASS / FAIL GRAPH (GLOBAL)
		const progress = await getProgress(token);
		const { pass, fail } = computePassFail(progress);
		const svgPie = document.getElementById("passFailChart");
		drawPassFail(svgPie, pass, fail);

		// 5) XP BY PROJECT GRAPH
		const xpByProject = await getXPByProject(token);
		const svgProjects = document.getElementById("xpProjectsChart");
		drawXPProjects(svgProjects, xpByProject);

		// 6) EVENT FILTER (pour le pie chart)
		setupEventFilter(progress);

	} catch (err) {
		console.error("Erreur dans initProfile:", err);
	}
}

//////////////////////////////////////////////////////////////////
/*MARK: Filter
	(Pie Chart)
*/
function setupEventFilter(allProgress) {
	const select = document.getElementById("eventFilter");

	select.addEventListener("change", async () => {
		const type = select.value;

		let filtered;
		if (type === "all") {
			filtered = allProgress;
		} else {
			filtered = await getProgressByType(token, type);
		}

		const { pass, fail } = computePassFail(filtered);
		const svgPie = document.getElementById("passFailChart");
		drawPassFail(svgPie, pass, fail);
	});
}

//////////////////////////////////////////////////////////////////
/*MARK: Start
*/
initProfile();


/*MARK: Toggle Theme
*/
const themeBtn = document.getElementById("themeToggle");

themeBtn.addEventListener("click", () => {
	document.documentElement.classList.toggle("dark");

	const isDark = document.documentElement.classList.contains("dark");
	localStorage.setItem("theme", isDark ? "dark" : "light");
});

// Charger le thème au démarrage
if (localStorage.getItem("theme") === "dark") {
	document.documentElement.classList.add("dark");
}
