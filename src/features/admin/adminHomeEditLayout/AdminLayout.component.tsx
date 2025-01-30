import { useQuery, useMutation } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/persist/persist";
import { getContent, updateContent } from "./AdminLayout.services";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect, useCallback } from "react";
import { queryClient } from "@/lib/queryClient";
import { NavItem, HeroContent, FooterContent } from "./AdminLayout.types";
import axios from "axios";
import _ from "lodash";
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

interface DeleteConfirmState {
  isOpen: boolean;
  type: "nav" | "footer" | null;
  index: number;
  itemLabel: string;
}

const ContentManagement = () => {
  const { toast } = useToast();
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);

  const { data, isLoading } = useQuery({
    queryKey: ["content"],
    queryFn: () => getContent(accessToken),
    enabled: !!accessToken,
  });

  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmState>({
    isOpen: false,
    type: null,
    index: -1,
    itemLabel: "",
  });

  const [navItems, setNavItems] = useState<NavItem[]>([]);
  const [originalNavItems, setOriginalNavItems] = useState<NavItem[]>([]);

  const [heroContent, setHeroContent] = useState<HeroContent>({
    title: "",
    subtitle: "",
    buttonText: "",
    buttonLink: "",
  });
  const [originalHeroContent, setOriginalHeroContent] = useState<HeroContent>({
    title: "",
    subtitle: "",
    buttonText: "",
    buttonLink: "",
  });

  const [footerContent, setFooterContent] = useState<FooterContent>({
    companyName: "",
    description: "",
    links: [],
  });
  const [originalFooterContent, setOriginalFooterContent] =
    useState<FooterContent>({
      companyName: "",
      description: "",
      links: [],
    });

  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    if (data?.data) {
      const navbar = Array.isArray(data.data.navbar) ? data.data.navbar : [];
      setNavItems(navbar);
      setOriginalNavItems(_.cloneDeep(navbar));

      const hero = data.data.hero || {
        title: "",
        subtitle: "",
        buttonText: "",
        buttonLink: "",
      };
      setHeroContent(hero);
      setOriginalHeroContent(_.cloneDeep(hero));

      const footer = data.data.footer || {
        companyName: "",
        description: "",
        links: [],
      };
      setFooterContent(footer);
      setOriginalFooterContent(_.cloneDeep(footer));
    }
  }, [data]);

  const hasChanges = useCallback((current: object, original: object) => {
    return !_.isEqual(current, original);
  }, []);

  const updateMutation = useMutation({
    mutationFn: ({ section, content }: { section: string; content: object }) =>
      updateContent(section, content, accessToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content"] });
      toast({
        title: "Success",
        description: "Content updated successfully",
      });
    },
    onError: (error: unknown) => {
      if (axios.isAxiosError(error)) {
        toast({
          title: "Error",
          description:
            error.response?.data?.message || "Failed to update content",
          variant: "destructive",
        });
      }
    },
  });

  const handleDeleteConfirm = () => {
    if (deleteConfirm.type === "nav") {
      setNavItems(navItems.filter((_, i) => i !== deleteConfirm.index));
    } else if (deleteConfirm.type === "footer") {
      const newLinks = footerContent?.links.filter(
        (_, i) => i !== deleteConfirm.index
      );
      setFooterContent(
        (prev) =>
          ({
            ...prev,
            links: newLinks,
          } as FooterContent)
      );
    }
    setDeleteConfirm({ isOpen: false, type: null, index: -1, itemLabel: "" });
  };

  const handleDeleteRequest = (
    type: "nav" | "footer",
    index: number,
    label: string
  ) => {
    setDeleteConfirm({
      isOpen: true,
      type,
      index,
      itemLabel: label.trim() || "this item",
    });
  };

  const addNavItem = () => {
    setNavItems([
      ...navItems,
      { label: "", path: "", visibility: "logged-out" },
    ]);
  };

  const validateNavItems = (items: NavItem[]): string[] => {
    const errors: string[] = [];
    items.forEach((item, index) => {
      if (!item.label.trim() && item.path.trim()) {
        errors.push(
          `Item ${index + 1}: Label is required when path is provided.`
        );
      }
      if (item.label.trim() && !item.path.trim()) {
        errors.push(
          `Item ${index + 1}: Path is required when label is provided.`
        );
      }
    });
    return errors;
  };

  const handleNavUpdate = () => {
    const errors = validateNavItems(navItems);
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }
    setValidationErrors([]);

    if (!hasChanges(navItems, originalNavItems)) {
      toast({
        title: "Info",
        description: "No changes detected in navigation items",
        variant: "destructive",
      });
      return;
    }

    updateMutation.mutate({
      section: "navbar",
      content: navItems,
    });
  };

  const handleHeroUpdate = () => {
    if (!hasChanges(heroContent, originalHeroContent)) {
      toast({
        title: "Info",
        description: "No changes detected in hero content",
        variant: "destructive",
      });
      return;
    }

    updateMutation.mutate({
      section: "hero",
      content: heroContent,
    });
  };

  const handleFooterUpdate = () => {
    if (!hasChanges(footerContent, originalFooterContent)) {
      toast({
        title: "Info",
        description: "No changes detected in footer content",
        variant: "destructive",
      });
      return;
    }

    updateMutation.mutate({
      section: "footer",
      content: footerContent,
    });
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Navigation Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {validationErrors.length > 0 && (
              <div className="text-red-500">
                {validationErrors.map((error, index) => (
                  <div key={index}>{error}</div>
                ))}
              </div>
            )}
            {navItems.map((item, index) => (
              <div key={index} className="flex gap-4">
                <Input
                  placeholder="Label"
                  value={item.label}
                  onChange={(e) => {
                    const newItems = [...navItems];
                    newItems[index].label = e.target.value;
                    setNavItems(newItems);
                  }}
                />
                <Input
                  placeholder="Path"
                  value={item.path}
                  onChange={(e) => {
                    const newItems = [...navItems];
                    newItems[index].path = e.target.value;
                    setNavItems(newItems);
                  }}
                />
                <div className="flex items-center space-x-2">
                  <label>Visibility:</label>
                  <select
                    value={item.visibility}
                    onChange={(e) => {
                      const newItems = [...navItems];
                      newItems[index].visibility = e.target.value as
                        | "logged-in"
                        | "logged-out"
                        | "all";
                      setNavItems(newItems);
                    }}
                    className="border rounded px-2 py-1"
                  >
                    <option value="all">All Users</option>
                    <option value="logged-in">Logged In Only</option>
                    <option value="logged-out">Logged Out Only</option>
                  </select>
                </div>
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteRequest("nav", index, item.label)}
                >
                  Remove
                </Button>
              </div>
            ))}
            <div className="flex gap-4">
              <Button onClick={addNavItem}>Add Navigation Item</Button>
              <Button onClick={handleNavUpdate}>Update Navigation</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Hero Section</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input
              placeholder="Title"
              value={heroContent?.title ?? ""}
              onChange={(e) =>
                setHeroContent(
                  (prev) => ({ ...prev, title: e.target.value } as HeroContent)
                )
              }
            />
            <Textarea
              placeholder="Subtitle"
              value={heroContent?.subtitle ?? ""}
              onChange={(e) =>
                setHeroContent(
                  (prev) =>
                    ({ ...prev, subtitle: e.target.value } as HeroContent)
                )
              }
            />
            <div className="flex gap-4">
              <Input
                placeholder="Button Text"
                value={heroContent?.buttonText ?? ""}
                onChange={(e) =>
                  setHeroContent(
                    (prev) =>
                      ({ ...prev, buttonText: e.target.value } as HeroContent)
                  )
                }
              />
              <Input
                placeholder="Button Link"
                value={heroContent?.buttonLink ?? ""}
                onChange={(e) =>
                  setHeroContent(
                    (prev) =>
                      ({ ...prev, buttonLink: e.target.value } as HeroContent)
                  )
                }
              />
            </div>
            <Button onClick={handleHeroUpdate}>Update Hero Section</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Footer</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input
              placeholder="Company Name"
              value={footerContent?.companyName ?? ""}
              onChange={(e) =>
                setFooterContent(
                  (prev) =>
                    ({
                      ...prev,
                      companyName: e.target.value,
                    } as FooterContent)
                )
              }
            />
            <Textarea
              placeholder="Description"
              value={footerContent?.description ?? ""}
              onChange={(e) =>
                setFooterContent(
                  (prev) =>
                    ({
                      ...prev,
                      description: e.target.value,
                    } as FooterContent)
                )
              }
            />
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Footer Links</h3>
              {footerContent?.links?.map((link, index) => (
                <div key={index} className="flex gap-4">
                  <Input
                    placeholder="Label"
                    value={link.label}
                    onChange={(e) => {
                      const newLinks = [...(footerContent?.links || [])];
                      newLinks[index].label = e.target.value;
                      setFooterContent(
                        (prev) =>
                          ({
                            ...prev,
                            links: newLinks,
                          } as FooterContent)
                      );
                    }}
                  />
                  <Input
                    placeholder="Path"
                    value={link.path}
                    onChange={(e) => {
                      const newLinks = [...(footerContent?.links || [])];
                      newLinks[index].path = e.target.value;
                      setFooterContent(
                        (prev) =>
                          ({
                            ...prev,
                            links: newLinks,
                          } as FooterContent)
                      );
                    }}
                  />
                  <Button
                    variant="destructive"
                    onClick={() =>
                      handleDeleteRequest("footer", index, link.label)
                    }
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button
                onClick={() => {
                  const newLinks = [
                    ...(footerContent?.links || []),
                    { label: "", path: "", visibility: "all" },
                  ];
                  setFooterContent(
                    (prev) =>
                      ({
                        ...prev,
                        links: newLinks,
                      } as FooterContent)
                  );
                }}
              >
                Add Footer Link
              </Button>
            </div>
            <Button onClick={handleFooterUpdate}>Update Footer</Button>
          </div>
        </CardContent>
      </Card>

      <AlertDialog
        open={deleteConfirm.isOpen}
        onOpenChange={(isOpen) =>
          setDeleteConfirm((prev) => ({ ...prev, isOpen }))
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="text-black">{deleteConfirm.itemLabel}</span>?
              This action cannot be undone until you save your changes.
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

export default ContentManagement;
