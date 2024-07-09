import Link from "next/link";

export default function Home() {
  return (
    <>
    <div>
      <div>hng-auth-user endpoints home</div>
      <Link href="/auth/register">/auth/register</Link>
      <Link href="/auth/login">/auth/login</Link>
      <Link href="/api/users/id">/auth/register</Link>
      <Link href="/api/organisations">/auth/register</Link>
      <Link href="/api/organisations/orgid/users">/auth/register</Link>
    </div>
    </>
  );
}
