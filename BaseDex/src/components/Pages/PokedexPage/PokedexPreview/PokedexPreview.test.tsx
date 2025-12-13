import { PokedexPreview } from '.';
import { cleanup, render } from '@testing-library/react';
import { test, expect, afterEach } from 'vitest';
import type { PokedexPreviewData } from '../../../../types/pokdexPreviewData';
// import { cleanup, render, screen } from '@testing-library/react';
// import { describe, it, test, expect, afterEach } from 'vitest';

const test_data: PokedexPreviewData = {
    name: "pikachu",
    dex_no: 25,
    id: 25,
    img_url: "string",
    is_registered: false,
    img_data: new Blob
}

test('renders HTML section', () => {
    render(<PokedexPreview previewData={test_data}></PokedexPreview>);
    expect(true).toBeTruthy();
});

afterEach(() => {
    cleanup();
});
