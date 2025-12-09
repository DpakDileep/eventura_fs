import { useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Homepage from "./components/Homepage";
import AppNavbar from "./components/AppNavbar";
import Signup from "./components/Signup";
import Login from "./components/Login";
import CreateEvent from "./components/CreateEvent";
import EventDetails from "./components/EventDetails";
import EventsPage from "./components/EventsPage";
import Dashboard from "./components/Dashboard";
import MyTickets from "./components/MyTickets";

function App() {
  return (
    <>
      <BrowserRouter>
        <AppNavbar />
        <Routes>
          <Route path="/" element={<Homepage />}></Route>
          <Route path="/signup" element={<Signup />}></Route>
          <Route path="/login" element={<Login/>}></Route>
          <Route path="/events" element={<EventsPage/>}></Route>
          <Route path="/create-event" element={<CreateEvent/>}></Route>
          <Route path="/event-details" element={<EventDetails/>}></Route>
          <Route path="/dashboard" element={<Dashboard/>}></Route>
          <Route path="/my-tickets" element={<MyTickets/>}></Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
