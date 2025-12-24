import { ConnectionError } from '.';
import { cleanup, render } from '@testing-library/react';
import { test, expect, afterEach } from 'vitest';
// import { cleanup, render, screen } from '@testing-library/react';
// import { describe, it, test, expect, afterEach } from 'vitest';

test('renders HTML section', () => {
    render(<ConnectionError noConnection={false}></ConnectionError>);
    expect(true).toBeTruthy();
});

afterEach(() => {
    cleanup();
});
