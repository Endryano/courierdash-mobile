import { describe, expect, test } from '@jest/globals';
import { render, screen } from '@testing-library/react-native';

import Index from '@/app/index';

describe('Index', () => {
  test('renders the foundation label', async () => {
    await render(<Index />);

    expect(screen.getByText('CourierDash Mobile')).toBeTruthy();
  });
});
