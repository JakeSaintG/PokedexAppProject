import { NavigationMenu } from '.';
import { cleanup, render } from '@testing-library/react';
import { test, expect, afterEach } from 'vitest';
// import { cleanup, render, screen } from '@testing-library/react';
// import { describe, it, test, expect, afterEach } from 'vitest';

test('renders HTML section', () => {
    render(<NavigationMenu connectionError={false} activePage='here'></NavigationMenu>);
    expect(true).toBeTruthy();
});

afterEach(() => {
    cleanup();
});
