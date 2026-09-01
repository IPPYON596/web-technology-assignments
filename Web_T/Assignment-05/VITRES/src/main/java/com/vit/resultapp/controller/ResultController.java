package com.vit.resultapp.controller;

import com.vit.resultapp.dto.ResultRequest;
import com.vit.resultapp.model.SemesterResult;
import com.vit.resultapp.service.ResultService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/results")
@CrossOrigin(origins = "*")
public class ResultController {

    private final ResultService resultService;

    public ResultController(ResultService resultService) {
        this.resultService = resultService;
    }

    // Generate and save a new semester result
    @PostMapping
    public ResponseEntity<SemesterResult> generateResult(@Valid @RequestBody ResultRequest request) {
        SemesterResult result = resultService.generateResult(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }

    // Get all results generated for a given registration number
    @GetMapping("/student/{regNo}")
    public ResponseEntity<List<SemesterResult>> getByRegNo(@PathVariable String regNo) {
        return ResponseEntity.ok(resultService.getResultsByRegNo(regNo));
    }

    // Get a single result by its id
    @GetMapping("/{id}")
    public ResponseEntity<SemesterResult> getById(@PathVariable Long id) {
        return ResponseEntity.ok(resultService.getResultById(id));
    }

    // Admin / listing view - all results across all students
    @GetMapping
    public ResponseEntity<List<SemesterResult>> getAll() {
        return ResponseEntity.ok(resultService.getAllResults());
    }

    // Delete a result record
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        resultService.deleteResult(id);
        return ResponseEntity.noContent().build();
    }
}
