import type { Film } from "@prisma/client";
import type { Score } from "../types";

const filmClubChannelWebhookUrl = process.env.DISCORD_WEBHOOK_URL__FILM_CLUB

export async function postScores(film: Film, scores: Score[]) {
    console.log("Posting scores to discord");
    if (!filmClubChannelWebhookUrl) {
        console.error("DISCORD_WEBHOOK_URL__FILM_CLUB should be set to a valid discord webhook URL");
    }
    const messageHeader = `**${film.title} (${film.year})**`
    const messageBody = (
        scores.length !== 0
            ? scores.map(score => `${score.clubber} - ${score.score}`).join("\n")
            : "No clubbers scored this film"
    )
    await sendMessage(filmClubChannelWebhookUrl, messageHeader + "\n" + messageBody)
}

async function sendMessage(webhookUrl: string | undefined, content: string) {
    if (!webhookUrl) {
        console.log(`Would have POSTed the following message to discord:\n ${content}`)
        return;
    }
    const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            content
        })
    })

    if (!response.ok) {
        throw new Error(`Discord response error ${response.status} (${response.statusText}): ${await response.text()}`)
    }
}
