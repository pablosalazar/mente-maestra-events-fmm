import RegisterForm from "@/components/forms/RegisterForm";
import Card from "@/components/ui/Card";

export default function Register() {
  return (
    <Card className="md:max-w-[1024px] md:mx-auto">
      <RegisterForm />
    </Card>
  );
}
