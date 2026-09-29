import { screen } from '@testing-library/react';
import { Footer } from './Footer';
import { infoService } from '../../services/infoService';
import { renderWithProviders } from '../../testUtils';

vi.mock('../../services/infoService', () => ({
  infoService: {
    getFrontendVersion: vi.fn(),
    getBackendInfo: vi.fn(),
  },
}));

describe('Footer', () => {
  beforeEach(() => {
    vi.mocked(infoService.getFrontendVersion).mockReset();
    vi.mocked(infoService.getBackendInfo).mockReset();
  });

  it('shows the frontend and backend commit once both resolve', async () => {
    vi.mocked(infoService.getFrontendVersion).mockResolvedValue({
      commit: 'abc1234',
      buildDate: '2024-01-01T10:00:00Z',
    });
    vi.mocked(infoService.getBackendInfo).mockResolvedValue({
      build: { commit: 'def5678', time: '2024-01-02T10:00:00Z' },
    });

    renderWithProviders(<Footer />);

    expect(await screen.findByText(/front abc1234/)).toBeInTheDocument();
    expect(screen.getByText(/back def5678/)).toBeInTheDocument();
  });

  it('renders nothing when both the frontend and backend info fail to load', async () => {
    vi.mocked(infoService.getFrontendVersion).mockRejectedValue(new Error('failed'));
    vi.mocked(infoService.getBackendInfo).mockRejectedValue(new Error('failed'));

    const { container } = renderWithProviders(<Footer />);

    await vi.waitFor(() => expect(container).toBeEmptyDOMElement());
  });

  it('shows only the frontend commit when the backend info fails to load', async () => {
    vi.mocked(infoService.getFrontendVersion).mockResolvedValue({
      commit: 'abc1234',
      buildDate: '2024-01-01T10:00:00Z',
    });
    vi.mocked(infoService.getBackendInfo).mockRejectedValue(new Error('failed'));

    renderWithProviders(<Footer />);

    expect(await screen.findByText(/front abc1234/)).toBeInTheDocument();
    expect(screen.queryByText(/back /)).not.toBeInTheDocument();
  });
});
