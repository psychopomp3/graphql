export function drawXPTimeline(svg, transactions) {
	if (!transactions || transactions.length === 0) return;

	/*const width = svg.clientWidth;
	const height = svg.clientHeight;*/
	const width = svg.viewBox.baseVal.width || svg.clientWidth || 800;
	const height = svg.viewBox.baseVal.height || svg.clientHeight || 200;

	console.log("SVG DOM:", svg);
	console.log("clientWidth:", svg.clientWidth);
	console.log("clientHeight:", svg.clientHeight);
	console.log("SVG size:", svg.clientWidth, svg.clientHeight);
	console.log("data:", transactions.length);

	// Convertir les données
	/*const sorted = [...transactions].sort(
		(a, b) => new Date(a.createdAt) - new Date(b.createdAt)
	);*/
	const sorted = transactions
		.filter(t => t.amount && t.createdAt)
		.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));


	// éviter les doublons:
	const seen = new Set();
	const clean = sorted.filter(t => {
		const key = t.createdAt + "-" + t.amount + "-" + t.path;
		if (seen.has(key)) return false;
		seen.add(key);
		return true;
	});


	let total = 0;
	/*const data = sorted.map(t => {
		total += t.amount;
		return {
			date: new Date(t.createdAt),
			xp: total
		};
	});*/
	const data = clean.map(t => {
		total += t.amount;

		return {
			date: new Date(t.createdAt),
			xp: total
		};
	});

	const minDate = data[0].date;
	const maxDate = data[data.length - 1].date;
	const timeRange = maxDate - minDate || 1;
	const maxXP = Math.max(...data.map(d => d.xp));

	// Générer les points
	const points = data.map(d => {
		//const x = ((d.date - minDate) / (maxDate - minDate)) * width;
		const x = ((d.date - minDate) / timeRange) * width;
		const y = height - (d.xp / maxXP) * height;
		return `${x},${y}`;
	});

	// SVG
	svg.innerHTML = `
		<!-- Axes -->
		<line x1="0" y1="${height}" x2="${width}" y2="${height}" stroke="currentColor" />
		<line x1="0" y1="0" x2="0" y2="${height}" stroke="currentColor" />

		<!-- Ligne -->
		<polyline 
		fill="none" 
		stroke="currentColor" 
		stroke-width="2" 
		points="${points.join(" ")}"
		/>

		<!-- Points -->
		${points
		.map(p => {
			const [x, y] = p.split(",");
			return `<circle cx="${x}" cy="${y}" r="3" fill="var(--error-bg)" />`;
		})
		.join("")}
	`;
}
