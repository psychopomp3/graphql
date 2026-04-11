export function drawPassFail1(svg, pass, fail) {
	const total = pass + fail;
	if (total === 0) {
		svg.innerHTML = "<text x='50' y='50'>No data</text>";
		return;
	}

	const radius = 80;
	const circumference = 2 * Math.PI * radius;

	const passPercent = pass / total;
	const failPercent = fail / total;

	const passLength = passPercent * circumference;
	const failLength = failPercent * circumference;

	svg.innerHTML = `
		<!-- PASS -->
		<circle
		cx="100" cy="100" r="${radius}"
		fill="none"
		stroke="green"
		stroke-width="30"
		stroke-dasharray="0 ${circumference}"
		transform="rotate(-90 100 100)"
		>
		<animate attributeName="stroke-dasharray"
				to="${passLength} ${circumference}"
				dur="0.8s" fill="freeze"/>
		</circle>

		<!-- FAIL -->
		<circle
		cx="100" cy="100" r="${radius}"
		fill="none"
		stroke="red"
		stroke-width="10"
		stroke-dasharray="0 ${circumference}"
		stroke-dashoffset="-${passLength}"
		transform="rotate(-90 100 100)"
		>
		<animate attributeName="stroke-dasharray"
				to="${failLength} ${circumference}"
				dur="0.8s" fill="freeze"/>
		</circle>

		<!-- Pourcentage -->
		<text x="100" y="100" text-anchor="middle" dy="5" font-size="20">
		${Math.round(passPercent * 100)}%
		</text>
	`;
}
