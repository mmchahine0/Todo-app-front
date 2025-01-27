import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/persist/persist";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { getAllPages, createPage, updatePage, deletePage } from "./LayoutCreation.services";
import { DynamicPage, CreatePageInput } from "../../../routes/dynamicPages/DynamicPages.types";
import { queryClient } from "@/lib/queryClient";

const LayoutCreation = () => {
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<DynamicPage | null>(null);
  const [newPage, setNewPage] = useState<CreatePageInput>({
    title: "",
    path: "",
    content: {
      layout: "default",
      components: [],
    },
  });

  const accessToken = useSelector((state: RootState) => state.auth?.accessToken);

  const { data: pages, isLoading: pagesLoading } = useQuery({
    queryKey: ["pages"],
    queryFn: () => getAllPages(accessToken),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreatePageInput) => createPage(data, accessToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pages"] });
      toast({
        title: "Success",
        description: "Page created successfully",
      });
      setIsCreateOpen(false);
      setNewPage({
        title: "",
        path: "",
        content: {
          layout: "default",
          components: [],
        },
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create page",
        duration: 2000,
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: DynamicPage) => updatePage(data.id, data, accessToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pages"] });
      toast({
        title: "Success",
        description: "Page updated successfully",
      });
      setIsEditOpen(false);
      setEditingPage(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update page",
        duration: 2000,
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deletePage(id, accessToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pages"] });
      toast({
        title: "Success",
        description: "Page deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete page",
        duration: 2000,
      });
    },
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formattedPath = newPage.path.startsWith('/') ? newPage.path : `/${newPage.path}`;
    createMutation.mutate({
      ...newPage,
      path: formattedPath,
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPage) return;
    
    const formattedPath = editingPage.path.startsWith('/') ? editingPage.path : `/${editingPage.path}`;
    updateMutation.mutate({
      ...editingPage,
      path: formattedPath,
    });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this page?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleEdit = (page: DynamicPage) => {
    setEditingPage(page);
    setIsEditOpen(true);
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Layout Management</h1>
        
        {/* Create Dialog */}
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>Create New Page</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Page</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={newPage.title}
                  onChange={(e) => setNewPage({ ...newPage, title: e.target.value })}
                  placeholder="Enter page title"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Path</label>
                <Input
                  value={newPage.path}
                  onChange={(e) => setNewPage({ ...newPage, path: e.target.value })}
                  placeholder="/dashboard/custom-page"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Layout</label>
                <Select
                  value={newPage.content.layout}
                  onValueChange={(value) =>
                    setNewPage({
                      ...newPage,
                      content: { ...newPage.content, layout: value },
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a layout" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default Layout</SelectItem>
                    <SelectItem value="full-width">Full Width</SelectItem>
                    <SelectItem value="sidebar">With Sidebar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">
                Create Page
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Page</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={editingPage?.title || ''}
                  onChange={(e) => setEditingPage(editingPage ? { 
                    ...editingPage, 
                    title: e.target.value 
                  } : null)}
                  placeholder="Enter page title"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Path</label>
                <Input
                  value={editingPage?.path || ''}
                  onChange={(e) => setEditingPage(editingPage ? { 
                    ...editingPage, 
                    path: e.target.value 
                  } : null)}
                  placeholder="/dashboard/custom-page"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Layout</label>
                <Select
                  value={editingPage?.content.layout || 'default'}
                  onValueChange={(value) =>
                    setEditingPage(editingPage ? {
                      ...editingPage,
                      content: { ...editingPage.content, layout: value },
                    } : null)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a layout" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default Layout</SelectItem>
                    <SelectItem value="full-width">Full Width</SelectItem>
                    <SelectItem value="sidebar">With Sidebar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">
                Update Page
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Path</TableHead>
              <TableHead>Layout</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pagesLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                </TableCell>
              </TableRow>
            ) : (
              pages?.data.map((page: DynamicPage) => (
                <TableRow key={page.id}>
                  <TableCell>{page.title}</TableCell>
                  <TableCell>{page.path}</TableCell>
                  <TableCell>{page.content.layout}</TableCell>
                  <TableCell>
                    {page.isPublished ? "Published" : "Draft"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEdit(page)}
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDelete(page.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default LayoutCreation;