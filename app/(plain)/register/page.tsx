import SignUpPage from "@/components/pages/Register";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Register",
  description: "Register and save your places",
};

const SignUp = () => {
  return <SignUpPage />;
};

export default SignUp;
