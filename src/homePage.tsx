// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { useNavigate } from "react-router-dom";
import Minesweeper from "./Minesweeper/minsweeper.tsx";
import { signOut } from "./authService.ts";
import { useState, useEffect } from "react";
import { winner } from "./winnerInterface"


interface HomePageProps{
  
}

function parseJwt(token) {
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const jsonPayload = decodeURIComponent(
    window
      .atob(base64)
      .split("")
      .map((c) => `%${(`00${c.charCodeAt(0).toString(16)}`).slice(-2)}`)
      .join(""),
  );
  return JSON.parse(jsonPayload);
}

const HomePage = ( {   } : HomePageProps ) => {
  const navigate = useNavigate();
  //const [username, setUsername] = useState<string>(null);
  let username = null;


  if (sessionStorage.idToken != undefined){
    const idToken = parseJwt(sessionStorage.idToken.toString());
    const accessToken = parseJwt(sessionStorage.accessToken.toString());
    console.log(
      `Amazon Cognito ID token encoded: ${sessionStorage.idToken.toString()}`,
    );
    console.log("Amazon Cognito ID token decoded: ");
    console.log(idToken);
    console.log(
      `Amazon Cognito access token encoded: ${sessionStorage.accessToken.toString()}`,
    );
    console.log("Amazon Cognito access token decoded: ");
    console.log(accessToken);
    console.log("Amazon Cognito refresh token: ");
    console.log(sessionStorage.refreshToken);
    username = accessToken.username;
  }

  
const handleSignOut = async () => {
  try {
    await signOut();
    sessionStorage.removeItem("idToken");
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("refreshToken");

    navigate("/");  // Redirects to the login page
  } catch (error) {
    console.error("Failed to sign out:", error);
  }
};

const handleSignIn = () => {
  navigate("/login");
}

  return (
    <div>
      <div className="topBar">
        {sessionStorage.idToken != undefined ? <div>{username}</div>: <div></div>}
        <button type="button" onClick={() => sessionStorage.idToken != undefined ? handleSignOut() : handleSignIn()}>
        {sessionStorage.idToken ? "Sign Out" : "Sign In"}
        </button>
      </div>
      <Minesweeper 
      username={username} />
    </div>
  );
};

export default HomePage;
