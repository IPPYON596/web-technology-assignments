// ============================================================
// Static source data for the result page.
// In a real app this would come from an API — kept as a plain
// module here so it's easy to see/swap the shape of the data.
// ============================================================

export const studentInfo = {
  name: "Abhijeet Ambat",
  regNo: "12410082",
  branch: "CSE",
  semester: "4th",
};

// Each subject stores raw marks only. Derived values (total, grade)
// are calculated in utils/gradeUtils.js so the data and the
// business logic stay separate.
export const subjects = [
  { id: "WT", name: "Web Technology", mse: 24, ese: 60, mseMax: 30, eseMax: 70 },
  { id: "CN", name: "Computer Networks", mse: 18, ese: 55, mseMax: 30, eseMax: 70 },
  { id: "DAA", name: "Design and Analysis of Algorithm", mse: 27, ese: 65, mseMax: 30, eseMax: 70 },
  { id: "CS", name: "Computer Science", mse: 26, ese: 68, mseMax: 30, eseMax: 70 },
];
