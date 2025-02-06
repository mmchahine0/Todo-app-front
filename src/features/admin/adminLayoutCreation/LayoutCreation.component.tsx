import { useState } from "react";
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

interface DeleteConfirmState {
  isOpen: boolean;
  pageId: string;
  pageTitle: string;
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
          <p className="text-sm text-gray-500 flex items-center gap-1">
            {page.path} <ExternalLink className="h-3 w-3" />
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(page)}
            aria-label={`Edit ${page.title}`}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(page)}
            aria-label={`Delete ${page.title}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 text-sm">
        <span className="px-2 py-1 rounded-full bg-gray-100">
          {page.layout}
        </span>
        <span
          className={`px-2 py-1 rounded-full ${
            page.isProtected
              ? "bg-yellow-100 text-yellow-800"
              : "bg-green-100 text-green-800"
          }`}
        >
          {page.isProtected ? "Protected" : "Public"}
        </span>
        <span
          className={`px-2 py-1 rounded-full ${
            page.isPublished
              ? "bg-blue-100 text-blue-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {page.isPublished ? "Published" : "Draft"}
        </span>
      </div>
    </div>
  </Card>
);

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
    admin: false,
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
        admin: false,
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
      admin: newPage.admin,
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

  const handlePathChange = (path: string, isNewPage = true) => {
    const { layout, isProtected, admin } = getLayoutAndProtection(path);
    if (isNewPage) {
      setNewPage((prev) => ({
        ...prev,
        path,
        layout,
        isProtected,
        admin,
        content: {
          ...prev.content,
          layout,
        },
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
        <title>Layout Management | Admin</title>
        <meta name="description" content="Manage page layouts and routing" />
      </Helmet>

      <div className="w-full max-w-full overflow-hidden">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-2xl font-bold">Layout Management</h1>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <PlusCircle className="h-4 w-4" />
                Create New Page
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New Page</DialogTitle>
              </DialogHeader>
              <FormContent
                values={newPage}
                onSubmit={handleCreateSubmit}
                onChange={(field, value) =>
                  setNewPage((prev) => ({ ...prev, [field]: value }))
                }
                onPathChange={(path) => handlePathChange(path)}
                submitText="Create Page"
              />
            </DialogContent>
          </Dialog>
        </header>

        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <div className="min-w-full border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Title</TableHead>
                  <TableHead className="w-[250px]">Path</TableHead>
                  <TableHead className="w-[250px]">Layout</TableHead>
                  <TableHead className="w-[250px]">Protected</TableHead>
                  <TableHead className="w-[250px]">Status</TableHead>
                  <TableHead className="w-[250px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagesLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      <div className="flex justify-center">
                        <div
                          className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"
                          role="status"
                          aria-label="Loading pages"
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  pages?.data.map((page: DynamicPage) => (
                    <TableRow key={page.id}>
                      <TableCell className="font-medium">
                        {page.title}
                      </TableCell>
                      <TableCell>{page.path}</TableCell>
                      <TableCell>{page.layout}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            page.isProtected
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                          }`}
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
                        >
                          {page.isPublished ? "Published" : "Draft"}
                        </span>
                      </TableCell>
                      <TableCell className="">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(page)}
                            aria-label={`Edit ${page.title}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteRequest(page)}
                            aria-label={`Delete ${page.title}`}
                          >
                            <Trash2 className="h-4 w-4" />
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
        <div className="lg:hidden">
          {pagesLoading ? (
            <div className="flex justify-center py-8">
              <div
                className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"
                role="status"
                aria-label="Loading pages"
              />
            </div>
          ) : (
            pages?.data.map((page: DynamicPage) => (
              <PageCard
                key={page.id}
                page={page}
                onEdit={handleEdit}
                onDelete={handleDeleteRequest}
              />
            ))
          )}
        </div>

        {/* Edit Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
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
                onPathChange={(path) => handlePathChange(path, false)}
                submitText="Update Page"
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
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
                Are you sure you want to delete{" "}
                <strong>{deleteConfirm.pageTitle}</strong>? This will also
                delete all items attached to this page (e.g. Navigation items,
                Footer Links). This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="sm:space-x-2">
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteConfirm}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );
};

export default LayoutCreation;
