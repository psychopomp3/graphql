export function drawPassFail(svg, pass, fail) {
	const total = pass + fail;

	if (total === 0) {
		svg.innerHTML = "<text x='100' y='100' text-anchor='middle'>No data</text>";
		return;
	}

	const radius = 80;
	const circumference = 2 * Math.PI * radius;

	const passPercent = pass / total;
	const failPercent = fail / total;

	const passLength = passPercent * circumference;
	const failLength = failPercent * circumference;

	// On récupère l'ancien dasharray pour animer depuis l'état précédent
	const oldPass = svg.dataset.passLength ? Number(svg.dataset.passLength) : 0;
	const oldFail = svg.dataset.failLength ? Number(svg.dataset.failLength) : 0;

	svg.dataset.passLength = passLength;
	svg.dataset.failLength = failLength;

	svg.innerHTML = `
		<!-- PASS -->
		<circle
		cx="100" cy="100" r="${radius}"
		fill="none"
		stroke="green"
		stroke-width="25"
		stroke-dasharray="${oldPass} ${circumference}"
		transform="rotate(-90 100 100)"
		>
			<animate attributeName="stroke-dasharray"
			from="${oldPass} ${circumference}"
			to="${passLength} ${circumference}"
			dur="0.8s" fill="freeze"/>
		</circle>

		<!-- FAIL -->
		<circle
		cx="100" cy="100" r="${radius}"
		fill="none"
		stroke="red"
		stroke-width="15"
		stroke-dasharray="${oldFail} ${circumference}"
		stroke-dashoffset="-${passLength}"
		border="yellow"
		transform="rotate(-90 100 100)"
		>
			<animate attributeName="stroke-dasharray"
			from="${oldFail} ${circumference}"
			to="${failLength} ${circumference}"
			dur="0.8s" fill="freeze"/>
		</circle>

		<!-- Pourcentage -->
		<text x="100" y="100" text-anchor="middle" dy="5" font-size="20">
			${Math.round(passPercent * 100)}%
		</text>
	`;
}
