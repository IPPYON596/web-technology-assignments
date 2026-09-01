package com.vit.resultapp.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import java.util.List;

public class ResultRequest {

    @NotBlank(message = "Registration number is required")
    private String regNo;

    @NotBlank(message = "Student name is required")
    private String name;

    private String branch;

    private String semester;

    @NotEmpty(message = "At least one subject is required")
    @Size(min = 4, max = 4, message = "Exactly 4 subjects are required for this result")
    @Valid
    private List<SubjectMarkRequest> subjects;

    public String getRegNo() {
        return regNo;
    }

    public void setRegNo(String regNo) {
        this.regNo = regNo;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getBranch() {
        return branch;
    }

    public void setBranch(String branch) {
        this.branch = branch;
    }

    public String getSemester() {
        return semester;
    }

    public void setSemester(String semester) {
        this.semester = semester;
    }

    public List<SubjectMarkRequest> getSubjects() {
        return subjects;
    }

    public void setSubjects(List<SubjectMarkRequest> subjects) {
        this.subjects = subjects;
    }
}
