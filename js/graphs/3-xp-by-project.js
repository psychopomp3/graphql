export function drawXPProjects(svg, xpByProject) {
	if (!xpByProject || xpByProject.length === 0) return;

	const width = svg.clientWidth;
	const height = svg.clientHeight;

	// Top 10
	const data = [...xpByProject]
		.sort((a, b) => b.xp - a.xp)
		.slice(0, 10);

	const barWidth = width / data.length;
	const maxXP = Math.max(...data.map(d => d.xp));

	const bars = data
		.map((d, i) => {
		const barHeight = (d.xp / maxXP) * height;
		const x = i * barWidth;
		const y = height - barHeight;

		return `
			<rect 
			x="${x}" 
			y="${y}" 
			width="${barWidth - 5}" 
			height="${barHeight}" 
			fill="steelblue"
			/>
			<text 
			x="${x + barWidth / 2}" 
			y="${height - 5}" 
			text-anchor="middle"
			font-size="10"
			>
			${d.project}
			</text>
		`;
		})
		.join("");

	svg.innerHTML = bars;
}
