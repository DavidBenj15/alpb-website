import pkg from "aws-sdk";
const { CognitoIdentityServiceProvider } = pkg;

const cognito = new CognitoIdentityServiceProvider({
  region: "us-east-2",
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

export default cognito; 