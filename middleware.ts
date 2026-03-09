export { auth as middleware } from "@/auth"

export const config = { 
  matcher: [
    "/trips",
    "/reservations",
    "/properties",
    "/favorites"
  ]
};
