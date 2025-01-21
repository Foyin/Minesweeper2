// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./loginPage";
import HomePage from "./homePage";
import ConfirmUserPage from "./confirmUserPage";
import "./App.css";
import { useState } from "react";
import axios from "axios";
import { winner } from "./winnerInterface"


const App = () => {
  const isAuthenticated = () => {
    const accessToken = sessionStorage.getItem("accessToken");
    return !!accessToken;
  };
  const [username, setUsername] = useState("");

  const handleUsernameChange = (username: string) => {
    setUsername(username)
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={ <HomePage />} 
          />
        <Route path="/login" element={<LoginPage username={username}
                                                 handleUsernameChange={handleUsernameChange} />} />
        <Route path="/confirm" element={<ConfirmUserPage username={username}
                                                          handleUsernameChange={handleUsernameChange}/>} />
        <Route
          path="/home"
          element={
            isAuthenticated() ? <HomePage  /> : <Navigate replace to="/login" />
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
