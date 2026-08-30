import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StateForm } from './StateForm';

describe('StateForm', () => {
  it('keeps the save button disabled while the form is invalid', () => {
    render(<StateForm onSubmitState={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
  });

  it('enables the save button when abbreviation and name are valid', async () => {
    const user = userEvent.setup();
    render(<StateForm onSubmitState={vi.fn()} />);

    await user.type(screen.getByLabelText('Abbreviation'), 'SP');
    await user.type(screen.getByLabelText('Name'), 'São Paulo');
    await user.tab();

    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled();
  });

  it('marks the abbreviation as invalid and links the error message via aria-describedby', async () => {
    const user = userEvent.setup();
    render(<StateForm onSubmitState={vi.fn()} />);

    const abbreviation = screen.getByLabelText('Abbreviation');
    await user.click(abbreviation);
    await user.tab();

    expect(abbreviation).toHaveAttribute('aria-invalid', 'true');
    expect(abbreviation).toHaveAttribute('aria-describedby', 'abbreviation-error');
    expect(screen.getByText('Enter the state abbreviation.')).toBeInTheDocument();
  });

  it('keeps the button disabled when the disabled prop is true, even with a valid form', async () => {
    const user = userEvent.setup();
    render(
      <StateForm
        initialValues={{ abbreviation: 'SP', name: 'São Paulo' }}
        disabled
        onSubmitState={vi.fn()}
      />,
    );

    await user.click(screen.getByLabelText('Name'));
    await user.tab();

    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
  });

  it('calls onSubmitState with the form data on submit', async () => {
    const user = userEvent.setup();
    const onSubmitState = vi.fn();
    render(<StateForm onSubmitState={onSubmitState} />);

    await user.type(screen.getByLabelText('Abbreviation'), 'RJ');
    await user.type(screen.getByLabelText('Name'), 'Rio de Janeiro');
    await user.tab();
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(onSubmitState).toHaveBeenCalledWith(
      { abbreviation: 'RJ', name: 'Rio de Janeiro' },
      expect.anything(),
    );
  });
});
