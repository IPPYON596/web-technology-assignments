package com.vit.resultapp.service;

/**
 * Implements the VIT 10-point grading scale.
 *
 * Marks distribution per subject:
 *   MSE (Mid-Semester Exam) -> weighted 30%  (entered out of 50)
 *   ESE (End-Semester Exam) -> weighted 70%  (entered out of 100)
 *
 * Weighted total (out of 100) = (mse / 50 * 30) + (ese / 100 * 70)
 */
public final class GradeUtil {

    private GradeUtil() {
    }

    public static double weightedTotal(double mse, double ese) {
        double mseWeighted = (mse / 50.0) * 30.0;
        double eseWeighted = (ese / 100.0) * 70.0;
        return round(mseWeighted + eseWeighted);
    }

    public static String gradeFor(double total) {
        if (total >= 90) return "S";
        if (total >= 80) return "A";
        if (total >= 70) return "B";
        if (total >= 60) return "C";
        if (total >= 55) return "D";
        if (total >= 50) return "E";
        return "F";
    }

    public static int gradePointFor(String grade) {
        return switch (grade) {
            case "S" -> 10;
            case "A" -> 9;
            case "B" -> 8;
            case "C" -> 7;
            case "D" -> 6;
            case "E" -> 5;
            default -> 0; // F
        };
    }

    public static double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}
