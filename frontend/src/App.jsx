import React from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Dashboard from "./components/Dashboard";
import "./styles/index.css";

function App() {
  return (
    <>
      <Dashboard />
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        toastStyle={{
          backgroundColor: "#0F1117",
          border: "1px solid #1E2030",
          color: "#E2E8F0",
        }}
      />
    </>
  );
}

export default App;
