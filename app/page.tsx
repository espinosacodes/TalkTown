import { auth0 } from "@/lib/auth0";
import { HomeContent } from "@/components/game/HomeContent";

export default async function Home() {
  const session = await auth0.getSession();

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h1 className="text-2xl font-bold text-amber-100">Language Quest</h1>
        <p className="text-amber-200">AI-Powered Language Learning RPG</p>
        <div className="flex gap-4 mt-4">
          <a
            href="/auth/login?screen_hint=signup"
            className="px-6 py-2 bg-amber-600 text-white rounded hover:bg-amber-500 transition"
          >
            Sign Up
          </a>
          <a
            href="/auth/login"
            className="px-6 py-2 bg-amber-800 text-white rounded hover:bg-amber-700 transition"
          >
            Log In
          </a>
        </div>
      </div>
    );
  }

  return <HomeContent userId={session.user.sub} />;
}
