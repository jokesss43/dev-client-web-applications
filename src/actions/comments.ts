'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { createCommentApi, updateCommentApi, deleteCommentApi } from '@/services/comments';
import { CreateCommentInput, UpdateCommentInput } from '@/types/comment';

export async function addCommentAction(input: CreateCommentInput) {
  if (!input.body?.trim() || !input.username?.trim()) {
    return { success: false, error: 'Поля "Имя пользователя" и "Текст комментария" обязательны' };
  }

  try {
    const created = await createCommentApi(input);
    revalidateTag('comments', 'default');
    revalidatePath('/');
    return { success: true, comment: created };
  } catch (error: any) {
    return { success: false, error: error.message || 'Ошибка при добавлении комментария' };
  }
}

export async function editCommentAction(input: UpdateCommentInput) {
  if (!input.body?.trim()) {
    return { success: false, error: 'Текст комментария не может быть пустым' };
  }

  try {
    const updated = await updateCommentApi(input);
    revalidateTag('comments', 'default');
    revalidateTag(`comment-${input.id}`, 'default');
    revalidatePath('/');
    revalidatePath(`/comments/${input.id}`);
    return { success: true, comment: updated };
  } catch (error: any) {
    return { success: false, error: error.message || 'Ошибка при обновлении комментария' };
  }
}

export async function deleteCommentAction(id: number) {
  try {
    await deleteCommentApi(id);
    revalidateTag('comments', 'default');
    revalidatePath('/');
    return { success: true, id };
  } catch (error: any) {
    return { success: false, error: error.message || 'Ошибка при удалении комментария' };
  }
}
