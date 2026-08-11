// ============================================================
// Pure helper functions for turning raw marks into the derived
// values the UI needs: totals, letter grades, and aggregate stats.
// Keeping these pure (no side effects) makes them easy to test.
// ============================================================

/**
 * Convert a numeric total (out of 100) into a letter grade.
 * 90+ = A, 80-89 = B, 70-79 = C, 60-69 = D, below 60 = F
 */
export function getGrade(total) {
  if (total >= 90) return "A";
  if (total >= 80) return "B";
  if (total >= 70) return "C";
  if (total >= 60) return "D";
  return "F";
}

/**
 * Enrich a raw subject record with its computed total and grade.
 */
export function withComputedResult(subject) {
  const total = subject.mse + subject.ese;
  return {
    ...subject,
    total,
    grade: getGrade(total),
  };
}

/**
 * Map every subject to its computed version.
 */
export function computeAllResults(subjects) {
  return subjects.map(withComputedResult);
}

/**
 * Derive the top-level summary shown in the stat cards:
 * overall percentage, total marks obtained, and an overall grade
 * (based on the average total across all subjects).
 */
export function getOverallSummary(computedSubjects) {
  const subjectCount = computedSubjects.length;
  const maxMarksPerSubject = 100; // 30 (MSE) + 70 (ESE)
  const totalMaxMarks = subjectCount * maxMarksPerSubject;

  const totalObtained = computedSubjects.reduce((sum, s) => sum + s.total, 0);
  const percentage = (totalObtained / totalMaxMarks) * 100;
  const averageTotal = totalObtained / subjectCount;

  return {
    totalObtained,
    totalMaxMarks,
    percentage: Number(percentage.toFixed(2)),
    overallGrade: getGrade(averageTotal),
  };
}

/**
 * Derive summary stats (highest, lowest, average) for the
 * optional SummaryCard component.
 */
export function getMarksStats(computedSubjects) {
  const totals = computedSubjects.map((s) => s.total);
  const highest = computedSubjects.reduce((a, b) => (b.total > a.total ? b : a));
  const lowest = computedSubjects.reduce((a, b) => (b.total < a.total ? b : a));
  const average = totals.reduce((sum, t) => sum + t, 0) / totals.length;

  return {
    highest,
    lowest,
    average: Number(average.toFixed(2)),
  };
}
