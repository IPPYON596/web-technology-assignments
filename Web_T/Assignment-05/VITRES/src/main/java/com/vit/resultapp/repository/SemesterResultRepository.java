package com.vit.resultapp.repository;

import com.vit.resultapp.model.SemesterResult;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SemesterResultRepository extends JpaRepository<SemesterResult, Long> {
    List<SemesterResult> findByStudent_RegNoIgnoreCaseOrderByCreatedAtDesc(String regNo);
    List<SemesterResult> findAllByOrderByCreatedAtDesc();
}
