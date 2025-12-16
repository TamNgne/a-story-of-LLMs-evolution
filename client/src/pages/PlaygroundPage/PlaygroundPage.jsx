// /client/src/pages/PlaygroundPage/PlaygroundPage.jsx
import React from 'react';
import TaskSpecializationChart from '../../components/TaskSpecializationChart/TaskSpecializationChart';
import BenchmarkDashboard from '../../components/BenchmarkDashboard/BenchmarkDashboard';
import ComparisonChart from '../../components/ComparisonChart/ComparisonChart';
import styles from './PlaygroundPage.module.css';

const PlaygroundPage = () => {
  return (
    <div className={styles.container}>
      <ComparisonChart />
      <TaskSpecializationChart />
      <BenchmarkDashboard />
    </div>
  );
};

export default PlaygroundPage;
