// /client/src/pages/PlaygroundPage/PlaygroundPage.jsx
import React from 'react';
import TaskSpecializationChart from '../../components/TaskSpecializationChart/TaskSpecializationChart';
import BenchmarkDashboard from '../../components/BenchmarkDashboard/BenchmarkDashboard';
import styles from './PlaygroundPage.module.css';

const PlaygroundPage = () => {
  return (
    <div className={styles.container}>
      <TaskSpecializationChart />
      <BenchmarkDashboard />
    </div>
  );
};

export default PlaygroundPage;
