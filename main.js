let svgRoot = document.createElementNS("http://www.w3.org/2000/svg", "svg");
svgRoot.setAttribute("viewBox", "-505 -505 1010 1010");
svgRoot.setAttribute("style", "height: 500px;");

let added = false;

function hue2rgb(p, q, t) {
	if (t < 0) t += 6;
	if (t > 6) t -= 6;
	if (t < 1) return p + (q - p) * t;
	if (t < 3) return q;
	if (t < 4) return p + (q - p) * (4 - t);
	return p;
}

function colorString(color) {
	return `rgb(${color})`;
}

function randomPalette(n) {
	const HUE_LIMIT = 1.25;

	const hues = Array(n);
	do {
		for (let i = 0; i < n; i++) {
			hues[i] = Math.random() * 6;
		}

		outer: for (let i = 1; i < n; ) {
			if (Math.abs(hues[i - 1] - hues[i]) >= HUE_LIMIT) {
				i++;
				continue;
			}

			for (let j = n - 1; j > i; j--) {
				if (Math.abs(hues[j] - hues[i - 1]) >= HUE_LIMIT) {
					const temp = hues[i];
					hues[i] = hues[j];
					hues[j] = temp;

					i++;
					continue outer;
				}
			}

			hues[i] = Math.random() * 6;
		}
	} while (Math.abs(hues[0] - hues[n - 1]) < HUE_LIMIT);

	const s = 1;
	const l = 0.8;

	return hues.map((h) => {
		const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
		const p = 2 * l - q;

		return colorString([
			Math.round(255 * hue2rgb(p, q, h + 2)),
			Math.round(255 * hue2rgb(p, q, h)),
			Math.round(255 * hue2rgb(p, q, h - 2)),
		]);
	});
}

let palette = [];
let ratings = [];

function update() {
	const numCategories = Number(document.getElementById("numCategories").value);
	const numLevels = Number(document.getElementById("numLevels").value);

	if (numCategories !== palette.length) {
		palette = randomPalette(numCategories);
	}

	if (!added) {
		added = true;
		const output = document.getElementById("output");
		output.innerHTML = "";
		output.appendChild(svgRoot);
	}

	svgRoot.innerHTML = "";

	let a = Math.PI;
	for (let c = 0; c < numCategories; c++) {
		const group = svgRoot.appendChild(
			document.createElementNS("http://www.w3.org/2000/svg", "g")
		);
		group.setAttribute("fill", palette[c]);
		group.setAttribute("stroke", "black");
		group.setAttribute("stroke-width", "3");

		const b = Math.PI * 2 * ((numCategories - c - 1) / numCategories + 0.5);

		const rating = ratings[c] || 1;

		let r = 0;
		for (let l = 0; l < numLevels; l++) {
			const path = group.appendChild(
				document.createElementNS("http://www.w3.org/2000/svg", "path")
			);

			if (l >= rating) {
				path.setAttribute("fill", "white");
			}

			path.onclick = () => {
				ratings[c] = l + 1;
				update();
			};

			const R = 500 * ((l + 1) / numLevels);
			if (l === 0) {
				path.setAttribute(
					"d",
					`M0,0L${R * Math.sin(a)},${R * Math.cos(a)}A${R},${R} 0,0,1 ${
						R * Math.sin(b)
					},${R * Math.cos(b)}Z`
				);
			} else {
				path.setAttribute(
					"d",
					`M${R * Math.sin(a)},${R * Math.cos(a)}A${R},${R} 0,0,1 ${
						R * Math.sin(b)
					},${R * Math.cos(b)}L${r * Math.sin(b)},${
						r * Math.cos(b)
					}A${r},${r} 0,0,0 ${r * Math.sin(a)},${r * Math.cos(a)}Z`
				);
			}

			r = R;
		}

		a = b;
	}
}

window.addEventListener("load", update);
