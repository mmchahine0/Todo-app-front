import { TodoInput } from "./Todo.types";
import {
  getTodosByUserId,
  createTodo,
  updateTodo,
  deleteTodo,
} from "./Todo.service";
import { useRef, useCallback, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/persist/persist";
import { useToast } from "@/hooks/use-toast";
import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "../../lib/queryClient";

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
    createMutation.mutate(inputTodos);
  };

  const handleUpdateTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTodo) return;

    const originalTodo = data?.pages
      .flatMap((page) => page.data)
      .find((todo) => todo.id === editingTodo.id);

    if (!originalTodo) return;

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
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Todo List</h1>
      <div className="flex justify-between items-center mb-6">
        {/* Create Todo Form */}
        <form onSubmit={handleCreateTodo} className="mb-4">
          <input
            type="text"
            name="title"
            value={inputTodos.title}
            onChange={handleInputChange}
            placeholder="Title"
            className="border p-2 mr-2"
          />
          <input
            type="text"
            name="content"
            value={inputTodos.content}
            onChange={handleInputChange}
            placeholder="Content"
            className="border p-2 mr-2"
          />
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
          >
            {createMutation.isPending ? "Adding..." : "Add Todo"}
          </button>
        </form>
        {/* Filter Controls */}
        <div className="mb-6 flex items-center gap-4">
          <span className="font-medium">Filter:</span>
          <div className="flex gap-2">
            {(["all", "active", "completed"] as const).map((status) => (
              <button
                key={status}
                onClick={() => handleFilterChange(status)}
                className={`px-4 py-2 rounded transition-colors ${
                  filterStatus === status
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>
      {/* Todo List */}
      <ul className="space-y-4">
        {todos.map((todo, index) => (
          <li
            key={todo.id}
            ref={index === todos.length - 1 ? lastTodoElementRef : null}
            className="flex items-center justify-between p-4 border rounded"
          >
            {editingTodo && editingTodo.id === todo.id ? (
              <form onSubmit={handleUpdateTodo} className="flex-1 mr-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="title"
                    value={editingTodo.title}
                    onChange={handleEditInputChange}
                    className="border p-2 flex-1"
                  />
                  <input
                    type="text"
                    name="content"
                    value={editingTodo.content}
                    onChange={handleEditInputChange}
                    className="border p-2 flex-1"
                  />
                  <button
                    type="submit"
                    disabled={updateMutation.isPending}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-green-300"
                  >
                    {updateMutation.isPending ? "Saving..." : "Save"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingTodo(null)}
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className="flex items-center flex-1">
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() =>
                      handleToggleComplete(todo.id, todo.completed)
                    }
                    className="mr-4"
                    disabled={updateMutation.isPending}
                  />
                  <span
                    className={`flex-1 ${todo.completed ? "line-through" : ""}`}
                  >
                    <span className="font-medium">{todo.title}</span> -{" "}
                    {todo.content}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      setEditingTodo({
                        id: todo.id,
                        title: todo.title,
                        content: todo.content,
                      })
                    }
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteMutation.mutate(todo.id)}
                    disabled={deleteMutation.isPending}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:bg-red-300"
                  >
                    {deleteMutation.isPending ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </>
            )}
          </li>
        ))}

        {(isLoading || isFetchingNextPage) && (
          <li className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </li>
        )}
      </ul>

      {/* Error State */}
      {status === "error" && (
        <div className="text-center py-4 text-red-500">
          Error loading todos. Please try again.
        </div>
      )}

      {/* Empty State */}
      {!isLoading && todos.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          {filterStatus === "all"
            ? "No todos found. Create one to get started!"
            : `No ${filterStatus} todos found.`}
        </div>
      )}

      {/* Items Count */}
      {todos.length > 0 && (
        <div className="text-center mt-4 text-gray-600">
          Showing {todos.length} of {totalItems} items
        </div>
      )}
    </div>
  );
};

export default TodoDashboard;
