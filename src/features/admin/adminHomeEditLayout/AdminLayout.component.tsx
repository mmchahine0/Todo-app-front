import { useQuery, useMutation } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/persist/persist";
import { getContent, updateContent } from "./AdminLayout.services";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { queryClient } from "@/lib/queryClient";
import { NavItem, HeroContent, FooterContent } from "./AdminLayout.types";

const ContentManagement = () => {
  const { toast } = useToast();
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);

  const { data, isLoading } = useQuery({
    queryKey: ["content"],
    queryFn: () => getContent(accessToken),
  });

  const [navItems, setNavItems] = useState<NavItem[]>([]);
  const [heroContent, setHeroContent] = useState<HeroContent>({title: "",
    subtitle: "",
    buttonText: "",
    buttonLink: ""});
  const [footerContent, setFooterContent] = useState<FooterContent>({
    companyName: "",
    description: "",
    links: []}
  );

  useEffect(() => {
    if (data?.data) {
      const navbar = Array.isArray(data.data.navbar) ? data.data.navbar : [];
      setNavItems(navbar);
      setHeroContent(
        data.data.hero || {
          title: "",
          subtitle: "",
          buttonText: "",
          buttonLink: "",
        }
      );
      setFooterContent(
        data.data.footer || {
          companyName: "",
          description: "",
          links: [],
        }
      );
    }
  }, [data]);

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
  });

  const addNavItem = () => {
    setNavItems([...navItems, { label: "", path: "",visibility: 'logged-out'}]);
  };

  const removeNavItem = (index: number) => {
    setNavItems(navItems.filter((_, i) => i !== index));
  };

  const handleNavUpdate = () => {
    updateMutation.mutate({
      section: "navbar",
      content: navItems,
    });
  };

  const handleHeroUpdate = () => {
    updateMutation.mutate({
      section: "hero",
      content: heroContent,
    });
  };

  const handleFooterUpdate = () => {
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
          newItems[index].visibility = e.target.value as 'logged-in' | 'logged-out' | 'all';
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
      onClick={() => removeNavItem(index)}
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
                    onClick={() => {
                      const newLinks = footerContent?.links.filter(
                        (_, i) => i !== index
                      );
                      setFooterContent(
                        (prev) =>
                          ({
                            ...prev,
                            links: newLinks,
                          } as FooterContent)
                      );
                    }}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button
                onClick={() => {
                  const newLinks = [
                    ...(footerContent?.links || []),
                    { label: "", path: "" },
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
    </div>
  );
};

export default ContentManagement;
