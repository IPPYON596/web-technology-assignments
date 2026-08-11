import React, { useState, useEffect, useMemo } from "react";
import Header from "./components/Header.jsx";
import StudentInfo from "./components/StudentInfo.jsx";
import StatsCards from "./components/StatsCards.jsx";
import SubjectTable from "./components/SubjectTable.jsx";
import SummaryCard from "./components/SummaryCard.jsx";
import { studentInfo, subjects as rawSubjects } from "./data/resultData.js";
import { computeAllResults, getOverallSummary, getMarksStats } from "./utils/gradeUtils.js";
import styles from "./App.module.css";

/**
 * Root component. Holds the subjects in state (so the app could
 * later fetch this from an API and re-render) and derives every
 * other value the child components need with useMemo, so the
 * fairly cheap grade math only re-runs when the subjects change.
 */
function App() {
  const [subjects, setSubjects] = useState(rawSubjects);
  const [isLoading, setIsLoading] = useState(true);

  // Simulates an initial data load (e.g. fetching from an API).
  // Here it just marks loading as done after mount, but the shape
  // mirrors what a real fetch-on-mount effect would look like.
  useEffect(() => {
    setSubjects(rawSubjects);
    setIsLoading(false);
  }, []);

  // Recompute derived data only when the raw subject list changes
  const computedSubjects = useMemo(() => computeAllResults(subjects), [subjects]);
  const overallSummary = useMemo(() => getOverallSummary(computedSubjects), [computedSubjects]);
  const marksStats = useMemo(() => getMarksStats(computedSubjects), [computedSubjects]);

  if (isLoading) {
    return <div className={styles.loading}>Loading result…</div>;
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <Header />

        <StudentInfo student={studentInfo} />

        <StatsCards
          percentage={overallSummary.percentage}
          totalObtained={overallSummary.totalObtained}
          totalMaxMarks={overallSummary.totalMaxMarks}
          overallGrade={overallSummary.overallGrade}
        />

        <SubjectTable subjects={computedSubjects} />

        <SummaryCard
          highest={marksStats.highest}
          lowest={marksStats.lowest}
          average={marksStats.average}
        />
      </div>
    </div>
  );
}

export default App;
