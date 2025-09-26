const modules = import.meta.glob("/src/assets/images/avatars/*.png", {
  eager: true,
  as: "url",
}) as Record<string, string>; // Cambiar el tipo aquí

export const avatars: string[] = Object.entries(modules)
  .sort(([a], [b]) => {
    const na = Number(a.match(/avatar_(\d+)\.png$/)?.[1] ?? 0);
    const nb = Number(b.match(/avatar_(\d+)\.png$/)?.[1] ?? 0);
    return na - nb;
  })
  .map(([, url]) => {
    // Cambiar 'mod' por 'url'
    // Limpiar parámetros de query como ?t=1755249684292
    const cleanPath = url.split("?")[0]; // Usar 'url' directamente
    return cleanPath;
  });

export const getAvatar = (n: number) => avatars[n - 1];

// NEW: Function to handle full path strings
export const getAvatarFromPath = (path: string): string => {
  // Verificar si es una cadena base64 (data:image)
  if (path.startsWith("data:image/")) {
    console.warn(
      "Avatar is stored as base64 data instead of path:",
      path.substring(0, 50) + "..."
    );
    // Retornar el primer avatar como fallback
    return path;
  }

  // Limpiar parámetros de query primero
  const cleanPath = path.split("?")[0];

  // Extract avatar number from path like "/src/assets/images/avatars/avatar_01.png"
  const match = cleanPath.match(/avatar_(\d+)\.png$/);
  if (match) {
    const avatarNumber = parseInt(match[1], 10);
    return getAvatar(avatarNumber);
  }
  // Fallback: return first avatar if path doesn't match expected format
  return avatars[0] || "";
};
