import {useEffect, useState} from "react";
import {createRoot} from "react-dom/client";

import DynamicCss from "dynamic-css-plugin";

import "./index.css";

function Main() {
	const [stateCount, setStateCount] = useState(0);

	useEffect(function componentDidMount() {
		// Add a class to the body to demonstrate usage outside of React components
		document.body.classList.add(DynamicCss("theme-light"));
	});

	return (
		<main id="page" className="container">
			<h1 className="heading">Example - Webpack | Dynamic CSS Plugin</h1>
			<p className="txt">
				This simple React application demonstrates the usage <em>dynamic-css-plugin</em> with Webpack.
			</p>

			<section id="inspect" className="section">
				<h2>Inspect me and notice the class names have transformed!</h2>
				<p className="txt">Even dynamic classes!</p>
				<button type="button" className={["btn", `btn-${stateCount}`].join(" ")} onClick={() => setStateCount(stateCount + 1)}>
					Click to increment ({stateCount})
				</button>
			</section>
		</main>
	);
}

const root = createRoot(document.getElementById("root"));
root.render(<Main />);
