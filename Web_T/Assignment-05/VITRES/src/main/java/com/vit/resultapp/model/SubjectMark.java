package com.vit.resultapp.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "subject_marks")
public class SubjectMark {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "semester_result_id", nullable = false)
    @JsonIgnore
    private SemesterResult semesterResult;

    @Column(name = "subject_code", length = 20)
    private String subjectCode;

    @Column(name = "subject_name", length = 100)
    private String subjectName;

    @Column(name = "credit")
    private Integer credit;

    // Out of 50
    @Column(name = "mse_marks")
    private Double mseMarks;

    // Out of 100
    @Column(name = "ese_marks")
    private Double eseMarks;

    // Weighted total out of 100 => (mse/50 * 30) + (ese/100 * 70)
    @Column(name = "total_marks")
    private Double totalMarks;

    @Column(name = "grade", length = 5)
    private String grade;

    @Column(name = "grade_point")
    private Integer gradePoint;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public SemesterResult getSemesterResult() {
        return semesterResult;
    }

    public void setSemesterResult(SemesterResult semesterResult) {
        this.semesterResult = semesterResult;
    }

    public String getSubjectCode() {
        return subjectCode;
    }

    public void setSubjectCode(String subjectCode) {
        this.subjectCode = subjectCode;
    }

    public String getSubjectName() {
        return subjectName;
    }

    public void setSubjectName(String subjectName) {
        this.subjectName = subjectName;
    }

    public Integer getCredit() {
        return credit;
    }

    public void setCredit(Integer credit) {
        this.credit = credit;
    }

    public Double getMseMarks() {
        return mseMarks;
    }

    public void setMseMarks(Double mseMarks) {
        this.mseMarks = mseMarks;
    }

    public Double getEseMarks() {
        return eseMarks;
    }

    public void setEseMarks(Double eseMarks) {
        this.eseMarks = eseMarks;
    }

    public Double getTotalMarks() {
        return totalMarks;
    }

    public void setTotalMarks(Double totalMarks) {
        this.totalMarks = totalMarks;
    }

    public String getGrade() {
        return grade;
    }

    public void setGrade(String grade) {
        this.grade = grade;
    }

    public Integer getGradePoint() {
        return gradePoint;
    }

    public void setGradePoint(Integer gradePoint) {
        this.gradePoint = gradePoint;
    }
}
