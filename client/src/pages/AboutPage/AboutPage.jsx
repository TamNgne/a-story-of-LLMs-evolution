// /client/src/pages/AboutPage/AboutPage.jsx
import React from 'react';
import styles from './AboutPage.module.css';

const TEAM = [
  { id: 't1', name: 'Nguyễn Thị Thanh Tâm', role: 'Data Engineer' },
  { id: 't2', name: 'Nguyễn Xuân Trâm Anh', role: 'Data Engineer' },
  { id: 't3', name: 'Cao Bảo Khương', role: 'Front-end Dev' },
  { id: 't4', name: 'Võ Nguyễn Thanh Thảo', role: 'Back-end Dev' },
];

const AboutPage = () => {
  return (
    <div className={styles.aboutContainer}>
      <h2 className={styles.title}>Our Team</h2>
      <div className={styles.teamGrid}>
        {TEAM.map((member) => (
          <div key={member.id} className={styles.card}>
            <div className={styles.avatar}>
              {/* Placeholder for avatar image; replace with <img src="/path/to/avatar.jpg" alt={member.name} /> */}
            </div>
            <div className={styles.name}>{member.name}</div>
            <div className={styles.role}>{member.role}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AboutPage;


