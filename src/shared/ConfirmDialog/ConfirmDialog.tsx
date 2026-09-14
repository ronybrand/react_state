import { forwardRef, useImperativeHandle, useRef } from 'react';

export interface ConfirmDialogHandle {
  open(): void;
}

interface ConfirmDialogProps {
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

// Native <dialog> instead of window.confirm() - accessible by default
// (focus trapped inside the modal, Escape closes via the native cancel
// event, implicit role) without needing a modal library just for this.
export const ConfirmDialog = forwardRef<ConfirmDialogHandle, ConfirmDialogProps>(
  function ConfirmDialog({ message, onConfirm, onCancel }, ref) {
    const dialogRef = useRef<HTMLDialogElement>(null);

    useImperativeHandle(ref, () => ({
      open: () => dialogRef.current?.showModal(),
    }));

    function handleConfirm() {
      dialogRef.current?.close();
      onConfirm();
    }

    function handleCancel() {
      dialogRef.current?.close();
      onCancel?.();
    }

    return (
      <dialog
        ref={dialogRef}
        aria-label={message}
        onCancel={() => onCancel?.()}
        className="rounded-lg p-5 shadow-xl backdrop:bg-black/50"
      >
        <p>{message}</p>
        <div className="mt-3 text-right">
          <button
            type="button"
            onClick={handleCancel}
            className="mr-1 rounded bg-gray-100 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="bg-danger rounded px-3 py-1.5 text-sm text-white hover:opacity-90"
          >
            Confirm
          </button>
        </div>
      </dialog>
    );
  },
);
