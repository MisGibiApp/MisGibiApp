import { useEffect } from "react";
import { Redirect } from "expo-router";

export default function RootRedirect() {
  return <Redirect href="/auth/Welcome" />;
}
