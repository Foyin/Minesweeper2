// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  SignUpCommand,
  ConfirmSignUpCommand,
  AuthFlowType,
  GlobalSignOutCommand,
  ResendConfirmationCodeCommand,
  ResendConfirmationCodeCommandInput,
  type InitiateAuthCommandInput,
  type SignUpCommandInput,
  type ConfirmSignUpCommandInput,
} from "@aws-sdk/client-cognito-identity-provider";
import { useNavigate } from "react-router-dom";
import crypto from "crypto";

export const cognitoClient = new CognitoIdentityProviderClient({
  region: import.meta.env.VITE_REGION,
});

// Utility function to check if a JWT token has expired
const isTokenExpired = (token: string | null): boolean => {
  if (!token) return true;
  const payload = JSON.parse(atob(token.split('.')[1])); // Decode JWT token
  const expirationTime = payload.exp * 1000; // Expiry time is in seconds, convert to milliseconds
  return expirationTime < Date.now(); // Check if expired
};

// Function to refresh tokens using the refresh token
const refreshTokens = async (): Promise<boolean> => {
  const refreshToken = sessionStorage.getItem("refreshToken");
  if (!refreshToken) {
    console.log("No refresh token available.");
    return false; // No refresh token available, cannot refresh
  }

  try {
    const params = {
      AuthFlow: AuthFlowType.REFRESH_TOKEN,  // Correct enum value here
      ClientId: import.meta.env.VITE_CLIENT_ID,
      AuthParameters: {
        REFRESH_TOKEN: refreshToken,
      },
    };

    const command = new InitiateAuthCommand(params);
    const { AuthenticationResult } = await cognitoClient.send(command);

    if (AuthenticationResult) {
      // Store the new tokens in session storage
      sessionStorage.setItem("idToken", AuthenticationResult.IdToken || "");
      sessionStorage.setItem("accessToken", AuthenticationResult.AccessToken || "");
      sessionStorage.setItem("refreshToken", AuthenticationResult.RefreshToken || "");

      console.log("Tokens refreshed successfully.");
      return true;
    }
  } catch (error) {
    console.error("Error refreshing tokens:", error);
    return false; // Token refresh failed
  }
};


export const signIn = async (username: string, password: string) => {
  const params: InitiateAuthCommandInput = {
    AuthFlow: "USER_PASSWORD_AUTH",
    ClientId: import.meta.env.VITE_CLIENT_ID,
    AuthParameters: {
      USERNAME: username,
      PASSWORD: password,
    },
  };
  try {
    const command = new InitiateAuthCommand(params);
    const { AuthenticationResult } = await cognitoClient.send(command);
    if (AuthenticationResult) {
      sessionStorage.setItem("idToken", AuthenticationResult.IdToken || "");
      sessionStorage.setItem(
        "accessToken",
        AuthenticationResult.AccessToken || "",
      );
      sessionStorage.setItem(
        "refreshToken",
        AuthenticationResult.RefreshToken || "",
      );
      return AuthenticationResult;
    }
  } catch (error) {
    console.error("Error signing in: ", error);
    throw error;
  }
};

export const signUp = async (username: string, email: string, password: string) => {
  const params: SignUpCommandInput = {
    ClientId: import.meta.env.VITE_CLIENT_ID,
    Username: username,
    Password: password,
    UserAttributes: [
      {
        Name: "name",
        Value: username,
      },
      {
        Name: "email",
        Value: email,
      }
    ],
  };
  try {
    const command = new SignUpCommand(params);
    const response = await cognitoClient.send(command);
    console.log("Sign up success: ", response);
    return response;
  } catch (error) {
    console.error("Error signing up: ", error);
    throw error;
  }
};

export const resendConfirmationCode = async (username: string) => {
  const params: ResendConfirmationCodeCommandInput = {
    ClientId: import.meta.env.VITE_CLIENT_ID,
    Username: username,
  };
  console.log(username);

  try {
    const command = new ResendConfirmationCodeCommand(params);
    const response = await cognitoClient.send(command);
    console.log("Resend confirmation success:", response);
    console.log("Confirmation email resent! Check your inbox.");
  } catch (error) {
    console.log("Error resending confirmation email:", error);
    console.log(`Error: ${(error as Error).message}`);
  }
}

export const confirmSignUp = async (username: string, code: string) => {
  const params: ConfirmSignUpCommandInput = {
    ClientId: import.meta.env.VITE_CLIENT_ID,
    Username: username,
    ConfirmationCode: code,
  };
  try {
    const command = new ConfirmSignUpCommand(params);
    await cognitoClient.send(command);
    console.log("User confirmed successfully");
    return true;
  } catch (error) {
    console.error("Error confirming sign up: ", error);
    throw error;
  }
};

export const signOut = async () => {
  try {
    // Assuming the user is authenticated and tokens are stored in sessionStorage
    const idToken = sessionStorage.getItem("idToken");
    const accessToken = sessionStorage.getItem("accessToken");
    
    if (!idToken || !accessToken) {
      console.error("User is not authenticated.");
      throw new Error("No user session found.");
    }


    if (!accessToken) {
      console.log("No access token found, user is already signed out.");
      return;
    }

    if (isTokenExpired(accessToken)) {
      console.log("Access token has expired, attempting to refresh tokens...");

      // Try refreshing the tokens
      const refreshed = await refreshTokens();
      if (!refreshed) {
        alert("Unable to refresh tokens. Please log in again. If sign out didnt work try clearing cache and refresh page");
        const navigate = useNavigate();
        navigate("/"); // Redirect to login if token refresh fails
        return;
      }
    }

    // Global sign out using the AWS SDK
    const params = {
      AccessToken: accessToken, // Required to sign out
    };

    const command = new GlobalSignOutCommand(params);
    await cognitoClient.send(command);

    // Remove session tokens from sessionStorage
    sessionStorage.removeItem("idToken");
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("refreshToken");

    console.log("User signed out successfully");
    return true;
  } catch (error) {
    console.error("Error signing out: ", error);
    throw error;
  }
};
