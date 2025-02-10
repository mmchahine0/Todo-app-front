import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/persist/persist";
import { Helmet } from "react-helmet-async";
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
import { Card } from "@/components/ui/card";
import {
  getAllPages,
  createPage,
  updatePage,
  deletePage,
} from "./LayoutCreation.services";
import type {
  DynamicPage,
  CreatePageInput,
} from "../../dynamicPages/DynamicPages.types";
import { queryClient } from "@/lib/queryClient";
import { PlusCircle, Pencil, Trash2, ExternalLink } from "lucide-react";
import { LoadingSpinner } from "@/components/common/loading spinner/LoadingSpinner.component";

interface DeleteConfirmState {
  isOpen: boolean;
  pageId: string;
  pageTitle: string;
}
interface StatusMessage {
  type: 'success' | 'error' | 'info';
  message: string;
}

const PageCard = ({
  page,
  onEdit,
  onDelete,
}: {
  page: DynamicPage;
  onEdit: (page: DynamicPage) => void;
  onDelete: (page: DynamicPage) => void;
}) => (
  <Card className="p-4 mb-4">
    <div className="space-y-3">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium">{page.title}</h3>
          <p 
            className="text-sm text-gray-500 flex items-center gap-1"
            aria-label={`Path: ${page.path}`}
          >
            {page.path} 
            <ExternalLink className="h-3 w-3" aria-hidden="true" />
          </p>
        </div>
        <div 
          className="flex gap-2"
          role="group"
          aria-label={`Actions for ${page.title}`}
        >
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(page)}
            aria-label={`Edit ${page.title}`}
            className="focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <Pencil className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(page)}
            aria-label={`Delete ${page.title}`}
            className="focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
      <div 
        className="flex flex-wrap gap-2 text-sm"
        role="group"
        aria-label="Page properties"
      >
        <span 
          className="px-2 py-1 rounded-full bg-gray-100"
          role="status"
        >
          {page.layout}
        </span>
        <span
          className={`px-2 py-1 rounded-full ${
            page.isProtected
              ? "bg-yellow-100 text-yellow-800"
              : "bg-green-100 text-green-800"
          }`}
          role="status"
        >
          {page.isProtected ? "Protected" : "Public"}
        </span>
        <span
          className={`px-2 py-1 rounded-full ${
            page.isPublished
              ? "bg-blue-100 text-blue-800"
              : "bg-gray-100 text-gray-800"
          }`}
          role="status"
        >
          {page.isPublished ? "Published" : "Draft"}
        </span>
      </div>
    </div>
  </Card>
);
const CreatePageDialog = ({ 
  isOpen, 
  onClose, 
  onSubmit 
}: { 
  isOpen: boolean; 
  onClose: () => void;
  onSubmit: (data: CreatePageInput) => void;
}) => {
  const [formData, setFormData] = useState<CreatePageInput>({
    title: "",
    path: "",
    content: {
      layout: "base",
      components: [],
    },
    isProtected: false,
    admin: false,
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({ 
      title: "",
      path: "",
      content: {
        layout: "base",
        components: [],
      },
      isProtected: false,
      admin: false,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Page</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">Title</label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter page title"
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="path" className="text-sm font-medium">Path</label>
            <Input
              id="path"
              value={formData.path}
              onChange={(e) => setFormData(prev => ({ ...prev, path: e.target.value }))}
              placeholder="/dashboard/custom-page or /custom-page"
              required
            />
          </div>
          <Button type="submit" className="w-full">Create Page</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

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

  const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null);

  const accessToken = useSelector(
    (state: RootState) => state.auth?.accessToken
  );

  const { data: pages, isLoading: pagesLoading } = useQuery({
    queryKey: ["pages"],
    queryFn: () => getAllPages(),
    enabled: !!accessToken,
  });

// Add keyboard shortcuts
useEffect(() => {
  const handleKeyboard = (e: KeyboardEvent) => {
    // Alt + N for new page
    if (e.altKey && e.key === 'n') {
      e.preventDefault();
      setIsCreateOpen(true);
    }
  };

  window.addEventListener('keydown', handleKeyboard);
  return () => window.removeEventListener('keydown', handleKeyboard);
}, []);

// Clear status message after announcement
useEffect(() => {
  if (statusMessage) {
    const timer = setTimeout(() => setStatusMessage(null), 5000);
    return () => clearTimeout(timer);
  }
}, [statusMessage]);


  const createMutation = useMutation({
    mutationFn: (data: CreatePageInput) => createPage(data, accessToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pages"] });
      toast({
        title: "Success",
        description: "Page created successfully",
      });
      setIsCreateOpen(false);
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

  const handleCreateSubmit = (data: CreatePageInput) => {
    const formattedPath = data.path.startsWith("/") ? data.path : `/${data.path}`;
  
    const pageData = {
      ...data,
      path: formattedPath,
      layout: data.content.layout,
      isProtected: data.isProtected,
      admin: data.admin,
    };
  
    createMutation.mutate(pageData);
  };
  const getLayoutAndProtection = (
    path: string
  ): { layout: string; isProtected: boolean; admin: boolean } => {
    const formattedPath = path.startsWith("/") ? path : `/${path}`;
    if (formattedPath.startsWith("/dashboard/admin")) {
      return { layout: "dashboard", isProtected: true, admin: true };
    }
    if (formattedPath.startsWith("/dashboard")) {
      return { layout: "dashboard", isProtected: true, admin: false };
    }
    return { layout: "base", isProtected: false, admin: false };
  };

  const handlePathChange = (path: string) => {
    const { layout, isProtected, admin } = getLayoutAndProtection(path);
    if (editingPage) {
      setEditingPage({
        ...editingPage,
        path,
        layout,
        isProtected,
        admin,
        content: {
          ...editingPage.content,
          layout,
        },
      });
    }
  };
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPage) return;

    const formattedPath = editingPage.path.startsWith("/")
      ? editingPage.path
      : `/${editingPage.path}`;

    const originalPage = pages?.data.find((page) => page.id === editingPage.id);

    if (
      originalPage &&
      originalPage.title === editingPage.title &&
      originalPage.path === formattedPath
    ) {
      toast({
        title: "No Changes",
        description: "No modifications were made to the page",
      });
      setIsEditOpen(false);
      setEditingPage(null);
      return;
    }

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
  const FormContent = ({
    values,
    onSubmit,
    onChange,
    onPathChange,
    submitText,
  }: {
    values: CreatePageInput | DynamicPage;
    onSubmit: (e: React.FormEvent) => void;
    onChange: (field: string, value: string) => void;
    onPathChange: (path: string) => void;
    submitText: string;
  }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="title" className="text-sm font-medium">
          Title
        </label>
        <Input
          id="title"
          value={values.title}
          onChange={(e) => onChange("title", e.target.value)}
          placeholder="Enter page title"
          required
          aria-required="true"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="path" className="text-sm font-medium">
          Path
        </label>
        <Input
          id="path"
          value={values.path}
          onChange={(e) => onPathChange(e.target.value)}
          placeholder="/dashboard/custom-page or /custom-page"
          required
          aria-required="true"
        />
        <p className="text-sm text-gray-500">
          Layout will be automatically set based on the path
        </p>
      </div>
      <Button type="submit" className="w-full">
        {submitText}
      </Button>
    </form>
  );

  return (
    <>
      <Helmet>
        <title>Layout Management | Admin Dashboard</title>
        <meta name="description" content="Create and manage page layouts and routing in the admin dashboard" />
        <meta name="robots" content="noindex, nofollow" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="canonical" href={window.location.href} />
      </Helmet>
  
      {/* Screen reader announcements */}
      <div className="sr-only" role="status" aria-live="polite">
        {statusMessage?.message}
      </div>
  
      <main 
        className="w-full max-w-full overflow-hidden"
        aria-labelledby="layout-management-title"
      >
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 
            id="layout-management-title" 
            className="text-2xl font-bold"
            tabIndex={-1}
          >
            Layout Management
            <span className="sr-only">Press Alt + N to create a new page</span>
          </h1>
  
          <Button 
            onClick={() => setIsCreateOpen(true)} 
            className="flex items-center gap-2"
            aria-label="Create new page"
          >
            <PlusCircle className="h-4 w-4" aria-hidden="true" />
            Create New Page
          </Button>
        </header>
  
        {/* Desktop Table View */}
        <div 
          className="hidden lg:block overflow-x-auto"
          role="region" 
          aria-label="Page layouts table"
        >
          <div className="min-w-full border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]" scope="col">Title</TableHead>
                  <TableHead className="w-[250px]" scope="col">Path</TableHead>
                  <TableHead className="w-[250px]" scope="col">Layout</TableHead>
                  <TableHead className="w-[250px]" scope="col">Protected</TableHead>
                  <TableHead className="w-[250px]" scope="col">Status</TableHead>
                  <TableHead className="w-[250px]" scope="col">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagesLoading ? (
                  <TableRow>
                    <TableCell 
                      colSpan={6} 
                      className="h-24 text-center"
                      role="status"
                      aria-busy="true"
                    >
                             <LoadingSpinner size="lg" label="Loading pages..." />
                      
                    </TableCell>
                  </TableRow>
                ) : (
                  pages?.data.map((page: DynamicPage) => (
                    <TableRow 
                      key={page.id}
                      aria-label={`Page: ${page.title}`}
                    >
                      <TableCell className="font-medium">{page.title}</TableCell>
                      <TableCell>{page.path}</TableCell>
                      <TableCell>{page.layout}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            page.isProtected
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                          }`}
                          role="status"
                        >
                          {page.isProtected ? "Protected" : "Public"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            page.isPublished
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                          role="status"
                        >
                          {page.isPublished ? "Published" : "Draft"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div 
                          className="flex gap-2"
                          role="group"
                          aria-label={`Actions for ${page.title}`}
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(page)}
                            aria-label={`Edit ${page.title}`}
                            className="focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          >
                            <Pencil className="h-4 w-4" aria-hidden="true" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteRequest(page)}
                            aria-label={`Delete ${page.title}`}
                            className="focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
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
  
        {/* Mobile Card View */}
        <div 
          className="lg:hidden"
          role="region" 
          aria-label="Page layouts cards"
        >
          {pagesLoading ? (
            <div 
              className="flex justify-center py-8"
              role="status"
              aria-busy="true"
            >
              <div
                className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"
                aria-hidden="true"
              />
              <span className="sr-only">Loading pages...</span>
            </div>
          ) : (
            <ul className="space-y-4" role="list">
              {pages?.data.map((page: DynamicPage) => (
                <li key={page.id} role="listitem">
                  <PageCard page={page} onEdit={handleEdit} onDelete={handleDeleteRequest} />
                </li>
              ))}
            </ul>
          )}
        </div>
  
        {/* Dialogs */}
        <CreatePageDialog
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onSubmit={handleCreateSubmit}
        />
  
        <Dialog 
          open={isEditOpen} 
          onOpenChange={setIsEditOpen}
          aria-label="Edit page dialog"
        >
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Page</DialogTitle>
            </DialogHeader>
            {editingPage && (
              <FormContent
                values={editingPage}
                onSubmit={handleEditSubmit}
                onChange={(field, value) =>
                  setEditingPage((prev) =>
                    prev ? { ...prev, [field]: value } : null
                  )
                }
                onPathChange={(path) => handlePathChange(path)}
                submitText="Update Page"
              />
            )}
          </DialogContent>
        </Dialog>
  
        <AlertDialog
          open={deleteConfirm.isOpen}
          onOpenChange={(isOpen) =>
            setDeleteConfirm((prev) => ({ ...prev, isOpen }))
          }
        >
          <AlertDialogContent role="alertdialog">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Page</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete{" "}
                <strong>{deleteConfirm.pageTitle}</strong>?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="sm:space-x-2">
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteConfirm}
                aria-label={`Confirm deletion of ${deleteConfirm.pageTitle}`}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </>
  );
};

export default LayoutCreation;
