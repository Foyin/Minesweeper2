// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signIn, signUp } from "./authService";

interface LoginPageProps{
  username: string
  handleUsernameChange: (string) => void;
}

const LoginPage = ( { username, handleUsernameChange }: LoginPageProps ) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();

  const handleSignIn = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    try {
      const session = await signIn(email, password);
      console.log("Sign in successful", session);
      if (session && typeof session.AccessToken !== "undefined") {
        sessionStorage.setItem("accessToken", session.AccessToken);
        if (sessionStorage.getItem("accessToken")) {
          window.location.href = "/";
        } else {
          console.error("Session token was not set properly.");
        }
      } else {
        console.error("SignIn session or AccessToken is undefined.");
      }
    } catch (error) {
      alert(`Sign in failed: ${error}`);
    }
  };

  const handleSignUp = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    try {
      await signUp(username, email, password);
      navigate("/", { state: { email } });
    } catch (error) {
      alert(`Sign up failed: ${error}`);
    }
  };

  const goToHome = ( ) => {
    navigate("/");
    window.location.reload();
    console.log("going back")
  }

  return (
    <div className="loginForm">
      <h1>Welcome</h1>
      <h4>
        {isSignUp ? "Sign up to create an account" : "Sign in to your account"}
      </h4>
      <form onSubmit={isSignUp ? handleSignUp : handleSignIn}>
      {isSignUp && (
        <div>
          <input
            className="inputText"
            id="username"
            type="username"
            value={username}
            onChange={(e) => handleUsernameChange(e.target.value)}
            placeholder="Username"
            required
          />
        </div>)
        }

        <div>
          <input
            className="inputText"
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
          />
        </div>
        <div>
          <input
            className="inputText"
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />
        </div>
        {isSignUp && (
          <div>
            <input
              className="inputText"
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm Password"
              required
            />
          </div>
        )}
        <button type="submit">{isSignUp ? "Sign Up" : "Sign In"}</button>
      </form>
      <button type="button" onClick={() => setIsSignUp(!isSignUp)}>
        {isSignUp
          ? "Already have an account? Sign In"
          : "Need an account? Sign Up"}
      </button>
      <button type="button" onClick={goToHome}>
        Home
      </button>
    </div>
  );
};

export default LoginPage;
