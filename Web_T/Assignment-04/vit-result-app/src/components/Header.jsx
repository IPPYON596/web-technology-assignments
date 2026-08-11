import React from "react";
import styles from "./Header.module.css";

/**
 * Top banner for the page — institute badge + page title.
 * Purely presentational, takes no props.
 */
function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.badge}>VIT</div>
      <div className={styles.titleBlock}>
        <h1 className={styles.title}>VIT Semester Result</h1>
        <p className={styles.subtitle}>Vishwakarma Institute of Technology — Academic Results Portal</p>
      </div>
    </header>
  );
}

export default Header;
