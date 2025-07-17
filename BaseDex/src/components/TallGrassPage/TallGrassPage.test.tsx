import { TallGrassPage } from '.';
import { cleanup, render } from '@testing-library/react';
import { test, expect, afterEach } from 'vitest';
// import { cleanup, render, screen } from '@testing-library/react';
// import { describe, it, test, expect, afterEach } from 'vitest';

test('renders HTML section', () => {
    render(<TallGrassPage></TallGrassPage>);
    expect(true).toBeTruthy();
});

afterEach(() => {
    cleanup();
});
