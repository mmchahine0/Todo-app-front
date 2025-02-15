export const ENDPOINTS = {
  Auth: {
    Signin: "/auth/signin",
    Signup: "/auth/signup",
    VerifyEmail: "/auth/verify-email",
    ResendCode: "/auth/resend-code",
    ForgotPassword: "/auth/forgot-password",
    ResetPassword: "/auth/reset-password",
    RefreshToken: "/auth/refresh",
  },
  Todos: {
    Base: "/todos",
    ById: (id: string) => `/todos/${id}`,
  },
  User: {
    Profile: "/user/profile",
  },
  Admin: {
    Users: "/admin/users",
    MakeAdmin: (id: string) => `/admin/users/${id}/make-admin`,
    RevokeAdmin: (id: string) => `/admin/users/${id}/revoke-admin`,
    Suspend: (id: string) => `/admin/users/${id}/suspend`,
    Unsuspend: (id: string) => `/admin/users/${id}/unsuspend`,
    Pages: {
      List: "/pages",
      Create: "/admin/pages",
      Update: (id: string) => `/admin/pages/${id}`,
      Delete: (id: string) => `/admin/pages/${id}`,
      GetRoutes: "/admin/routes",
      Published: "/pages/published",
    },
  },
  PageContent: {
    Get: (pageId: string) => `/api/pages/${pageId}/content`,
    Update: (pageId: string, section: string) =>
      `/api/admin/pages/${pageId}/content/${section}`,
  },
  Content: {
    Get: "/content",
    Update: (section: string) => `/admin/content/${section}`,
  },
};
