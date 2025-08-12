'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { confirmShippedAction } from './confirm-shipped-action';
import { useEffect } from 'react';
import toast from 'react-hot-toast';

const initialState: { success: boolean; message: string } = {
  success: false,
  message: '',
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed">
      {pending ? 'Подтверждение...' : 'Подтвердить отгрузку'}
    </button>
  );
}

export function ConfirmButton({ orderId }: { orderId: string }) {
  const confirmActionWithId = confirmShippedAction.bind(null, orderId);
  const [state, formAction] = useFormState(confirmActionWithId, initialState);

  useEffect(() => {
    // Логика onConfirm удалена, обновление происходит через revalidatePath.
    // Показываем только сообщение об ошибке.
    if (state?.message && !state.success) {
      toast.error(state.message);
    }
  }, [state]);

  // После успешного выполнения revalidatePath перерисует родительский компонент.
  // Поэтому нет необходимости показывать здесь сообщение об успехе.

  return (
    <form action={formAction}>
      <SubmitButton />
    </form>
  );
}
