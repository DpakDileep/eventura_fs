import { useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Homepage from "./components/Homepage";
import AppNavbar from "./components/AppNavbar";
import Signup from "./components/Signup";

function App() {
  return (
    <>
      <BrowserRouter>
        <AppNavbar />
        <Routes>
          <Route path="/" element={<Homepage />}></Route>
          <Route path="/signup" element={<Signup />}></Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
