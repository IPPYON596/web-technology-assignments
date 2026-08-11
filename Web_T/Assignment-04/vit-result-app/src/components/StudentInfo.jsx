import React from "react";
import styles from "./StudentInfo.module.css";

/**
 * Card showing the student's identifying details.
 * @param {{ name: string, regNo: string, branch: string, semester: string }} props.student
 */
function StudentInfo({ student }) {
  const { name, regNo, branch, semester } = student;

  // Field list driven by data so adding a new field only means
  // adding an entry here, not restructuring markup.
  const fields = [
    { label: "Name", value: name },
    { label: "Registration No.", value: regNo },
    { label: "Branch", value: branch },
    { label: "Semester", value: semester },
  ];

  return (
    <section className={styles.card} aria-label="Student information">
      {fields.map((field) => (
        <div className={styles.field} key={field.label}>
          <span className={styles.label}>{field.label}</span>
          <span className={styles.value}>{field.value}</span>
        </div>
      ))}
    </section>
  );
}

export default StudentInfo;
