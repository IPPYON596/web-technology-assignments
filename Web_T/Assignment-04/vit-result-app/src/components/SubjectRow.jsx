import React from "react";
import styles from "./SubjectTable.module.css";

/**
 * One table row for a single subject's marks.
 * Kept as its own component (rather than inlined in SubjectTable)
 * so each row can be tested/styled independently and the list
 * render stays easy to read.
 * @param {{ subject: object }} props - a subject already enriched with total & grade
 */
function SubjectRow({ subject }) {
  const { name, mse, mseMax, ese, eseMax, total, grade } = subject;

  // Map each grade letter to a CSS module class for color-coding
  const gradeClassMap = {
    A: styles.gradeA,
    B: styles.gradeB,
    C: styles.gradeC,
    D: styles.gradeD,
    F: styles.gradeF,
  };

  return (
    <tr className={styles.row}>
      <td className={styles.subjectCell}>{name}</td>
      <td>{mse} / {mseMax}</td>
      <td>{ese} / {eseMax}</td>
      <td className={styles.totalCell}>{total} / 100</td>
      <td>
        <span className={`${styles.gradePill} ${gradeClassMap[grade]}`}>{grade}</span>
      </td>
    </tr>
  );
}

export default SubjectRow;
