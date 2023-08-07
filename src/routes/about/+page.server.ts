import { postScores } from "$lib/discord";

export async function load({ params }) {
	
    console.log("test")
	// API request to get films here
    await postScores({ title: "The good the bad and the test", year: 1970 }, [])
    await postScores({ title: "Rosemary's testes", year: 1970 }, [{clubber: "Alex", score: "5"}])

	return {
		films: [
            "RRR",
            "API films here"
        ]
	};
}
