'use client';
import React from 'react';
import { FaSpinner } from 'react-icons/fa';
import styles from './loader.module.css';

const Loader: React.FC = () => {
  return (
    <div className={styles.loaderContainer}>
      <FaSpinner className={styles.spinner} />
    </div>
  );
};

export default Loader;
