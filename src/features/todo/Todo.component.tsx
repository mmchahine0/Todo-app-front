import type { TodoInput } from "./Todo.types";
import {
  getTodosByUserId,
  createTodo,
  updateTodo,
  deleteTodo,
} from "./Todo.service";
import { useRef, useCallback, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/persist/persist";
import { useToast } from "@/hooks/use-toast";
import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "../../lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Helmet } from "react-helmet-async";

const ITEMS_PER_PAGE = 6;

const TodoDashboard = () => {
  const { toast } = useToast();
  const accessToken = useSelector(
    (state: RootState) => state.auth?.accessToken
  );
  // Filter state
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "completed"
  >("all");

  // Input state for new todo
  const [inputTodos, setInputTodos] = useState<TodoInput>({
    title: "",
    content: "",
    completed: false,
  });

  // Editing state
  const [editingTodo, setEditingTodo] = useState<{
    id: string;
    title: string;
    content: string;
  } | null>(null);

  const validateFields = (title: string, content: string): boolean => {
    if (!title.trim() || !content.trim()) {
      toast({
        title: "Validation Error",
        description: "Title and content cannot be empty",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  // Infinite Query for todos with filter
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    status,
  } = useInfiniteQuery({
    queryKey: ["todos", filterStatus],
    enabled: !!accessToken,
    queryFn: async ({ pageParam = 1 }) => {
      const response = await getTodosByUserId(accessToken, {
        page: pageParam,
        limit: ITEMS_PER_PAGE,
        status: filterStatus === "all" ? undefined : filterStatus,
      });
      return response;
    },
    getNextPageParam: (lastPage) => lastPage.pagination.nextPage,
    initialPageParam: 1,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (newTodo: TodoInput) => createTodo(newTodo, accessToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos", filterStatus] });
      toast({
        title: "Todo created",
        description: "Your todo has been created successfully.",
        duration: 2000,
      });
      setInputTodos({ title: "", content: "", completed: false });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create todo",
        variant: "destructive",
        duration: 2000,
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, todo }: { id: string; todo: TodoInput }) =>
      updateTodo(id, todo, accessToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos", filterStatus] });
      toast({
        title: "Todo updated",
        description: "Your todo has been updated successfully",
        duration: 2000,
      });
      setEditingTodo(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update todo",
        variant: "destructive",
        duration: 2000,
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTodo(id, accessToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos", filterStatus] });
      toast({
        title: "Todo deleted",
        description: "Your todo has been deleted successfully.",
        duration: 2000,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete todo",
        variant: "destructive",
        duration: 2000,
      });
    },
  });

  // Intersection Observer for infinite scrolling
  const observer = useRef<IntersectionObserver | null>(null);
  const lastTodoElementRef = useCallback(
    (node: HTMLLIElement | null) => {
      if (isFetchingNextPage) return;

      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      });

      if (node) observer.current.observe(node);
    },
    [isFetchingNextPage, hasNextPage, fetchNextPage]
  );

  // Handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputTodos((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (editingTodo) {
      setEditingTodo({
        ...editingTodo,
        [name]: value,
      });
    }
  };

  const handleCreateTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateFields(inputTodos.title, inputTodos.content)) {
      return;
    }
    createMutation.mutate(inputTodos);
  };

  const handleUpdateTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTodo) return;

    const originalTodo = data?.pages
      .flatMap((page) => page.data)
      .find((todo) => todo.id === editingTodo.id);

    if (!originalTodo) return;

    // Check if title or content has changed
    if (
      editingTodo.title === originalTodo.title &&
      editingTodo.content === originalTodo.content
    ) {
      toast({
        title: "No changes",
        description: "No modifications were made to the todo",
        variant: "destructive",
        duration: 2000,
      });
      setEditingTodo(null);
      return;
    }

    updateMutation.mutate({
      id: editingTodo.id,
      todo: {
        title: editingTodo.title,
        content: editingTodo.content,
        completed: originalTodo.completed,
      },
    });
  };

  const handleToggleComplete = (todoId: string, currentStatus: boolean) => {
    const todo = data?.pages
      .flatMap((page) => page.data)
      .find((t) => t.id === todoId);

    if (!todo) return;

    updateMutation.mutate({
      id: todoId,
      todo: {
        ...todo,
        completed: !currentStatus,
      },
    });
  };

  const handleFilterChange = (newStatus: "all" | "active" | "completed") => {
    setFilterStatus(newStatus);
  };

  // Flatten todos from all pages
  const todos = data?.pages.flatMap((page) => page.data) ?? [];
  const totalItems = data?.pages[0]?.pagination.totalItems ?? 0;

  return (
    <>
      <Helmet>
        <title>Todo Dashboard | Your App</title>
        <meta name="description" content="Manage your todos efficiently" />
      </Helmet>

      <main className="max-w-4xl mx-auto p-4 md:p-6">
        <h1
          className="text-2xl md:text-3xl font-bold mb-6"
          id="todo-dashboard-title"
        >
          Todo Dashboard
        </h1>

        {/* Create Todo Form */}
        <Card className="mb-6 p-4 md:p-6">
          <form
            onSubmit={handleCreateTodo}
            className="space-y-4 md:space-y-0 md:flex md:gap-4"
            aria-label="Create new todo"
          >
            <div className="flex-1 space-y-4 md:space-y-0 md:flex md:gap-4">
              <Input
                type="text"
                name="title"
                value={inputTodos.title}
                onChange={handleInputChange}
                placeholder="Todo title"
                className="w-full"
                aria-label="Todo title"
                required
              />
              <Input
                type="text"
                name="content"
                value={inputTodos.content}
                onChange={handleInputChange}
                placeholder="Todo description"
                className="w-full"
                aria-label="Todo description"
                required
              />
            </div>
            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="w-full md:w-auto bg-green-500 hover:bg-green-600 text-white"
              aria-busy={createMutation.isPending}
            >
              {createMutation.isPending ? "Adding..." : "Add Todo"}
            </Button>
          </form>
        </Card>

        {/* Filter Controls */}
        <div className="mb-6">
          <div
            className="flex flex-wrap gap-2"
            role="group"
            aria-label="Filter todos"
          >
            {(["all", "active", "completed"] as const).map((status) => (
              <Button
                key={status}
                onClick={() => handleFilterChange(status)}
                className={`flex-1 md:flex-none ${
                  filterStatus === status
                    ? "bg-green-500 text-white"
                    : "bg-green-100 hover:bg-green-200 text-green-800"
                }`}
                aria-pressed={filterStatus === status}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Todo List */}
        {isLoading ? (
          <div
            className="flex justify-center p-8"
            role="status"
            aria-label="Loading todos"
          >
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500" />
          </div>
        ) : (
          <>
            <ul className="space-y-4" aria-label="Todo list" role="list">
              {todos.map((todo, index) => (
                <li
                  key={todo.id}
                  ref={index === todos.length - 1 ? lastTodoElementRef : null}
                  className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                >
                  <Card className="p-4">
                    {editingTodo && editingTodo.id === todo.id ? (
                      <form
                        onSubmit={handleUpdateTodo}
                        className="space-y-4"
                        aria-label={`Edit todo: ${todo.title}`}
                      >
                        <div className="space-y-4 md:space-y-0 md:flex md:gap-4">
                          <Input
                            type="text"
                            name="title"
                            value={editingTodo.title}
                            onChange={handleEditInputChange}
                            className="w-full"
                            aria-label="Edit todo title"
                          />
                          <Input
                            type="text"
                            name="content"
                            value={editingTodo.content}
                            onChange={handleEditInputChange}
                            className="w-full"
                            aria-label="Edit todo description"
                          />
                        </div>
                        <div className="flex gap-2 justify-end">
                          <Button
                            type="submit"
                            disabled={updateMutation.isPending}
                            className="bg-green-500 hover:bg-green-600 text-white"
                          >
                            {updateMutation.isPending ? "Saving..." : "Save"}
                          </Button>
                          <Button
                            type="button"
                            onClick={() => setEditingTodo(null)}
                            className="bg-gray-500 hover:bg-gray-600 text-white"
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    ) : (
                      <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
                        <div className="flex items-start md:items-center flex-1 gap-3">
                          <input
                            type="checkbox"
                            checked={todo.completed}
                            onChange={() =>
                              handleToggleComplete(todo.id, todo.completed)
                            }
                            className="mt-1 md:mt-0 h-4 w-4 rounded border-gray-300"
                            aria-label={`Mark "${todo.title}" as ${
                              todo.completed ? "incomplete" : "complete"
                            }`}
                            disabled={updateMutation.isPending}
                          />
                          <div
                            className={`flex-1 ${
                              todo.completed ? "line-through text-gray-500" : ""
                            }`}
                          >
                            <h3 className="font-medium">{todo.title}</h3>
                            <p className="text-sm text-gray-600">
                              {todo.content}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-8">
                          <Button
                            onClick={() =>
                              setEditingTodo({
                                id: todo.id,
                                title: todo.title,
                                content: todo.content,
                              })
                            }
                            className="bg-green-500 hover:bg-green-600 text-white"
                            aria-label={`Edit "${todo.title}"`}
                          >
                            Edit
                          </Button>
                          <Button
                            onClick={() => deleteMutation.mutate(todo.id)}
                            disabled={deleteMutation.isPending}
                            className="bg-red-500 hover:bg-red-600 text-white"
                            aria-label={`Delete "${todo.title}"`}
                          >
                            {deleteMutation.isPending
                              ? "Deleting..."
                              : "Delete"}
                          </Button>
                        </div>
                      </div>
                    )}
                  </Card>
                </li>
              ))}
            </ul>

            {status === "error" && (
              <div
                className="text-center py-8 text-red-500"
                role="alert"
                aria-live="polite"
              >
                Error loading todos. Please try again.
              </div>
            )}

            {!isLoading && todos.length === 0 && (
              <div className="text-center py-8 text-gray-500" role="status">
                {filterStatus === "all"
                  ? "No todos found. Create one to get started!"
                  : `No ${filterStatus} todos found.`}
              </div>
            )}

            {todos.length > 0 && (
              <div
                className="text-center mt-6 text-gray-600"
                aria-live="polite"
              >
                Showing {todos.length} of {totalItems} items
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
};

export default TodoDashboard;
