import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StateForm } from './StateForm';

describe('StateForm', () => {
  it('keeps the save button disabled while the form is invalid', () => {
    render(<StateForm onSubmitState={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
  });

  it('enables the save button and shows no errors when abbreviation and name are valid', async () => {
    const user = userEvent.setup();
    render(<StateForm onSubmitState={vi.fn()} />);

    await user.type(screen.getByLabelText('Abbreviation'), 'SP');
    await user.type(screen.getByLabelText('Name'), 'São Paulo');
    await user.tab();

    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled();
    expect(
      screen.queryByText('Enter the state abbreviation with 2 letters.'),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText('Enter the state name with at least 3 characters.'),
    ).not.toBeInTheDocument();
  });

  it('marks the abbreviation as invalid and links the error message via aria-describedby', async () => {
    const user = userEvent.setup();
    render(<StateForm onSubmitState={vi.fn()} />);

    const abbreviation = screen.getByLabelText('Abbreviation');
    await user.click(abbreviation);
    await user.tab();

    expect(abbreviation).toHaveAttribute('aria-invalid', 'true');
    expect(abbreviation).toHaveAttribute('aria-describedby', 'abbreviation-error');
    expect(screen.getByText('Enter the state abbreviation with 2 letters.')).toBeInTheDocument();
  });

  it('marks the name as invalid and shows the min-length message', async () => {
    const user = userEvent.setup();
    render(<StateForm onSubmitState={vi.fn()} />);

    const name = screen.getByLabelText('Name');
    await user.type(name, 'AB');
    await user.tab();

    expect(name).toHaveAttribute('aria-invalid', 'true');
    expect(
      screen.getByText('Enter the state name with at least 3 characters.'),
    ).toBeInTheDocument();
  });

  it('shows the max-length message when the name is too long', async () => {
    const user = userEvent.setup();
    render(<StateForm onSubmitState={vi.fn()} />);

    const name = screen.getByLabelText('Name');
    await user.type(name, 'A'.repeat(101));
    await user.tab();

    expect(
      screen.getByText('Enter the state name with at most 100 characters.'),
    ).toBeInTheDocument();
  });

  it('revalidates on every keystroke after the field has been touched once', async () => {
    const user = userEvent.setup();
    render(<StateForm onSubmitState={vi.fn()} />);

    const abbreviation = screen.getByLabelText('Abbreviation');
    await user.type(abbreviation, 'S');
    await user.tab();
    expect(screen.getByText('Enter the state abbreviation with 2 letters.')).toBeInTheDocument();

    await user.click(abbreviation);
    await user.type(abbreviation, 'P');

    expect(
      screen.queryByText('Enter the state abbreviation with 2 letters.'),
    ).not.toBeInTheDocument();
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

  it('keeps the save button disabled when the form values match initialValues', async () => {
    const user = userEvent.setup();
    render(
      <StateForm
        initialValues={{ abbreviation: 'SP', name: 'São Paulo' }}
        onSubmitState={vi.fn()}
      />,
    );

    await user.click(screen.getByLabelText('Name'));
    await user.tab();

    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
  });

  it('enables the save button when the form values differ from initialValues', async () => {
    const user = userEvent.setup();
    render(
      <StateForm
        initialValues={{ abbreviation: 'SP', name: 'São Paulo' }}
        onSubmitState={vi.fn()}
      />,
    );

    await user.type(screen.getByLabelText('Name'), ' Antigo');
    await user.tab();

    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled();
  });

  it('enables the save button when only abbreviation differs from initialValues', async () => {
    const user = userEvent.setup();
    render(
      <StateForm
        initialValues={{ abbreviation: 'SP', name: 'São Paulo' }}
        onSubmitState={vi.fn()}
      />,
    );

    const abbreviation = screen.getByLabelText('Abbreviation');
    await user.clear(abbreviation);
    await user.type(abbreviation, 'RJ');
    await user.tab();

    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled();
  });

  it('shows a specific message when the abbreviation duplicates an existing one', async () => {
    const user = userEvent.setup();
    render(<StateForm existingAbbreviations={['SP', 'RJ']} onSubmitState={vi.fn()} />);

    await user.type(screen.getByLabelText('Abbreviation'), 'SP');
    await user.tab();

    expect(screen.getByText('A state with this abbreviation already exists.')).toBeInTheDocument();
  });

  it('does not flag a duplicate when the abbreviation matches initialValues (editing without changing it)', async () => {
    const user = userEvent.setup();
    render(
      <StateForm
        initialValues={{ abbreviation: 'SP', name: 'São Paulo' }}
        existingAbbreviations={['SP', 'RJ']}
        onSubmitState={vi.fn()}
      />,
    );

    await user.click(screen.getByLabelText('Name'));
    await user.tab();

    expect(
      screen.queryByText('A state with this abbreviation already exists.'),
    ).not.toBeInTheDocument();
  });

  it('uppercases the abbreviation as the user types', async () => {
    const user = userEvent.setup();
    render(<StateForm onSubmitState={vi.fn()} />);

    const abbreviation = screen.getByLabelText('Abbreviation');
    await user.type(abbreviation, 'sp');

    expect(abbreviation).toHaveValue('SP');
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
