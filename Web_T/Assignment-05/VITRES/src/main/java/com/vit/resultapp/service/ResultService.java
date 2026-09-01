package com.vit.resultapp.service;

import com.vit.resultapp.dto.ResultRequest;
import com.vit.resultapp.dto.SubjectMarkRequest;
import com.vit.resultapp.exception.ResourceNotFoundException;
import com.vit.resultapp.model.SemesterResult;
import com.vit.resultapp.model.Student;
import com.vit.resultapp.model.SubjectMark;
import com.vit.resultapp.repository.SemesterResultRepository;
import com.vit.resultapp.repository.StudentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ResultService {

    private final StudentRepository studentRepository;
    private final SemesterResultRepository semesterResultRepository;

    public ResultService(StudentRepository studentRepository,
                          SemesterResultRepository semesterResultRepository) {
        this.studentRepository = studentRepository;
        this.semesterResultRepository = semesterResultRepository;
    }

    @Transactional
    public SemesterResult generateResult(ResultRequest request) {
        // Find or create the student record
        Student student = studentRepository.findByRegNoIgnoreCase(request.getRegNo())
                .orElseGet(() -> new Student(
                        request.getRegNo(),
                        request.getName(),
                        request.getBranch(),
                        request.getSemester()));

        // Keep student details up to date
        student.setName(request.getName());
        student.setBranch(request.getBranch());
        student.setSemester(request.getSemester());

        SemesterResult semesterResult = new SemesterResult();
        semesterResult.setStudent(student);

        double weightedSum = 0.0;   // sum of (totalMarks * credit) - not used for percentage but kept simple
        double totalPercentageSum = 0.0;
        double gradePointCreditSum = 0.0;
        int totalCredits = 0;

        for (SubjectMarkRequest sr : request.getSubjects()) {
            double total = GradeUtil.weightedTotal(sr.getMseMarks(), sr.getEseMarks());
            String grade = GradeUtil.gradeFor(total);
            int gp = GradeUtil.gradePointFor(grade);

            SubjectMark mark = new SubjectMark();
            mark.setSemesterResult(semesterResult);
            mark.setSubjectCode(sr.getSubjectCode());
            mark.setSubjectName(sr.getSubjectName());
            mark.setCredit(sr.getCredit());
            mark.setMseMarks(sr.getMseMarks());
            mark.setEseMarks(sr.getEseMarks());
            mark.setTotalMarks(total);
            mark.setGrade(grade);
            mark.setGradePoint(gp);

            semesterResult.getSubjectMarks().add(mark);

            totalPercentageSum += total;
            gradePointCreditSum += (gp * sr.getCredit());
            totalCredits += sr.getCredit();
        }

        int subjectCount = request.getSubjects().size();
        double averagePercentage = GradeUtil.round(totalPercentageSum / subjectCount);
        double sgpa = totalCredits == 0 ? 0.0 : GradeUtil.round(gradePointCreditSum / totalCredits);

        semesterResult.setTotalPercentage(averagePercentage);
        semesterResult.setSgpa(sgpa);
        semesterResult.setTotalCredits(totalCredits);
        semesterResult.setOverallGrade(overallGradeFromSgpa(sgpa));

        student.getResults().add(semesterResult);
        studentRepository.save(student);

        return semesterResult;
    }

    private String overallGradeFromSgpa(double sgpa) {
        if (sgpa >= 9.0) return "S";
        if (sgpa >= 8.0) return "A";
        if (sgpa >= 7.0) return "B";
        if (sgpa >= 6.0) return "C";
        if (sgpa >= 5.5) return "D";
        if (sgpa >= 5.0) return "E";
        return "F";
    }

    @Transactional(readOnly = true)
    public List<SemesterResult> getResultsByRegNo(String regNo) {
        List<SemesterResult> results = semesterResultRepository.findByStudent_RegNoIgnoreCaseOrderByCreatedAtDesc(regNo);
        if (results.isEmpty()) {
            throw new ResourceNotFoundException("No results found for registration number: " + regNo);
        }
        return results;
    }

    @Transactional(readOnly = true)
    public List<SemesterResult> getAllResults() {
        return semesterResultRepository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional(readOnly = true)
    public SemesterResult getResultById(Long id) {
        return semesterResultRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Result not found with id: " + id));
    }

    @Transactional
    public void deleteResult(Long id) {
        if (!semesterResultRepository.existsById(id)) {
            throw new ResourceNotFoundException("Result not found with id: " + id);
        }
        semesterResultRepository.deleteById(id);
    }
}
