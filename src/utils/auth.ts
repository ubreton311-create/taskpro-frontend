export function getCurrentUser() {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    // Decodificar el payload del JWT
    const payloadBase64 = token.split(".")[1];
    const decodedPayload = JSON.parse(atob(payloadBase64));
    
    // Obtener el nombre a partir del correo (ej. martha@taskpro.com -> Martha)
    let name = "Usuario";
    if (decodedPayload.email) {
      const rawName = decodedPayload.email.split("@")[0];
      name = rawName.charAt(0).toUpperCase() + rawName.slice(1);
    }

    return {
      id: decodedPayload.sub,
      email: decodedPayload.email,
      role: decodedPayload.role as "ADMIN" | "CLIENT" | "PROVIDER",
      name: name,
      initials: name.substring(0, 2).toUpperCase(),
    };
  } catch (error) {
    console.error("Error decodificando el token", error);
    return null;
  }
}