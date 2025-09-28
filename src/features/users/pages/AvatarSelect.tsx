import clsx from "clsx";
import { useAuth } from "@/hooks/useAuth";
import { avatars } from "@/utils/avatars";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { useUpdateUser } from "../hooks";
import { Loader } from "@/components/loader/Loader";

export default function AvatarSelect() {
  const { user, updateAvatar } = useAuth();

  const { mutateAsync: updateUser, isPending } = useUpdateUser();
  const navigate = useNavigate();

  const handleAvatarChange = (avatar: string) => {
    updateAvatar(avatar);
  };

  const handleSaveAvatar = () => {
    if (!user) {
      toast.error("Usuario no encontrado");
      return;
    }

    updateUser({
      id: user.id,
      userData: {
        avatar: user.avatar,
      },
    }).then(() => {
      toast.success("Avatar guardado");
      navigate("/");
    });
  };

  return (
    <>
      {isPending && <Loader message="Guardando avatar..." />}
      <div className="max-w-2xl mx-auto mt-[-40px]">
        <div className="glass-card mx-auto">
          <h2 className="text-2xl font-bold text-[var(--dark-blue)] ">
            Elige tu avatar
          </h2>
        </div>
        <div className="grid grid-cols-4 gap-6 mt-10 mb-10">
          {avatars.map((src, i) => (
            <button
              key={src}
              type="button"
              className={`flex items-center justify-center cursor-pointer`}
              onClick={() => handleAvatarChange(src)}
            >
              <figure
                className={clsx(
                  "border-4 border-white rounded-full shadow-lg",
                  {
                    "!border-[var(--primary)] ": user?.avatar === src,
                  }
                )}
              >
                <img src={src} alt={`Avatar ${i + 1}`} width={90} />
              </figure>
            </button>
          ))}
        </div>
        <div className="text-center">
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSaveAvatar}
          >
            Guardar y continuar
          </button>
        </div>
      </div>
    </>
  );
}
