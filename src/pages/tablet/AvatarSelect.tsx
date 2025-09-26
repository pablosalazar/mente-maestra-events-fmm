import { Loader } from "@/components/loader/Loader";
import { useAuth } from "@/hooks/useAuth";
import { saveAvatar } from "@/services/auth.service";
import { avatars } from "@/utils/avatars";
import { useMutation } from "@tanstack/react-query";
import clsx from "clsx";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

export default function AvatarSelect() {
  const { user, updateAvatar } = useAuth();
  const navigate = useNavigate();
  const [hasCheckedAvatar, setHasCheckedAvatar] = useState(false);

  const { mutate, isPending } = useMutation({
    mutationFn: ({ userId, avatar }: { userId: string; avatar: string }) =>
      saveAvatar(userId, avatar),
    onSuccess: () => {
      toast.success("Avatar guardado exitosamente");
      setTimeout(() => {
        navigate("/sala-espera");
      }, 1000);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al guardar el avatar");
    },
  });

  const handleAvatarChange = (avatar: string) => {
    console.log("avatar", avatar);
    updateAvatar(avatar);
  };

  console.log(avatars);

  const handleSaveAvatar = () => {
    if (!user) {
      toast.error("Usuario no encontrado");
      return;
    }

    mutate({
      userId: user.id,
      avatar: user.avatar,
    });
  };

  useEffect(() => {
    if (user?.avatar && !hasCheckedAvatar) {
      navigate("/sala-espera");
    }
    setHasCheckedAvatar(true);
  }, [user, navigate, hasCheckedAvatar]);

  return (
    <div className="max-w-2xl mx-auto mt-[-40px]">
      {isPending && <Loader message="Guardando avatar..." />}
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
            disabled={isPending}
          >
            <figure
              className={clsx("border-4 border-white rounded-full shadow-lg", {
                "!border-[var(--primary)] ": user?.avatar === src,
              })}
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
          disabled={isPending || !user?.avatar}
        >
          Guardar y continuar
        </button>
      </div>
    </div>
  );
}
