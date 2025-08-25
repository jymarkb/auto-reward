
import { loginAndAuthorize } from "./actions/Test";
import FormUI from "./FormUI";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <form action={loginAndAuthorize}>
        <FormUI />
      </form>
    </main>
  );
}
