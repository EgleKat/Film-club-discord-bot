import { getAllWrappedAwards } from '$lib/server/database.js'
import { error } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'

const SECRET_TEST_KEY = 'north-pole-2024'

export const load: PageServerLoad = async ({ url }) => {
    const now = new Date()
    const currentYear = now.getFullYear()
    const month = now.getMonth() // 0-indexed, so December is 11
    const day = now.getDate()

    // Check for secret test parameter
    const testKey = url.searchParams.get('test')
    const isTestMode = testKey === SECRET_TEST_KEY

    // Determine visibility status
    const isDecember = month === 11
    const isSecondHalf = day >= 15
    const isWrappedActive = isDecember && isSecondHalf
    const isComingSoon = isDecember && !isSecondHalf

    // If not December at all and not test mode, return 404
    if (!isDecember && !isTestMode) {
        throw error(404, 'Wrapped is only available in December')
    }

    // If coming soon period and not test mode, don't load awards
    if (isComingSoon && !isTestMode) {
        return {
            isComingSoon: true,
            isWrappedActive: false,
            awards: [],
            year: currentYear
        }
    }

    // Load awards
    const awards = await getAllWrappedAwards(currentYear)

    return {
        isComingSoon: false,
        isWrappedActive: true,
        awards,
        year: currentYear
    }
}
