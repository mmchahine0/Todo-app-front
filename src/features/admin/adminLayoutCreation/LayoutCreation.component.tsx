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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  getAllPages,
  createPage,
  updatePage,
  deletePage,
} from "./LayoutCreation.services";
import {
  DynamicPage,
  CreatePageInput
} from "../../dynamicPages/DynamicPages.types";
import { queryClient } from "@/lib/queryClient";

interface DeleteConfirmState {
  isOpen: boolean;
  pageId: string;
  pageTitle: string;
}

const LayoutCreation = () => {
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<DynamicPage | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmState>({
    isOpen: false,
    pageId: "",
    pageTitle: "",
  });
  const [newPage, setNewPage] = useState<CreatePageInput>({
    title: "",
    path: "",
    content: {
      layout: "base", 
      components: [],
    },
    isProtected: false,
    admin: false
  });

  const accessToken = useSelector(
    (state: RootState) => state.auth?.accessToken
  );

  const { data: pages, isLoading: pagesLoading } = useQuery({
    queryKey: ["pages"],
    queryFn: () => getAllPages(),
    enabled: !!accessToken,
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
          layout: "base",
          components: [],
        },
        isProtected: false,
        admin: false
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create page",
        variant: "destructive",
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
        variant: "destructive",
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
      setDeleteConfirm({ isOpen: false, pageId: "", pageTitle: "" });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete page",
        variant: "destructive",
        duration: 2000,
      });
    },
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formattedPath = newPage.path.startsWith("/")
      ? newPage.path
      : `/${newPage.path}`;
      
    const pageData = {
      ...newPage,
      path: formattedPath,
      layout: newPage.content.layout,
      isProtected: newPage.isProtected,
      admin: newPage.admin
    };
    
    createMutation.mutate(pageData);
  };
  const getLayoutAndProtection = (path: string): { layout: string; isProtected: boolean; admin: boolean } => {
    const formattedPath = path.startsWith("/") ? path : `/${path}`;
    if (formattedPath.startsWith("/dashboard/admin")) {
      return { layout: "dashboard", isProtected: true, admin: true };
    }
    if (formattedPath.startsWith("/dashboard")) {
      return { layout: "dashboard", isProtected: true, admin: false }; 
    }
    return { layout: "base", isProtected: false, admin: false };
   };

   const handlePathChange = (path: string, isNewPage: boolean = true) => {
    const { layout, isProtected, admin } = getLayoutAndProtection(path);
    if (isNewPage) {
      setNewPage(prev => ({
        ...prev,
        path,
        layout,
        isProtected,
        admin,
        content: {
          ...prev.content,
          layout
        }
      }));
    } else if (editingPage) {
      setEditingPage({
        ...editingPage,
        path,
        layout,
        isProtected,
        admin,
        content: {
          ...editingPage.content,
          layout
        }
      });
    }
   }
    const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPage) return;

    const formattedPath = editingPage.path.startsWith("/")
      ? editingPage.path
      : `/${editingPage.path}`;
    updateMutation.mutate({
      ...editingPage,
      path: formattedPath,
    });
  };

  const handleDeleteRequest = (page: DynamicPage) => {
    setDeleteConfirm({
      isOpen: true,
      pageId: page.id,
      pageTitle: page.title,
    });
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirm.pageId) {
      deleteMutation.mutate(deleteConfirm.pageId);
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
                  onChange={(e) =>
                    setNewPage({ ...newPage, title: e.target.value })
                  }
                  placeholder="Enter page title"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Path</label>
                <Input
                  value={newPage.path}
                  onChange={(e) => handlePathChange(e.target.value)}
                  placeholder="/dashboard/custom-page or /custom-page"
                  required
                />
                <p className="text-sm text-gray-500">
                  Layout will be automatically set based on the path
                </p>
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
                  value={editingPage?.title || ""}
                  onChange={(e) =>
                    setEditingPage(
                      editingPage
                        ? { ...editingPage, title: e.target.value }
                        : null
                    )
                  }
                  placeholder="Enter page title"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Path</label>
                <Input
                  value={editingPage?.path || ""}
                  onChange={(e) => handlePathChange(e.target.value, false)}
                  placeholder="/dashboard/custom-page or /custom-page"
                  required
                />
                <p className="text-sm text-gray-500">
                  Layout will be automatically set based on the path
                </p>
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
              <TableHead>Protected</TableHead>
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
                  <TableCell>{page.layout}</TableCell>
<TableCell>
  <span className={`px-2 py-1 rounded-full text-xs ${
    page.isProtected 
      ? "bg-yellow-100 text-yellow-800" 
      : "bg-green-100 text-green-800"
  }`}>
    {page.isProtected ? "Protected" : "Public"}
  </span>
</TableCell>
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
                        onClick={() => handleDeleteRequest(page)}
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

      <AlertDialog
        open={deleteConfirm.isOpen}
        onOpenChange={(isOpen) =>
          setDeleteConfirm((prev) => ({ ...prev, isOpen }))
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Page</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete
              <span className="text-black">{deleteConfirm.pageTitle}</span>?
              Thise will also delete all items attached to this page {"(e.g. Navitems, Footer Links)"}
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default LayoutCreation;