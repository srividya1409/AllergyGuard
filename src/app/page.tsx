import { APP_NAME } from "@/lib/constants";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-6 text-center dark:bg-black">
      <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
        {APP_NAME}
      </h1>
      <p className="mt-3 max-w-xs text-base text-zinc-600 dark:text-zinc-400">
        Scan a product, know if it&apos;s safe for you.
      </p>
    </div>
  );
}
