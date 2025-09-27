import { useSettings } from "@/hooks/useSettings";
import { RegisterForm } from "../components/forms/RegisterForm";
import Card from "@/components/ui/Card";
import { useEffect } from "react";

function RegisterPage() {
  const {
    settings: { activityCode },
    refetch,
  } = useSettings();

  useEffect(() => {
    refetch();
  }, []);

  return (
    <>
      {activityCode ? (
        <Card className="sm:max-w-md sm:mx-auto">
          <h2 className="display-panel !mt-[-50px]">Bienvenid@</h2>
          <RegisterForm />
        </Card>
      ) : (
        <Card className="sm:max-w-md sm:mx-auto">
          <div className="bg-white p-4 text-center rounded-4xl font-bold">
            No hay eventos activos en este momento
          </div>
        </Card>
      )}
    </>
  );
}
export default RegisterPage;
