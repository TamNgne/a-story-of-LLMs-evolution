// /client/src/components/Header/Header.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Header.module.css';

const Header = () => {
  return (
    <header className={styles.header}>
      <Link to="/" className={styles.logo}>
        <span className={styles.logoMain}>llm-evo</span>
        <span className={styles.logoDotCom}>.com</span>
      </Link>
      <nav className={styles.navLinks}>
        <Link to="/playground" className={styles.navLink}>
          Playground
        </Link>
        <Link to="/news" className={styles.navLink}>
          News
        </Link>
        <Link to="/about" className={styles.navLink}>
          About us
        </Link>
      </nav>
    </header>
  );
};

export default Header;

