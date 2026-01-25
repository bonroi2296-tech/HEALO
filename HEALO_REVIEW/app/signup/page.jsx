import AuthWrapper from "../auth/AuthWrapper";
import { SignUpPage } from "../../src/legacy-pages/AuthPages";

export const metadata = {
  title: "Sign Up",
  description: "Create a HEALO account to access concierge services.",
};

export default function SignUp() {
  return <AuthWrapper Component={SignUpPage} />;
}
