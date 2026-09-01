package com.vit.resultapp.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "students")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Registration number is required")
    @Column(name = "reg_no", unique = true, nullable = false, length = 20)
    private String regNo;

    @NotBlank(message = "Student name is required")
    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 100)
    private String branch;

    @Column(length = 20)
    private String semester;

    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<SemesterResult> results = new ArrayList<>();

    public Student() {
    }

    public Student(String regNo, String name, String branch, String semester) {
        this.regNo = regNo;
        this.name = name;
        this.branch = branch;
        this.semester = semester;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

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

    public List<SemesterResult> getResults() {
        return results;
    }

    public void setResults(List<SemesterResult> results) {
        this.results = results;
    }
}
