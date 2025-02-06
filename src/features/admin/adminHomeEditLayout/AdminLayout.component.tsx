import { useQuery, useMutation } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/persist/persist";
import { getContent, updateContent } from "./AdminLayout.services";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Helmet } from "react-helmet-async";
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
import {
  NavItem,
  FooterContent,
  FeaturesContent,
  StatisticsContent,
  CtaContent,
  DeleteConfirmState,
} from "./AdminLayout.types";
import { useState, useEffect } from "react";
import _ from "lodash";
import { queryClient } from "@/lib/queryClient";
import axios from "axios";
import { Label } from "@/components/ui/label";

const initialLocalContent = {
  navItems: [] as NavItem[],
  heroContent: {} as any,
  featuresContent: { title: "", items: [] } as FeaturesContent,
  statisticsContent: { items: [] } as StatisticsContent,
  ctaContent: {
    title: "",
    subtitle: "",
    buttonText: "",
    buttonLink: "",
  } as CtaContent,
  footerContent: {
    companyName: "",
    description: "",
    links: [],
  } as FooterContent,
};

const ContentManagement = () => {
  const { toast } = useToast();
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmState>({
    isOpen: false,
    type: null,
    index: -1,
    itemLabel: "",
  });

  const [localContent, setLocalContent] = useState(initialLocalContent);

  const { data, isLoading } = useQuery({
    queryKey: ["content", accessToken],
    queryFn: async () => {
      const response = await getContent(accessToken);
      return {
        navItems: Array.isArray(response.data.navbar)
          ? response.data.navbar
          : [],
        heroContent: response.data.hero || {
          title: "",
          subtitle: "",
          buttonText: "",
          buttonLink: "",
        },
        featuresContent: response.data.features || {
          title: "Why Choose Us?",
          items: [],
        },
        statisticsContent: response.data.statistics || {
          items: [],
        },
        ctaContent: response.data.cta || {
          title: "",
          subtitle: "",
          buttonText: "",
          buttonLink: "",
        },
        footerContent: response.data.footer || {
          companyName: "",
          description: "",
          links: [],
        },
      };
    },
    enabled: !!accessToken,
    retry: 2,
  });

  useEffect(() => {
    if (data) {
      setLocalContent(data);
    }
  }, [data]);

  const updateMutation = useMutation({
    mutationFn: ({ section, content }: { section: string; content: any }) =>
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

  const hasChanges = (current: any, original: any) =>
    !_.isEqual(current, original);

  const handleNavChange = (
    index: number,
    field: keyof NavItem,
    value: string
  ) => {
    const newItems = [...(localContent?.navItems || [])];
    newItems[index] = { ...newItems[index], [field]: value };
    setLocalContent((prev) => ({ ...prev, navItems: newItems }));
  };

  const handleNavSubmit = async () => {
    if (!localContent?.navItems) return;

    const errors = validateNavItems(localContent.navItems);
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    if (!hasChanges(localContent.navItems, data?.navItems)) {
      toast({
        title: "Info",
        description: "No changes detected in navigation items.",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateMutation.mutateAsync({
        section: "navbar",
        content: localContent.navItems,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const validateNavItems = (items: NavItem[]): string[] => {
    if (!items) return [];
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

  const handleDeleteRequest = (
    type: DeleteConfirmState["type"],
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

  const handleDeleteConfirm = () => {
    if (!localContent) return;

    switch (deleteConfirm.type) {
      case "nav":
        setLocalContent((prev) => ({
          ...prev,
          navItems: (prev.navItems || []).filter(
            (_, i) => i !== deleteConfirm.index
          ),
        }));
        break;
      case "feature":
        setLocalContent((prev) => ({
          ...prev,
          featuresContent: {
            ...prev.featuresContent,
            items: (prev.featuresContent?.items || []).filter(
              (_, i) => i !== deleteConfirm.index
            ),
          },
        }));
        break;
      case "statistic":
        setLocalContent((prev) => ({
          ...prev,
          statisticsContent: {
            items: (prev.statisticsContent?.items || []).filter(
              (_, i) => i !== deleteConfirm.index
            ),
          },
        }));
        break;
      case "footer":
        setLocalContent((prev) => ({
          ...prev,
          footerContent: {
            ...prev.footerContent,
            links: (prev.footerContent?.links || []).filter(
              (_, i) => i !== deleteConfirm.index
            ),
          },
        }));
        break;
    }

    setDeleteConfirm({ isOpen: false, type: null, index: -1, itemLabel: "" });
  };

  const validateFeatures = (features: FeaturesContent): string[] => {
    if (!features) return [];
    const errors: string[] = [];

    if (!features.title?.trim()) {
      errors.push("Features section title is required");
    }

    features.items?.forEach((item, index) => {
      if (!item.title?.trim()) {
        errors.push(`Feature ${index + 1}: Title is required`);
      }
      if (!item.description?.trim()) {
        errors.push(`Feature ${index + 1}: Description is required`);
      }
    });

    return errors;
  };

  const validateStatistics = (statistics: StatisticsContent): string[] => {
    if (!statistics?.items) return [];
    const errors: string[] = [];

    statistics.items.forEach((item, index) => {
      if (!item.value?.trim()) {
        errors.push(`Statistic ${index + 1}: Value is required`);
      }
      if (!item.label?.trim()) {
        errors.push(`Statistic ${index + 1}: Label is required`);
      }
      if (!item.color?.match(/^#[0-9A-Fa-f]{6}$/)) {
        errors.push(`Statistic ${index + 1}: Invalid color format`);
      }
    });

    return errors;
  };

  const handleFeaturesSubmit = async () => {
    if (!localContent?.featuresContent) return;

    const errors = validateFeatures(localContent.featuresContent);
    if (errors.length > 0) {
      setValidationErrors(errors);
      toast({
        title: "Validation Error",
        description: errors[0],
        variant: "destructive",
      });
      return;
    }
    setValidationErrors([]);

    if (!hasChanges(localContent.featuresContent, data?.featuresContent)) {
      toast({
        title: "Info",
        description: "No changes detected in features",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateMutation.mutateAsync({
        section: "features",
        content: localContent.featuresContent,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleStatisticsSubmit = async () => {
    if (!localContent?.statisticsContent) return;

    const errors = validateStatistics(localContent.statisticsContent);
    if (errors.length > 0) {
      setValidationErrors(errors);
      toast({
        title: "Validation Error",
        description: errors[0],
        variant: "destructive",
      });
      return;
    }
    setValidationErrors([]);

    if (!hasChanges(localContent.statisticsContent, data?.statisticsContent)) {
      toast({
        title: "Info",
        description: "No changes detected in statistics",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateMutation.mutateAsync({
        section: "statistics",
        content: localContent.statisticsContent,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleCtaSubmit = async () => {
    if (!localContent?.ctaContent) return;

    const ctaErrors = [];
    if (!localContent.ctaContent.title?.trim())
      ctaErrors.push("CTA title is required");
    if (!localContent.ctaContent.buttonText?.trim())
      ctaErrors.push("Button text is required");
    if (!localContent.ctaContent.buttonLink?.trim())
      ctaErrors.push("Button link is required");

    if (ctaErrors.length > 0) {
      setValidationErrors(ctaErrors);
      toast({
        title: "Validation Error",
        description: ctaErrors[0],
        variant: "destructive",
      });
      return;
    }
    setValidationErrors([]);

    if (!hasChanges(localContent.ctaContent, data?.ctaContent)) {
      toast({
        title: "Info",
        description: "No changes detected in CTA section",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateMutation.mutateAsync({
        section: "cta",
        content: localContent.ctaContent,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleFooterSubmit = async () => {
    if (!localContent?.footerContent) return;

    const footerErrors = [];
    if (!localContent.footerContent.companyName?.trim()) {
      footerErrors.push("Company name is required");
    }

    localContent.footerContent.links?.forEach((link, index) => {
      if (!link.label?.trim() && link.path?.trim()) {
        footerErrors.push(
          `Footer link ${index + 1}: Label is required when path is provided`
        );
      }
      if (link.label?.trim() && !link.path?.trim()) {
        footerErrors.push(
          `Footer link ${index + 1}: Path is required when label is provided`
        );
      }
    });

    if (footerErrors.length > 0) {
      setValidationErrors(footerErrors);
      toast({
        title: "Validation Error",
        description: footerErrors[0],
        variant: "destructive",
      });
      return;
    }
    setValidationErrors([]);

    if (!hasChanges(localContent.footerContent, data?.footerContent)) {
      toast({
        title: "Info",
        description: "No changes detected in footer content",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateMutation.mutateAsync({
        section: "footer",
        content: localContent.footerContent,
      });
    } catch (error) {
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!localContent) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        No content found
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Content Management | Admin Dashboard</title>
        <meta
          name="description"
          content="Manage website content including navigation, features, statistics, CTAs, and footer settings for optimal user experience."
        />
        <meta
          name="keywords"
          content="content management, website admin, SEO settings, accessibility"
        />
        <meta
          property="og:title"
          content="Content Management | Admin Dashboard"
        />
        <meta
          property="og:description"
          content="Comprehensive content management interface for website administrators"
        />
      </Helmet>
      <div className="w-full max-w-full overflow-hidden">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Content Management
          </h1>
          <p className="text-gray-600 text-sm">
            Customize your website's content and appearance across all devices
          </p>
        </header>

        <div className="space-y-6">
          <Tabs defaultValue="navigation" className="w-full">
            <TabsList className="w-full flex whitespace-nowrap">
              {["navigation", "features", "statistics", "cta", "footer"].map(
                (tab) => (
                  <TabsTrigger
                    key={tab}
                    value={tab}
                    className="px-4 py-2 text-sm capitalize"
                  >
                    {tab}
                  </TabsTrigger>
                )
              )}
            </TabsList>
            <div className="overflow-x-auto">
              {/* Navigation Tab */}
              <TabsContent value="navigation">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Navigation Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {validationErrors.length > 0 && (
                        <div
                          role="alert"
                          className="text-red-600 text-sm bg-red-50 p-3 rounded-lg"
                        >
                          {validationErrors.map((error, index) => (
                            <p key={index}>• {error}</p>
                          ))}
                        </div>
                      )}
                      {localContent.navItems?.map((item, index) => (
                        <div
                          key={index}
                          className="flex flex-col md:flex-row gap-4 items-start md:items-center"
                        >
                          <div className="w-full md:flex-1 space-y-2">
                            <Label htmlFor={`nav-label-${index}`}>Label</Label>
                            <Input
                              id={`nav-label-${index}`}
                              placeholder="Menu Label"
                              value={item.label}
                              onChange={(e) =>
                                handleNavChange(index, "label", e.target.value)
                              }
                            />
                          </div>
                          <div className="w-full md:flex-1 space-y-2">
                            <Label htmlFor={`nav-path-${index}`}>Path</Label>
                            <Input
                              id={`nav-path-${index}`}
                              placeholder="/example-path"
                              value={item.path}
                              onChange={(e) =>
                                handleNavChange(index, "path", e.target.value)
                              }
                            />
                          </div>
                          <div className="w-full md:flex-1 space-y-2">
                            <Label>Visibility</Label>
                            <select
                              value={item.visibility}
                              onChange={(e) =>
                                handleNavChange(
                                  index,
                                  "visibility",
                                  e.target.value
                                )
                              }
                              className="w-full border rounded-md p-2 text-sm"
                            >
                              <option value="all">All Users</option>
                              <option value="logged-in">Logged In Only</option>
                              <option value="logged-out">
                                Logged Out Only
                              </option>
                              <option value="admin">Admin Only</option>
                            </select>
                          </div>
                          <Button
                            variant="destructive"
                            onClick={() =>
                              handleDeleteRequest("nav", index, item.label)
                            }
                            className="mt-7"
                            aria-label={`Remove navigation item ${item.label}`}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                      <div className="flex flex-col sm:flex-row gap-2 ">
                        <Button
                          onClick={() => {
                            setLocalContent((prev) => ({
                              ...prev,
                              navItems: [
                                ...(prev.navItems || []),
                                { label: "", path: "", visibility: "all" },
                              ],
                            }));
                          }}
                        >
                          Add Navigation Item
                        </Button>
                        <Button onClick={handleNavSubmit}>
                          Save Navigation
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Features Tab */}
              <TabsContent value="features">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Features Section</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label>Section Title</Label>
                        <Input
                          placeholder="Why Choose Us?"
                          value={localContent.featuresContent?.title || ""}
                          onChange={(e) =>
                            setLocalContent((prev) => ({
                              ...prev,
                              featuresContent: {
                                ...prev.featuresContent,
                                title: e.target.value,
                              },
                            }))
                          }
                        />
                      </div>

                      {/* Features List */}
                      <div className="space-y-4">
                        {localContent.featuresContent?.items?.map(
                          (feature, index) => (
                            <div
                              key={index}
                              className="space-y-4 p-4 border rounded-lg"
                            >
                              <div className="flex justify-between items-center">
                                <h3 className="font-medium">
                                  Feature {index + 1}
                                </h3>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() =>
                                    handleDeleteRequest(
                                      "feature",
                                      index,
                                      feature.title
                                    )
                                  }
                                  aria-label={`Remove feature ${feature.title}`}
                                >
                                  Remove
                                </Button>
                              </div>
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <Label>Title</Label>
                                  <Input
                                    placeholder="Feature Title"
                                    value={feature.title}
                                    onChange={(e) => {
                                      const newItems = [
                                        ...(localContent.featuresContent
                                          ?.items || []),
                                      ];
                                      newItems[index] = {
                                        ...newItems[index],
                                        title: e.target.value,
                                      };
                                      setLocalContent((prev) => ({
                                        ...prev,
                                        featuresContent: {
                                          ...prev.featuresContent,
                                          items: newItems,
                                        },
                                      }));
                                    }}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Description</Label>
                                  <Textarea
                                    placeholder="Feature description..."
                                    value={feature.description}
                                    onChange={(e) => {
                                      const newItems = [
                                        ...(localContent.featuresContent
                                          ?.items || []),
                                      ];
                                      newItems[index] = {
                                        ...newItems[index],
                                        description: e.target.value,
                                      };
                                      setLocalContent((prev) => ({
                                        ...prev,
                                        featuresContent: {
                                          ...prev.featuresContent,
                                          items: newItems,
                                        },
                                      }));
                                    }}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Icon</Label>
                                  <select
                                    value={feature.icon}
                                    onChange={(e) => {
                                      const newItems = [
                                        ...(localContent.featuresContent
                                          ?.items || []),
                                      ];
                                      newItems[index] = {
                                        ...newItems[index],
                                        icon: e.target.value,
                                      };
                                      setLocalContent((prev) => ({
                                        ...prev,
                                        featuresContent: {
                                          ...prev.featuresContent,
                                          items: newItems,
                                        },
                                      }));
                                    }}
                                    className="w-full border rounded-md p-2 text-sm"
                                  >
                                    <option value="CheckCircle">
                                      Check Circle
                                    </option>
                                    <option value="Clock">Clock</option>
                                    <option value="AlertTriangle">
                                      Alert Triangle
                                    </option>
                                  </select>
                                </div>
                              </div>
                            </div>
                          )
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button
                          onClick={() => {
                            setLocalContent((prev) => ({
                              ...prev,
                              featuresContent: {
                                ...prev.featuresContent,
                                items: [
                                  ...(prev.featuresContent?.items || []),
                                  {
                                    title: "",
                                    description: "",
                                    icon: "CheckCircle",
                                  },
                                ],
                              },
                            }));
                          }}
                        >
                          Add Feature
                        </Button>
                        <Button
                          onClick={handleFeaturesSubmit}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Save Features
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Statistics Tab */}
              <TabsContent value="statistics">
                {/* Statistics Section */}
                <Card>
                  <CardHeader>
                    <CardTitle>Statistics Section</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {localContent.statisticsContent?.items?.map(
                        (stat, index) => (
                          <div
                            key={index}
                            className="space-y-2 p-4 border rounded-lg"
                          >
                            <div className="flex justify-between items-center">
                              <h4 className="font-medium">
                                Statistic {index + 1}
                              </h4>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() =>
                                  handleDeleteRequest(
                                    "statistic",
                                    index,
                                    stat.label
                                  )
                                }
                              >
                                Remove
                              </Button>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <Input
                                placeholder="Value (e.g., 1000+)"
                                value={stat.value}
                                onChange={(e) => {
                                  const newItems = [
                                    ...(localContent.statisticsContent?.items ||
                                      []),
                                  ];
                                  newItems[index] = {
                                    ...newItems[index],
                                    value: e.target.value,
                                  };
                                  setLocalContent((prev) => ({
                                    ...prev,
                                    statisticsContent: { items: newItems },
                                  }));
                                }}
                              />
                              <Input
                                placeholder="Label"
                                value={stat.label}
                                onChange={(e) => {
                                  const newItems = [
                                    ...(localContent.statisticsContent?.items ||
                                      []),
                                  ];
                                  newItems[index] = {
                                    ...newItems[index],
                                    label: e.target.value,
                                  };
                                  setLocalContent((prev) => ({
                                    ...prev,
                                    statisticsContent: { items: newItems },
                                  }));
                                }}
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <span>Color:</span>
                              <Input
                                type="color"
                                value={stat.color}
                                onChange={(e) => {
                                  const newItems = [
                                    ...(localContent.statisticsContent?.items ||
                                      []),
                                  ];
                                  newItems[index] = {
                                    ...newItems[index],
                                    color: e.target.value,
                                  };
                                  setLocalContent((prev) => ({
                                    ...prev,
                                    statisticsContent: { items: newItems },
                                  }));
                                }}
                                className="w-20 h-10"
                              />
                            </div>
                          </div>
                        )
                      )}
                      <Button
                        onClick={() => {
                          setLocalContent((prev) => ({
                            ...prev,
                            statisticsContent: {
                              items: [
                                ...(prev.statisticsContent?.items || []),
                                { value: "", label: "", color: "#000000" },
                              ],
                            },
                          }));
                        }}
                      >
                        Add Statistic
                      </Button>
                      <Button onClick={handleStatisticsSubmit} className="m-2">
                        Save Statistics
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* CTA Tab */}
              <TabsContent value="cta">
                <Card>
                  <CardHeader>
                    <CardTitle>Call to Action Section</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Input
                        placeholder="Title"
                        value={localContent.ctaContent?.title || ""}
                        onChange={(e) =>
                          setLocalContent((prev) => ({
                            ...prev,
                            ctaContent: {
                              ...prev.ctaContent,
                              title: e.target.value,
                            },
                          }))
                        }
                      />
                      <Textarea
                        placeholder="Subtitle"
                        value={localContent.ctaContent?.subtitle || ""}
                        onChange={(e) =>
                          setLocalContent((prev) => ({
                            ...prev,
                            ctaContent: {
                              ...prev.ctaContent,
                              subtitle: e.target.value,
                            },
                          }))
                        }
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          placeholder="Button Text"
                          value={localContent.ctaContent?.buttonText || ""}
                          onChange={(e) =>
                            setLocalContent((prev) => ({
                              ...prev,
                              ctaContent: {
                                ...prev.ctaContent,
                                buttonText: e.target.value,
                              },
                            }))
                          }
                        />
                        <Input
                          placeholder="Button Link"
                          value={localContent.ctaContent?.buttonLink || ""}
                          onChange={(e) =>
                            setLocalContent((prev) => ({
                              ...prev,
                              ctaContent: {
                                ...prev.ctaContent,
                                buttonLink: e.target.value,
                              },
                            }))
                          }
                        />
                      </div>
                      <Button onClick={handleCtaSubmit} className="mt-4">
                        Save CTA
                      </Button>
                    </div>
                  </CardContent>
                </Card>{" "}
              </TabsContent>

              {/* Footer Tab */}
              <TabsContent value="footer">
                <Card>
                  <CardHeader>
                    <CardTitle>Footer</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Input
                        placeholder="Company Name"
                        value={localContent.footerContent?.companyName || ""}
                        onChange={(e) =>
                          setLocalContent((prev) => ({
                            ...prev,
                            footerContent: {
                              ...prev.footerContent,
                              companyName: e.target.value,
                            },
                          }))
                        }
                      />
                      <Textarea
                        placeholder="Description"
                        value={localContent.footerContent?.description || ""}
                        onChange={(e) =>
                          setLocalContent((prev) => ({
                            ...prev,
                            footerContent: {
                              ...prev.footerContent,
                              description: e.target.value,
                            },
                          }))
                        }
                      />
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">Footer Links</h3>
                        {localContent.footerContent?.links?.map(
                          (link, index) => (
                            <div key={index} className="flex gap-4">
                              <Input
                                placeholder="Label"
                                value={link.label}
                                onChange={(e) => {
                                  const newLinks = [
                                    ...(localContent.footerContent?.links ||
                                      []),
                                  ];
                                  newLinks[index] = {
                                    ...newLinks[index],
                                    label: e.target.value,
                                  };
                                  setLocalContent((prev) => ({
                                    ...prev,
                                    footerContent: {
                                      ...prev.footerContent,
                                      links: newLinks,
                                    },
                                  }));
                                }}
                              />
                              <Input
                                placeholder="Path"
                                value={link.path}
                                onChange={(e) => {
                                  const newLinks = [
                                    ...(localContent.footerContent?.links ||
                                      []),
                                  ];
                                  newLinks[index] = {
                                    ...newLinks[index],
                                    path: e.target.value,
                                  };
                                  setLocalContent((prev) => ({
                                    ...prev,
                                    footerContent: {
                                      ...prev.footerContent,
                                      links: newLinks,
                                    },
                                  }));
                                }}
                              />
                              <Button
                                variant="destructive"
                                onClick={() =>
                                  handleDeleteRequest(
                                    "footer",
                                    index,
                                    link.label
                                  )
                                }
                              >
                                Remove
                              </Button>
                            </div>
                          )
                        )}
                        <Button
                          className="mt-6"
                          onClick={() => {
                            setLocalContent((prev) => ({
                              ...prev,
                              footerContent: {
                                ...prev.footerContent,
                                links: [
                                  ...(prev.footerContent?.links || []),
                                  { label: "", path: "", visibility: "all" },
                                ],
                              },
                            }));
                          }}
                        >
                          Add Footer Link
                        </Button>
                      </div>
                      <Button onClick={handleFooterSubmit} className="mt-4">
                        Save Footer
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </div>

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
                <span className="text-black font-medium">
                  {deleteConfirm.itemLabel}
                </span>
                ? This action cannot be undone until you save your changes.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="sm:space-x-2">
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );
};

export default ContentManagement;
