// /client/src/pages/HomePage/HomePage.jsx
import React from 'react';
import VisualizationChart from '../../components/VisualizationChart/VisualizationChart';
import styles from './HomePage.module.css';

const HomePage = () => {
  return (
    <div className={styles.homeContainer}>
      <h1 className={styles.mainTitle}>A Story of Large Language Models Evolution</h1>
      <VisualizationChart />
    </div>
  );
};

export default HomePage;

