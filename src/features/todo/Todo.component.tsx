import { TodoInput, Todo } from "./Todo.types";
import {
  getTodosByUserId,
  createTodo,
  updateTodo,
  deleteTodo,
} from "./Todo.service";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/persist/persist";
import { useToast } from "@/hooks/use-toast";

const TodoDashboard = () => {
  const { toast } = useToast();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputTodos, setInputTodos] = useState<TodoInput>({
    title: "",
    content: "",
    completed: false,
  });
  const [editingTodo, setEditingTodo] = useState<{
    id: string;
    title: string;
    content: string;
  } | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const accessToken = useSelector((state: RootState) => state.auth?.accessToken);

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

  const startEditing = (todo: Todo) => {
    setEditingTodo({
      id: todo.id,
      title: todo.title,
      content: todo.content,
    });
  };

  const cancelEditing = () => {
    setEditingTodo(null);
  };

  const handleToggleComplete = async (todoId: string, currentStatus: boolean) => {
    const todoToUpdate = todos.find((todo) => todo.id === todoId);
    if (!todoToUpdate) return;

    // Optimistic update
    setTodos((prevTodos) =>
      prevTodos.map((todo) =>
        todo.id === todoId ? { ...todo, completed: !currentStatus } : todo
      )
    );

    try {
      await updateTodo(
        todoId,
        { ...todoToUpdate, completed: !currentStatus },
        accessToken
      );
      toast({
        title: "Todo updated",
        description: "Status changed successfully",
        duration: 2000,
      });
    } catch (error) {
      console.log(error)
      // Revert optimistic update on error
      setTodos((prevTodos) =>
        prevTodos.map((todo) =>
          todo.id === todoId ? { ...todo, completed: currentStatus } : todo
        )
      );
      toast({
        title: "Error",
        description: "Failed to update todo status",
        duration: 2000,
      });
    }
  };

  const handleUpdateTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTodo) return;

    setIsUpdating(true);
    const originalTodo = todos.find((todo) => todo.id === editingTodo.id);
    
    // Optimistic update
    setTodos((prevTodos) =>
      prevTodos.map((todo) =>
        todo.id === editingTodo.id
          ? { ...todo, title: editingTodo.title, content: editingTodo.content }
          : todo
      )
    );

    try {
      await updateTodo(
        editingTodo.id,
        {
          title: editingTodo.title,
          content: editingTodo.content,
          completed: originalTodo?.completed || false,
        },
        accessToken
      );
      
      toast({
        title: "Todo updated",
        description: "Your todo has been updated successfully",
        duration: 2000,
      });
      setEditingTodo(null);
    } catch (error) {
      console.log(error)
      // Revert optimistic update on error
      if (originalTodo) {
        setTodos((prevTodos) =>
          prevTodos.map((todo) =>
            todo.id === editingTodo.id ? originalTodo : todo
          )
        );
      }
      toast({
        title: "Error",
        description: "Failed to update todo",
        duration: 2000,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const fetchedTodos = await getTodosByUserId(accessToken);
      setTodos(fetchedTodos);
    } catch (err) {
      console.log(err)
      toast({
        title: "Error",
        description: "Failed to fetch todos",
        duration: 2000,
      });
    }
  };

  const handleCreateTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newTodo = await createTodo(inputTodos, accessToken);
      setTodos((prev) => [...prev, newTodo]);
      toast({
        title: "Todo created",
        description: "Your todo has been created successfully.",
        duration: 2000,
      });
      setInputTodos({ title: "", content: "", completed: false });
    } catch (e) {
      console.log(e)
      toast({
        title: "Error",
        description: "Failed to create todo",
        duration: 2000,
      });
    }
  };

  const handleDeleteTodo = async (id: string) => {
    // Optimistic delete
    const todoToDelete = todos.find((todo) => todo.id === id);
    setTodos((prev) => prev.filter((todo) => todo.id !== id));

    try {
      await deleteTodo(id, accessToken);
      toast({
        title: "Todo deleted",
        description: "Your todo has been deleted successfully.",
        duration: 2000,
      });
    } catch (e) {
      console.log(e)
      // Revert optimistic delete
      if (todoToDelete) {
        setTodos((prev) => [...prev, todoToDelete]);
      }
      toast({
        title: "Error",
        description: "Failed to delete todo",
        duration: 2000,
      });
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Todo List</h1>

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
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Add Todo
        </button>
      </form>

      <ul className="space-y-4">
        {todos.map((todo) => (
          <li
            key={todo.id}
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
                    disabled={isUpdating}
                    className="bg-green-500 text-white px-4 py-2 rounded"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={cancelEditing}
                    className="bg-gray-500 text-white px-4 py-2 rounded"
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
                    onChange={() => handleToggleComplete(todo.id, todo.completed)}
                    className="mr-4"
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
                    onClick={() => startEditing(todo)}
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteTodo(todo.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TodoDashboard;