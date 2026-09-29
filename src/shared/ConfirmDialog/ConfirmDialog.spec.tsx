import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfirmDialog, type ConfirmDialogHandle } from './ConfirmDialog';

describe('ConfirmDialog', () => {
  function getDialog(): HTMLDialogElement {
    return document.querySelector('dialog')!;
  }

  it('renders the given message', () => {
    render(<ConfirmDialog message="Delete SP?" onConfirm={vi.fn()} />);

    expect(screen.getByText('Delete SP?')).toBeInTheDocument();
  });

  it('starts closed', () => {
    render(<ConfirmDialog message="Delete SP?" onConfirm={vi.fn()} />);

    expect(getDialog().open).toBe(false);
  });

  it('open() opens the dialog as a modal', () => {
    const ref = createRef<ConfirmDialogHandle>();
    render(<ConfirmDialog ref={ref} message="Delete SP?" onConfirm={vi.fn()} />);

    ref.current?.open();

    expect(getDialog().open).toBe(true);
  });

  it('calls onConfirm and closes the dialog when the confirm button is clicked', async () => {
    const user = userEvent.setup();
    const ref = createRef<ConfirmDialogHandle>();
    const onConfirm = vi.fn();
    render(<ConfirmDialog ref={ref} message="Delete SP?" onConfirm={onConfirm} />);
    ref.current?.open();

    await user.click(screen.getByRole('button', { name: 'Confirm' }));

    expect(onConfirm).toHaveBeenCalled();
    expect(getDialog().open).toBe(false);
  });

  it('calls onCancel and closes the dialog when the cancel button is clicked', async () => {
    const user = userEvent.setup();
    const ref = createRef<ConfirmDialogHandle>();
    const onCancel = vi.fn();
    render(
      <ConfirmDialog ref={ref} message="Delete SP?" onConfirm={vi.fn()} onCancel={onCancel} />,
    );
    ref.current?.open();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onCancel).toHaveBeenCalled();
    expect(getDialog().open).toBe(false);
  });

  it('calls onCancel when the dialog is dismissed via the native cancel event (Escape)', () => {
    const ref = createRef<ConfirmDialogHandle>();
    const onCancel = vi.fn();
    render(
      <ConfirmDialog ref={ref} message="Delete SP?" onConfirm={vi.fn()} onCancel={onCancel} />,
    );
    ref.current?.open();

    getDialog().dispatchEvent(new Event('cancel'));

    expect(onCancel).toHaveBeenCalled();
  });
});
