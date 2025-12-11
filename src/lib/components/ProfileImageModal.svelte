<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import UserAvatar from './UserAvatar.svelte';

    export let isOpen = false;
    export let currentImageUrl: string | null = null;
    export let username: string;

    type InputMode = 'url' | 'file';

    let inputMode: InputMode = 'file';
    let imageUrl = currentImageUrl || '';
    let selectedFile: File | null = null;
    let filePreviewUrl: string | null = null;
    let isSubmitting = false;
    let previewError = false;
    let uploadError: string | null = null;

    const dispatch = createEventDispatcher();

    $: if (isOpen) {
        imageUrl = currentImageUrl || '';
        selectedFile = null;
        filePreviewUrl = null;
        previewError = false;
        uploadError = null;
        inputMode = 'file';
    }

    function close() {
        dispatch('close');
    }

    async function handleSubmit() {
        isSubmitting = true;
        uploadError = null;

        try {
            if (inputMode === 'file' && selectedFile) {
                const formData = new FormData();
                formData.append('file', selectedFile);

                const response = await fetch('/api/v1/profile-image/upload', {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();

                if (response.ok) {
                    dispatch('updated', { imageUrl: result.fileUrl });
                    close();
                } else {
                    uploadError = result.error || 'Upload failed';
                }
            } else {
                const response = await fetch('/api/v1/profile-image', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ imageUrl: imageUrl || null })
                });

                if (response.ok) {
                    dispatch('updated', { imageUrl: imageUrl || null });
                    close();
                }
            }
        } finally {
            isSubmitting = false;
        }
    }

    function handleClear() {
        if (inputMode === 'file') {
            selectedFile = null;
            if (filePreviewUrl) {
                URL.revokeObjectURL(filePreviewUrl);
                filePreviewUrl = null;
            }
        } else {
            imageUrl = '';
        }
        previewError = false;
        uploadError = null;
    }

    function handleFileSelect(event: Event) {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];

        if (file) {
            if (filePreviewUrl) {
                URL.revokeObjectURL(filePreviewUrl);
            }

            selectedFile = file;
            filePreviewUrl = URL.createObjectURL(file);
            previewError = false;
            uploadError = null;
        }
    }

    function handlePreviewError() {
        previewError = true;
    }

    function handleBackdropClick(event: MouseEvent) {
        if (event.target === event.currentTarget) {
            close();
        }
    }

    function handleKeydown(event: KeyboardEvent) {
        if (event.key === 'Escape') {
            close();
        }
    }

    function switchMode(mode: InputMode) {
        inputMode = mode;
        previewError = false;
        uploadError = null;
    }

    $: previewSrc = inputMode === 'file' ? filePreviewUrl : imageUrl;
    $: hasPreview = inputMode === 'file' ? !!selectedFile : !!imageUrl;
    $: canSubmit = inputMode === 'file' ? !!selectedFile : true;
</script>

<svelte:window on:keydown={handleKeydown} />

