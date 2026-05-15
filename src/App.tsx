/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useEffect, useMemo, useState } from 'react';
import { UserWarning } from './UserWarning';
import { getTodos, USER_ID } from './api/todos';
import cn from 'classnames';
import { Todo } from './types/Todo';
import { FilterOptions } from './types/FilterOptions';

export const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<FilterOptions>('All');
  const [errorMassage, setErrorMassage] = useState('');

  const filterOptions: FilterOptions[] = ['All', 'Active', 'Completed'];

  const incompleteTodosCount = useMemo(
    () => todos.filter(todo => !todo.completed).length,
    [todos],
  );

  const filteredTodos = useMemo(
    () =>
      todos.filter(todo => {
        switch (selectedFilter) {
          case 'Active':
            return !todo.completed;

          case 'Completed':
            return todo.completed;

          default:
            return true;
        }
      }),
    [selectedFilter, todos],
  );

  useEffect(() => {
    const loadTodos = async () => {
      try {
        const data = await getTodos();

        setTodos(data);
      } catch (error) {
        setErrorMassage('Unable to load todos');
      } finally {
      }
    };

    loadTodos();
  }, []);

  useEffect(() => {
    if (!errorMassage) {
      return;
    }

    const hideErrorTimeout = window.setTimeout(() => {
      setErrorMassage('');
    }, 3000);

    return () => {
      clearTimeout(hideErrorTimeout);
    };
  }, [errorMassage]);

  if (!USER_ID) {
    return <UserWarning />;
  }

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <header className="todoapp__header">
          {!!todos.length && (
            <button
              type="button"
              className={cn(
                'todoapp__toggle-all',
                incompleteTodosCount && 'active',
              )}
              data-cy="ToggleAllButton"
            />
          )}

          {/* Add a todo on form submit */}
          <form>
            <input
              value={searchValue}
              onChange={e => {
                setSearchValue(e.target.value);
              }}
              data-cy="NewTodoField"
              type="text"
              className="todoapp__new-todo"
              placeholder="What needs to be done?"
            />
          </form>
        </header>

        <section className="todoapp__main" data-cy="TodoList"></section>

        {!!todos.length &&
          filteredTodos.map(todo => (
            <div
              key={todo.id}
              data-cy="Todo"
              className={cn('todo', todo.completed && 'completed')}
            >
              <label className="todo__status-label">
                <input
                  data-cy="TodoStatus"
                  type="checkbox"
                  className="todo__status"
                  checked={todo.completed}
                />
              </label>
              <span data-cy="TodoTitle" className="todo__title">
                {todo.title}
              </span>
              <button
                type="button"
                className="todo__remove"
                data-cy="TodoDelete"
              >
                ×
              </button>
              {/* overlay will cover the todo while it is being deleted or updated */}
              {/* TEMPORARY FALSE */}
              <div
                data-cy="TodoLoader"
                className={cn('modal', 'overlay', false && 'is-active')}
              >
                <div className="modal-background has-background-white-ter" />
                <div className="loader" />
              </div>
            </div>
          ))}

        {!!todos.length && (
          <footer className="todoapp__footer" data-cy="Footer">
            <span className="todo-count" data-cy="TodosCounter">
              {incompleteTodosCount} items left
            </span>

            <nav className="filter" data-cy="Filter">
              {filterOptions.map(option => (
                <a
                  key={option}
                  onClick={() => setSelectedFilter(option)}
                  href={`#/${option === 'All' ? '' : option}`}
                  className={cn(
                    'filter__link',
                    selectedFilter === option && 'selected',
                  )}
                  data-cy={`FilterLink${option}`}
                >
                  {option}
                </a>
              ))}
            </nav>

            {/* this button should be disabled if there are no completed todos */}
            <button
              type="button"
              className="todoapp__clear-completed"
              data-cy="ClearCompletedButton"
            >
              Clear completed
            </button>
          </footer>
        )}
      </div>

      <div
        data-cy="ErrorNotification"
        className={cn(
          'notification',
          'is-danger',
          'is-light',
          'has-text-weight-normal',
          !errorMassage && 'hidden',
        )}
      >
        <button
          onClick={() => setErrorMassage('')}
          data-cy="HideErrorButton"
          type="button"
          className="delete"
        />
        {errorMassage}
      </div>
    </div>
  );
};
