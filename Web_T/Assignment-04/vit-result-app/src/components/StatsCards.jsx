import React from "react";
import styles from "./StatsCards.module.css";

/**
 * Row of three headline stats: overall %, total marks, overall grade.
 * @param {{ percentage: number, totalObtained: number, totalMaxMarks: number, overallGrade: string }} props
 */
function StatsCards({ percentage, totalObtained, totalMaxMarks, overallGrade }) {
  const stats = [
    {
      label: "Overall Percentage",
      value: `${percentage}%`,
    },
    {
      label: "Total Marks Obtained",
      value: `${totalObtained} / ${totalMaxMarks}`,
    },
    {
      label: "Overall Grade",
      value: overallGrade,
      isGrade: true,
    },
  ];

  return (
    <section className={styles.row} aria-label="Result summary statistics">
      {stats.map((stat) => (
        <div className={styles.card} key={stat.label}>
          <span className={styles.label}>{stat.label}</span>
          <span className={stat.isGrade ? `${styles.value} ${styles.gradeValue}` : styles.value}>
            {stat.value}
          </span>
        </div>
      ))}
    </section>
  );
}

export default StatsCards;
