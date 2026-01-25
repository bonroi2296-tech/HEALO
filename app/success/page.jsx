import AuthWrapper from "../auth/AuthWrapper";
import { SuccessPage } from "../../src/legacy-pages/AuthPages";

export const metadata = {
  title: "Success",
  description: "Your inquiry has been received by HEALO.",
};

export default function Success() {
  return <AuthWrapper Component={SuccessPage} />;
}
