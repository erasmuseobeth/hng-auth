import Link from "next/link";
import styles from "./page.module.css"

export default function Home() {
  return (
    <>
    <div>
      <div className={styles.center}>hng-auth-user endpoints home</div>
      <Link className={styles.link} href="/auth/register">/auth/register</Link>
      <Link className={styles.link} href="/auth/login">/auth/login</Link>
      <Link className={styles.link} href="/api/users/id">/auth/register</Link>
      <Link className={styles.link} href="/api/organisations">/auth/register</Link>
      <Link className={styles.link} href="/api/organisations/orgid/users">/auth/register</Link>
    </div>
    </>
  );
}
