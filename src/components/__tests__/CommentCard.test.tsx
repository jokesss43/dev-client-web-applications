import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CommentCard } from '@/components/CommentCard';
import { useCommentsStore } from '@/store/commentsStore';
import { Comment } from '@/types/comment';

const mockComment: Comment = {
  id: 42,
  body: 'Информативный тестовый комментарий для проверки RTL',
  postId: 10,
  likes: 7,
  user: {
    id: 5,
    username: 'tester_user',
    fullName: 'Иван Тестеров',
  },
};

describe('Компонент CommentCard (Проверка отображения и ролей RBAC)', () => {
  beforeEach(() => {
    // Reset zustand store state
    useCommentsStore.setState({
      currentUser: null,
      isMutating: false,
      editingComment: null,
      comments: [mockComment],
    });
    vi.restoreAllMocks();
  });

  // Требование 1: Компонент отображает переданные данные
  it('1. Корректно отображает текст, автора, имя, ID поста и количество лайков', () => {
    render(<CommentCard comment={mockComment} />);

    expect(screen.getByText('Информативный тестовый комментарий для проверки RTL')).toBeInTheDocument();
    expect(screen.getByText('@tester_user')).toBeInTheDocument();
    expect(screen.getByText('(Иван Тестеров)')).toBeInTheDocument();
    expect(screen.getByText('Post #10')).toBeInTheDocument();
    expect(screen.getByText(/7 лайков/i)).toBeInTheDocument();
  });

  // Требование 4: Обычный пользователь не видит действие, доступное только администратору (удаление)
  it('2. Обычный пользователь (role: "user") НЕ видит кнопку удаления', () => {
    useCommentsStore.setState({
      currentUser: { id: 2, username: 'alex', name: 'Алексей', role: 'user' },
    });

    render(<CommentCard comment={mockComment} />);

    // Кнопка редактирования должна быть доступна
    expect(screen.getByLabelText(/Редактировать комментарий 42/i)).toBeInTheDocument();

    // Кнопка удаления ДОЛЖНА ОТСУТСТВОВАТЬ в DOM
    expect(screen.queryByLabelText(/Удалить комментарий 42/i)).not.toBeInTheDocument();
  });

  // Требование 5: Администратор видит действие (удаление) и может его вызвать
  it('3. Администратор (role: "admin") видит кнопку удаления и может вызвать удаление', async () => {
    const user = userEvent.setup();
    const deleteCommentMock = vi.fn().mockResolvedValue({ success: true });

    useCommentsStore.setState({
      currentUser: { id: 1, username: 'admin', name: 'Админ', role: 'admin' },
      deleteComment: deleteCommentMock,
    });

    vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(<CommentCard comment={mockComment} />);

    // Кнопка удаления видна админу
    const deleteBtn = screen.getByLabelText(/Удалить комментарий 42/i);
    expect(deleteBtn).toBeInTheDocument();

    await user.click(deleteBtn);

    expect(window.confirm).toHaveBeenCalledWith(expect.stringContaining('#42'));
    expect(deleteCommentMock).toHaveBeenCalledWith(42);
  });
});
