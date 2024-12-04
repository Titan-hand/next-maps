import LoginPage from "@/components/pages/login";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Login",
  description: "Login and save your places",
};


const Login= () => {
  return <LoginPage />;
};

export default Login;
