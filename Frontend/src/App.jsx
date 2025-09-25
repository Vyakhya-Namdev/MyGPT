import React from "react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./MyContext.jsx";
import { ThemeProvider } from "./ThemeContext";
import AppRoutes from "./AppRoutes"; // Assuming you moved your routes to a separate component file

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <AppRoutes />
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
