import React from "react";
import styles from "./SummaryCard.module.css";

/**
 * Optional card summarizing the highest, lowest, and average
 * subject totals for a quick at-a-glance read.
 * @param {{ highest: object, lowest: object, average: number }} props
 */
function SummaryCard({ highest, lowest, average }) {
  const rows = [
    { label: "Highest Score", subject: highest.name, value: `${highest.total} / 100` },
    { label: "Lowest Score", subject: lowest.name, value: `${lowest.total} / 100` },
    { label: "Average Score", subject: "All subjects", value: `${average} / 100` },
  ];

  return (
    <section className={styles.card} aria-label="Performance summary">
      <h2 className={styles.heading}>Performance Summary</h2>
      <div className={styles.list}>
        {rows.map((row) => (
          <div className={styles.item} key={row.label}>
            <div>
              <p className={styles.itemLabel}>{row.label}</p>
              <p className={styles.itemSubject}>{row.subject}</p>
            </div>
            <span className={styles.itemValue}>{row.value}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default SummaryCard;
