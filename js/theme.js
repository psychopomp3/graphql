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