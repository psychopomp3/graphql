export function drawXPProjects(svg, xpByProject) {
	if (!xpByProject || xpByProject.length === 0) return;

	/*const width = svg.clientWidth;
	const height = svg.clientHeight;*/
	const width = svg.viewBox.baseVal.width || svg.clientWidth || 800;
	const height = svg.viewBox.baseVal.height || svg.clientHeight || 200;


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
		const label = d.project.length > 12
			? d.project.slice(0, 10) + "…"
			: d.project;

		return `
			<rect 
			x="${x}" 
			y="${y}" 
			width="${barWidth - 5}" 
			height="${barHeight}" 
			fill="currentColor"
			/>
			<text 
			x="${x + barWidth / 2}" 
			y="${y + 10}" 
			text-anchor="middle"
			font-size="10"
			>
				${d.xp} B
			</text>
			<text 
			x="${x + barWidth / 2}" 
			y="${height - 5}" 
			text-anchor="middle"
			font-size="10"
			${label.length > 18 ? `textLength="${barWidth - 10}" lengthAdjust="spacingAndGlyphs"` : ""}
			>
				<title>${d.project}</title>
  				${label}
			</text>
		`;
		})
		.join("");

	svg.innerHTML = bars;
}