{#if isOpen}
    <div class="modal-backdrop" on:click={handleBackdropClick} role="dialog" aria-modal="true">
        <div class="modal">
            <div class="modal-header">
                <h2>Change Profile Image</h2>
                <button class="close-button" on:click={close} aria-label="Close">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                </button>
            </div>

            <div class="modal-body">
                <div class="preview-section">
                    <span class="preview-label">Preview</span>
                    <div class="preview-container">
                        {#if previewSrc && !previewError}
                            <img
                                src={previewSrc}
                                alt="Preview"
                                class="preview-image"
                                on:error={handlePreviewError}
                            />
                        {:else}
                            <UserAvatar imageUrl={null} {username} size="5rem" />
                        {/if}
                    </div>
                    {#if previewError}
                        <span class="error-text">Could not load image</span>
                    {/if}
                </div>

                <div class="mode-tabs">
                    <button
                        class="mode-tab"
                        class:active={inputMode === 'file'}
                        on:click={() => switchMode('file')}
                        type="button"
                    >
                        Upload File
                    </button>
                    <button
                        class="mode-tab"
                        class:active={inputMode === 'url'}
                        on:click={() => switchMode('url')}
                        type="button"
                    >
                        Image URL
                    </button>
                </div>

                {#if inputMode === 'file'}
                    <div class="input-section">
                        <label for="file-input">Select Image</label>
                        <div class="file-input-row">
                            <input
                                id="file-input"
                                type="file"
                                accept="image/jpeg,image/png,image/gif,image/webp"
                                on:change={handleFileSelect}
                                class="file-input"
                            />
                            <label for="file-input" class="file-input-label">
                                {selectedFile ? selectedFile.name : 'Choose a file...'}
                            </label>
                            {#if selectedFile}
                                <button class="clear-button" on:click={handleClear} type="button">
                                    Clear
                                </button>
                            {/if}
                        </div>
                        <span class="hint">Accepted formats: JPEG, PNG, GIF, WebP. Max size: 5MB</span>
                        {#if uploadError}
                            <span class="error-text">{uploadError}</span>
                        {/if}
                    </div>
                {:else}
                    <div class="input-section">
                        <label for="image-url">Image URL</label>
                        <div class="input-row">
                            <input
                                id="image-url"
                                type="url"
                                bind:value={imageUrl}
                                placeholder="https://example.com/your-image.jpg"
                                on:input={() => previewError = false}
                            />
                            {#if imageUrl}
                                <button class="clear-button" on:click={handleClear} type="button">
                                    Clear
                                </button>
                            {/if}
                        </div>
                        <span class="hint">Enter a URL to an image. Leave empty to use the default icon.</span>
                    </div>
                {/if}
            </div>

            <div class="modal-footer">
                <button class="cancel-button" on:click={close} disabled={isSubmitting}>
                    Cancel
                </button>
                <button
                    class="save-button"
                    on:click={handleSubmit}
                    disabled={isSubmitting || previewError || !canSubmit}
                >
                    {isSubmitting ? 'Saving...' : 'Save'}
                </button>
            </div>
        </div>
    </div>
{/if}

<style lang="scss">
    .modal-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(255, 255, 255, 0.5);
        backdrop-filter: blur(1px);
        -webkit-backdrop-filter: blur(1px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    }

    .modal {
        background: white;
        border-radius: 12px;
        width: 90%;
        max-width: 450px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    }

    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.25rem 1.5rem;
        border-bottom: 1px solid #eee;

        h2 {
            margin: 0;
            font-size: 1.2rem;
            color: #333;
        }
    }

    .close-button {
        background: none;
        border: none;
        cursor: pointer;
        padding: 0.25rem;
        color: #666;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;

        &:hover {
            background: #f0f0f0;
            color: #333;
        }
    }

    .modal-body {
        padding: 1.5rem;
    }

    .preview-section {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-bottom: 1.5rem;

        .preview-label {
            font-size: 0.85rem;
            color: #666;
            margin-bottom: 0.75rem;
        }

        .preview-container {
            width: 5rem;
            height: 5rem;
            border-radius: 50%;
            overflow: hidden;
            background: #f0f0f0;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .preview-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .error-text {
            margin-top: 0.5rem;
            font-size: 0.85rem;
            color: #de3c4b;
        }
    }

    .mode-tabs {
        display: flex;
        gap: 0.5rem;
        margin-bottom: 1rem;
        border-bottom: 1px solid #eee;
        padding-bottom: 0.5rem;
    }

    .mode-tab {
        flex: 1;
        padding: 0.6rem 1rem;
        background: #f5f5f5;
        border: 1px solid #ddd;
        border-radius: 6px;
        cursor: pointer;
        font-size: 0.9rem;
        font-family: inherit;
        color: #666;
        transition: all 0.2s ease;

        &:hover:not(.active) {
            background: #eee;
        }

        &.active {
            background: $main-blue;
            border-color: $main-blue;
            color: white;
        }
    }

    .input-section {
        label {
            display: block;
            font-size: 0.9rem;
            font-weight: 500;
            color: #333;
            margin-bottom: 0.5rem;
        }

        .input-row,
        .file-input-row {
            display: flex;
            gap: 0.5rem;
        }

        input[type="url"] {
            flex: 1;
            padding: 0.75rem;
            border: 1px solid #ddd;
            border-radius: 8px;
            font-size: 0.9rem;
            font-family: inherit;

            &:focus {
                outline: none;
                border-color: $main-blue;
                box-shadow: 0 0 0 3px rgba($main-blue, 0.1);
            }
        }

        .file-input {
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            border: 0;
        }

        .file-input-label {
            flex: 1;
            padding: 0.75rem;
            border: 1px dashed #ccc;
            border-radius: 8px;
            font-size: 0.9rem;
            color: #666;
            cursor: pointer;
            text-overflow: ellipsis;
            overflow: hidden;
            white-space: nowrap;
            text-align: center;
            transition: all 0.2s ease;

            &:hover {
                border-color: $main-blue;
                background: rgba($main-blue, 0.05);
            }
        }

        .clear-button {
            padding: 0.75rem 1rem;
            background: #f0f0f0;
            border: 1px solid #ddd;
            border-radius: 8px;
            cursor: pointer;
            font-size: 0.9rem;
            color: #666;

            &:hover {
                background: #e5e5e5;
            }
        }

        .hint {
            display: block;
            margin-top: 0.5rem;
            font-size: 0.8rem;
            color: #888;
        }

        .error-text {
            display: block;
            margin-top: 0.5rem;
            font-size: 0.85rem;
            color: #de3c4b;
        }
    }

    .modal-footer {
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;
        padding: 1rem 1.5rem;
        border-top: 1px solid #eee;
    }

    .cancel-button {
        padding: 0.6rem 1.2rem;
        background: #f0f0f0;
        border: 1px solid #ddd;
        border-radius: 8px;
        cursor: pointer;
        font-size: 0.9rem;
        font-family: inherit;
        color: #333;

        &:hover:not(:disabled) {
            background: #e5e5e5;
        }

        &:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }
    }

    .save-button {
        padding: 0.6rem 1.2rem;
        background: $main-blue;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-size: 0.9rem;
        font-family: inherit;
        color: white;
        font-weight: 500;

        &:hover:not(:disabled) {
            background: darken($main-blue, 5%);
        }

        &:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }
    }
</style>
