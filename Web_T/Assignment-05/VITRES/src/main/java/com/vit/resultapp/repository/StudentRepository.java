package com.vit.resultapp.repository;

import com.vit.resultapp.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByRegNoIgnoreCase(String regNo);
    boolean existsByRegNoIgnoreCase(String regNo);
}
