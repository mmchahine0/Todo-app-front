export const ENDPOINTS = {
  Auth: {
    Signin: "/auth/signin",
    Signup: "/auth/signup",
    RefreshToken: "/auth/refresh",
  },
  Todos: {
    Base: "/todos",
    ById: (id: string) => `/todos/${id}`,
  },
  User: {
    Profile: "/user/profile",
  },
};
