import { renderToString } from 'react-dom/server';
import GlobalError from './global-error';

vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: React.ComponentProps<'a'>) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

describe('GlobalError (app/global-error.tsx)', () => {
  it('renders its own <html>/<body> around RouteError', () => {
    // Rendered to a string: it replaces the root layout, so it emits <html>,
    // which can't be mounted inside RTL's container <div>.
    const html = renderToString(
      <GlobalError error={Object.assign(new Error('boom'), { digest: 'abc123' })} />,
    );

    expect(html).toMatch(/^<html lang="en"/);
    expect(html).toContain('Something went wrong');
    expect(html).toContain('href="/"');
  });
});
