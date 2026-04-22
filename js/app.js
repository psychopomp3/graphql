const loginBtn = document.getElementById("loginBtn");

loginBtn.addEventListener("click", async () => {
	const username = document.getElementById("username").value;
	const password = document.getElementById("password").value;
	const errorEl = document.getElementById("error");

	try {
		// encoder username:password en base64
		const credentials = btoa(`${username}:${password}`);

		const res = await fetch("https://zone01normandie.org/api/auth/signin", {
			method: "POST",
			headers: {
				Authorization: `Basic ${credentials}`,
			},
		});

		if (!res.ok) {
			throw new Error("Invalid Credentials");
		}

		const data = await res.json();

		// récupérer le token
		const token = data;
		// le stocker
		localStorage.setItem("token", token);
		//console.log("JWT:", token);
		//test GraphQL direct
		fetchGraphQL(token);

		window.location.href = "profile.html";

	} catch (err) {
		//errorEl.textContent = err.message;
		errorEl.innerHTML = `<p>${err.message}</p>`;
	}
});


async function fetchGraphQL(token) {
	const res = await fetch("https://zone01normandie.org/api/graphql-engine/v1/graphql", {
		method: "POST",
		headers: {
			Authorization: `Bearer ${token}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			query: `
				{
				user {
					id
					login
				}
				}
			`,
		}),
	});

	const data = await res.json();

	console.log("GraphQL data:", data);
}