import AuthWrapper from "../auth/AuthWrapper";
import { LoginPage } from "../../src/legacy-pages/AuthPages";

export const metadata = {
  title: "Login",
  description: "Log in to manage your HEALO account.",
};

export default function Login() {
  return <AuthWrapper Component={LoginPage} />;
}
