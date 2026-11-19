'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { createCommentApi, updateCommentApi, deleteCommentApi } from '@/services/comments';
import { CreateCommentSchema, UpdateCommentSchema } from '@/lib/validations/comment';
import { getCurrentUser } from '@/lib/auth';

export async function addCommentAction(rawData: unknown) {
  // 1. Role / Auth verification
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return { success: false, error: 'Доступ запрещен. Войдите в систему для добавления комментария (401)' };
  }

  // 2. Server-side Zod validation
  const validation = CreateCommentSchema.safeParse(rawData);
  if (!validation.success) {
    const errorMsg = validation.error.issues.map((i) => i.message).join(', ');
    return { success: false, error: errorMsg, validationErrors: validation.error.flatten().fieldErrors };
  }

  try {
    const created = await createCommentApi(validation.data);
    revalidateTag('comments', 'default');
    revalidatePath('/');
    return { success: true, comment: created };
  } catch (error: any) {
    return { success: false, error: error.message || 'Ошибка при добавлении комментария' };
  }
}

export async function editCommentAction(rawData: unknown) {
  // 1. Role / Auth verification
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return { success: false, error: 'Доступ запрещен. Войдите в систему для редактирования комментария (401)' };
  }

  // 2. Server-side Zod validation
  const validation = UpdateCommentSchema.safeParse(rawData);
  if (!validation.success) {
    const errorMsg = validation.error.issues.map((i) => i.message).join(', ');
    return { success: false, error: errorMsg, validationErrors: validation.error.flatten().fieldErrors };
  }

  try {
    const updated = await updateCommentApi(validation.data);
    revalidateTag('comments', 'default');
    revalidateTag(`comment-${validation.data.id}`, 'default');
    revalidatePath('/');
    revalidatePath(`/comments/${validation.data.id}`);
    return { success: true, comment: updated };
  } catch (error: any) {
    return { success: false, error: error.message || 'Ошибка при обновлении комментария' };
  }
}

export async function deleteCommentAction(id: number) {
  // 1. Role / Auth verification (RBAC: ONLY ADMIN)
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return { success: false, error: 'Требуется аутентификация (401)' };
  }

  if (currentUser.role !== 'admin') {
    return { success: false, error: 'Доступ запрещен. Удаление комментариев разрешено только администраторам (403)' };
  }

  try {
    await deleteCommentApi(id);
    revalidateTag('comments', 'default');
    revalidatePath('/');
    return { success: true, id };
  } catch (error: any) {
    return { success: false, error: error.message || 'Ошибка при удалении комментария' };
  }
}
