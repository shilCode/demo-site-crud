export default function ConfirmDialog({ open, title, message, onConfirm, onCancel }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" data-testid="confirm-dialog">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4" role="dialog" aria-modal="true" aria-labelledby="confirm-dialog-title">
        <h2 className="text-lg font-bold mb-2" id="confirm-dialog-title" data-testid="confirm-dialog-title">
          {title}
        </h2>
        <p className="text-gray-600 mb-6" data-testid="confirm-dialog-message">
          {message}
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
            data-testid="confirm-cancel-button"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
            data-testid="confirm-delete-button"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
