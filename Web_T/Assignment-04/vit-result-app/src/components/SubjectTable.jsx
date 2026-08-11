import React from "react";
import SubjectRow from "./SubjectRow.jsx";
import styles from "./SubjectTable.module.css";

/**
 * Table listing every subject with its MSE, ESE, total, and grade.
 * @param {{ subjects: object[] }} props - subjects already enriched with total & grade
 */
function SubjectTable({ subjects }) {
  return (
    <section className={styles.card} aria-label="Subject-wise marks">
      <h2 className={styles.heading}>Subject-wise Performance</h2>

      {/* Wrapper enables horizontal scroll on small screens instead of squashing columns */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Subject</th>
              <th>MSE (30%)</th>
              <th>ESE (70%)</th>
              <th>Total</th>
              <th>Grade</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((subject) => (
              <SubjectRow key={subject.id} subject={subject} />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default SubjectTable;
