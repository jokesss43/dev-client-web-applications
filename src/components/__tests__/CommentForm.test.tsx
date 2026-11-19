import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CommentForm } from '@/components/CommentForm';
import { useCommentsStore } from '@/store/commentsStore';

describe('Компонент CommentForm (Проверка валидации Zod и отправки)', () => {
  const addCommentMock = vi.fn();

  beforeEach(() => {
    addCommentMock.mockReset();
    useCommentsStore.setState({
      currentUser: { id: 2, username: 'alex_test', name: 'Алексей', role: 'user' },
      editingComment: null,
      isMutating: false,
      addComment: addCommentMock,
    });
  });

  // Требование 2: Форма показывает сообщение Zod при неверном вводе
  it('4. Показывает сообщение Zod об ошибке при слишком коротком тексте и спам-словах', async () => {
    const user = userEvent.setup();
    render(<CommentForm />);

    const bodyInput = screen.getByPlaceholderText(/Напишите комментарий/i);
    const submitBtn = screen.getByRole('button', { name: /Опубликовать/i });

    // Слишком короткий текст (меньше 5 символов)
    await user.clear(bodyInput);
    await user.type(bodyInput, 'Hi');
    await user.click(submitBtn);

    expect(screen.getByText(/Текст комментария должен содержать минимум 5 символов/i)).toBeInTheDocument();
    expect(addCommentMock).not.toHaveBeenCalled();

    // Проверка спам-слова из Zod схемы
    await user.clear(bodyInput);
    await user.type(bodyInput, 'Buy viagra right now!');
    await user.click(submitBtn);

    expect(screen.getByText(/Комментарий содержит недопустимые спам-слова/i)).toBeInTheDocument();
    expect(addCommentMock).not.toHaveBeenCalled();
  });

  // Требование 3: Форма вызывает нужный обработчик при корректном вводе
  it('5. Вызывает функцию addComment с корректными данными при валидном заполнении', async () => {
    const user = userEvent.setup();
    addCommentMock.mockResolvedValue({ success: true });

    render(<CommentForm />);

    const bodyInput = screen.getByPlaceholderText(/Напишите комментарий/i);
    const submitBtn = screen.getByRole('button', { name: /Опубликовать/i });

    await user.clear(bodyInput);
    await user.type(bodyInput, 'Отличная статья и полезные мысли!');
    await user.click(submitBtn);

    expect(addCommentMock).toHaveBeenCalledWith({
      username: 'alex_test',
      postId: 1,
      body: 'Отличная статья и полезные мысли!',
      userId: 2,
    });
  });
});
