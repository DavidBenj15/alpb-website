import AWS from "aws-sdk";

// Initialize the Cognito service provider with the specified region
const cognito = new AWS.CognitoIdentityServiceProvider({
  region: "us-east-2",
});

// Function to sign up a new user
export const signUpUser = async (
  email: string,
  password: string,
  firstName: string,
  lastName: string,
) => {
  const clientId = process.env.NEXT_PUBLIC_COGNITO_APP_CLIENT_ID;
  if (!clientId) {
    throw new Error("Missing Cognito App Client ID");
  }

  const params = {
    ClientId: clientId,
    Username: email,
    Password: password,
    UserAttributes: [
      { Name: "email", Value: email },
      { Name: "given_name", Value: firstName },
      { Name: "family_name", Value: lastName },
    ],
  };

  try {
    const result = await cognito.signUp(params).promise();
    return result;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Sign up error: ${error.message}`);
    } else {
      throw new Error("Sign up error: An unknown error occurred");
    }
  }
};

// Function to sign in an existing user
export const signInUser = async (email: string, password: string) => {
  const params = {
    AuthFlow: "USER_PASSWORD_AUTH",
    ClientId: process.env.NEXT_PUBLIC_COGNITO_APP_CLIENT_ID!, // Ensure this is set in .env.local
    AuthParameters: {
      USERNAME: email,
      PASSWORD: password,
    },
  };

  try {
    const result = await cognito.initiateAuth(params).promise();
    return result.AuthenticationResult; // Contains the tokens (ID, Access, Refresh tokens)
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`Sign in error: ${error.message}`);
    } else {
      throw new Error("Sign in error: An unknown error occurred");
    }
  }
};

// Function to confirm user sign up with a confirmation code
export const confirmSignUp = async (
  email: string,
  confirmationCode: string,
) => {
  const params = {
    ClientId: process.env.NEXT_PUBLIC_COGNITO_APP_CLIENT_ID!, // Ensure this is set
    Username: email,
    ConfirmationCode: confirmationCode,
  };

  try {
    await cognito.confirmSignUp(params).promise();
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`Confirmation error: ${error.message}`);
    } else {
      throw new Error("Confirmation error: An unknown error occurred");
    }
  }
};
