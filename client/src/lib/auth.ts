// lib/auth.ts
export const isLoggedIn = () => {
  return !!localStorage.getItem("token"); // hoặc flag nào đó
};

export const login = (token: string) => {
  localStorage.setItem("token", token);
};

export const logout = () => {
  localStorage.removeItem("token");
};
