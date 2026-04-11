export function drawXPTimeline(svg, transactions) {
	if (!transactions || transactions.length === 0) return;

	const width = svg.clientWidth;
	const height = svg.clientHeight;

	// Convertir les données
	const sorted = [...transactions].sort(
		(a, b) => new Date(a.createdAt) - new Date(b.createdAt)
	);

	let total = 0;
	const data = sorted.map(t => {
		total += t.amount;
		return {
			date: new Date(t.createdAt),
			xp: total
		};
	});

	const minDate = data[0].date;
	const maxDate = data[data.length - 1].date;
	const maxXP = Math.max(...data.map(d => d.xp));

	// Générer les points
	const points = data.map(d => {
		const x = ((d.date - minDate) / (maxDate - minDate)) * width;
		const y = height - (d.xp / maxXP) * height;
		return `${x},${y}`;
	});

	// SVG
	svg.innerHTML = `
		<!-- Axes -->
		<line x1="0" y1="${height}" x2="${width}" y2="${height}" stroke="#aaa" />
		<line x1="0" y1="0" x2="0" y2="${height}" stroke="#aaa" />

		<!-- Ligne -->
		<polyline 
		fill="none" 
		stroke="blue" 
		stroke-width="2" 
		points="${points.join(" ")}"
		/>

		<!-- Points -->
		${points
		.map(p => {
			const [x, y] = p.split(",");
			return `<circle cx="${x}" cy="${y}" r="3" fill="red" />`;
		})
		.join("")}
	`;
}
