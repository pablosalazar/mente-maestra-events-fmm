import { LoginForm } from "@/components/forms/LoginForm";
import Card from "@/components/ui/Card";

export default function Login() {
  return (
    <Card className="sm:max-w-md sm:mx-auto">
      <h2 className="display-panel !mt-[-50px]">Bienvenid@</h2>
      <LoginForm />
    </Card>
  );
}
