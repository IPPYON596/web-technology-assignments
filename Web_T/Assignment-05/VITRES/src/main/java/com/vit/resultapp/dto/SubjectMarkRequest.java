package com.vit.resultapp.dto;

import jakarta.validation.constraints.*;

public class SubjectMarkRequest {

    @NotBlank(message = "Subject code is required")
    private String subjectCode;

    @NotBlank(message = "Subject name is required")
    private String subjectName;

    @NotNull(message = "Credit is required")
    @Min(value = 1, message = "Credit must be at least 1")
    @Max(value = 6, message = "Credit cannot exceed 6")
    private Integer credit;

    @NotNull(message = "MSE marks are required")
    @DecimalMin(value = "0.0", message = "MSE marks cannot be negative")
    @DecimalMax(value = "50.0", message = "MSE marks cannot exceed 50")
    private Double mseMarks;

    @NotNull(message = "ESE marks are required")
    @DecimalMin(value = "0.0", message = "ESE marks cannot be negative")
    @DecimalMax(value = "100.0", message = "ESE marks cannot exceed 100")
    private Double eseMarks;

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
}
