<script lang="ts">
    import Icon from "$lib/components/Icon.svelte"

    export let baseUrl: string

    let copied = false
    let showInstructions = false

    $: calendarUrl = `${baseUrl}/api/v1/calendar/feed.ics`
    // Google Calendar requires webcal:// protocol for iCal subscriptions
    $: webcalUrl = calendarUrl.replace(/^https?:\/\//, 'webcal://')
    $: googleCalendarUrl = `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(webcalUrl)}`

    async function copyToClipboard() {
        try {
            await navigator.clipboard.writeText(calendarUrl)
            copied = true
            setTimeout(() => {
                copied = false
            }, 2000)
        } catch (err) {
            console.error("Failed to copy:", err)
        }
    }
</script>

<div class="calendar-subscribe">
    <div class="calendar-header">
        <Icon type="calendar-mark" />
        <h3>Subscribe to Film Club Calendar</h3>
    </div>

    <p class="calendar-description">
        Get automatic updates when new films are scheduled. Add to your calendar and never miss a film night!
    </p>

    <div class="calendar-actions">
        <a href={googleCalendarUrl} target="_blank" rel="noopener noreferrer" class="calendar-button google">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
                <path d="M8 14h.01"></path>
                <path d="M12 14h.01"></path>
                <path d="M16 14h.01"></path>
                <path d="M8 18h.01"></path>
                <path d="M12 18h.01"></path>
                <path d="M16 18h.01"></path>
            </svg>
            <span>Add to Google Calendar</span>
        </a>

        <button class="calendar-button copy" on:click={copyToClipboard}>
            {#if copied}
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>Copied!</span>
            {:else}
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                <span>Copy Calendar URL</span>
            {/if}
        </button>
    </div>

    <button class="instructions-toggle" on:click={() => showInstructions = !showInstructions}>
        <span>{showInstructions ? 'Hide' : 'Show'} instructions for other apps</span>
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class:rotated={showInstructions}
        >
            <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
    </button>

    {#if showInstructions}
        <div class="instructions">
            <h4>Apple Calendar</h4>
            <ol>
                <li>Copy the calendar URL above</li>
                <li>Open Calendar app</li>
                <li>Go to File &gt; New Calendar Subscription</li>
                <li>Paste the URL and click Subscribe</li>
            </ol>

            <h4>Outlook</h4>
            <ol>
                <li>Copy the calendar URL above</li>
                <li>Go to Calendar &gt; Add Calendar &gt; From Internet</li>
                <li>Paste the URL and click OK</li>
            </ol>

            <h4>Other Calendar Apps</h4>
            <p>Look for "Subscribe to calendar" or "Add calendar from URL" option and paste the copied URL.</p>
        </div>
    {/if}
</div>

<style lang="scss">
    .calendar-subscribe {
        background: linear-gradient(135deg, $main-blue 0%, darken($main-blue, 8%) 100%);
        border-radius: 12px;
        padding: 1.5rem;
        margin: 1.5rem 0;
        color: #cadff4;
    }

    .calendar-header {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 0.75rem;

        h3 {
            margin: 0;
            font-size: 1.1rem;
            font-weight: 600;
            color: white;
        }
    }

    .calendar-description {
        margin: 0 0 1rem 0;
        font-size: 0.9rem;
        line-height: 1.5;
        opacity: 0.9;
    }

    .calendar-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 0.75rem;
        margin-bottom: 1rem;
    }

    .calendar-button {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.65rem 1rem;
        border: none;
        border-radius: 8px;
        font-size: 0.9rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        text-decoration: none;

        &.google {
            background: white;
            color: #1a73e8;

            &:hover {
                background: #f1f3f4;
                transform: translateY(-1px);
            }
        }

        &.copy {
            background: rgba(255, 255, 255, 0.15);
            color: white;
            border: 1px solid rgba(255, 255, 255, 0.3);

            &:hover {
                background: rgba(255, 255, 255, 0.25);
                transform: translateY(-1px);
            }
        }

        svg {
            flex-shrink: 0;
        }
    }

    .instructions-toggle {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        background: none;
        border: none;
        color: rgba(255, 255, 255, 0.8);
        font-size: 0.85rem;
        cursor: pointer;
        padding: 0.5rem 0;
        transition: color 0.2s ease;

        &:hover {
            color: white;
        }

        svg {
            transition: transform 0.2s ease;

            &.rotated {
                transform: rotate(180deg);
            }
        }
    }

    .instructions {
        background: rgba(0, 0, 0, 0.2);
        border-radius: 8px;
        padding: 1rem;
        margin-top: 0.5rem;
        font-size: 0.85rem;

        h4 {
            margin: 0 0 0.5rem 0;
            font-size: 0.9rem;
            color: white;

            &:not(:first-child) {
                margin-top: 1rem;
            }
        }

        ol {
            margin: 0;
            padding-left: 1.25rem;

            li {
                margin-bottom: 0.25rem;
                line-height: 1.4;
            }
        }

        p {
            margin: 0;
            line-height: 1.4;
        }
    }
</style>
