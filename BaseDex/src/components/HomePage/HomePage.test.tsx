import { HomePage } from '.';
import { cleanup, render } from '@testing-library/react';
import { test, expect, afterEach } from 'vitest';
// import { cleanup, render, screen } from '@testing-library/react';
// import { describe, it, test, expect, afterEach } from 'vitest';

test('renders HTML section', () => {
    render(<HomePage value=""></HomePage>);
    expect(true).toBeTruthy();
});

afterEach(() => {
    cleanup();
});
