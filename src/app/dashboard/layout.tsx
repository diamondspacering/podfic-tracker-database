import TopNav from "./top-nav";
import styles from "./dashboard.module.css";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className={styles.header}>
        <TopNav />
      </div>
      <div className={styles.body}>
        <br />
        {children}
      </div>
    </>
  );
}
