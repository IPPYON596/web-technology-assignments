# VIT Semester Result Portal

A responsive web app for preparing a single semester result for VIT students,
covering four subjects. Each subject's total is weighted as **MSE 30% + ESE
70%**, graded on VIT's 10-point scale (S/A/B/C/D/E/F), and combined into a
credit-weighted **SGPA**.

Stack: **Spring Boot 3 (Java 17) + MySQL** on the backend, plain **HTML/CSS/JavaScript**
(no build step) on the frontend, served directly from Spring Boot's static
resources.

## How marks are calculated

For each subject:

```
weighted total (out of 100) = (MSE / 50 * 30) + (ESE / 100 * 70)
```

- MSE is entered out of **50**
- ESE is entered out of **100**

Grade bands (weighted total → grade → grade point):

| Total      | Grade | Points |
|------------|:-----:|:------:|
| 90 - 100   | S     | 10     |
| 80 - 89    | A     | 9      |
| 70 - 79    | B     | 8      |
| 60 - 69    | C     | 7      |
| 55 - 59    | D     | 6      |
| 50 - 54    | E     | 5      |
| below 50   | F     | 0      |

**SGPA** = Σ(credit × grade point) / Σ(credit) across the four subjects.

## Project structure

```
vit-result-app/
├── pom.xml
├── database.sql                          # optional manual schema
├── src/main/java/com/vit/resultapp/
│   ├── ResultAppApplication.java         # Spring Boot entry point
│   ├── model/                            # Student, SemesterResult, SubjectMark (JPA entities)
│   ├── repository/                       # Spring Data JPA repositories
│   ├── service/                          # ResultService (business logic), GradeUtil (grading rules)
│   ├── controller/                       # ResultController (REST API)
│   ├── dto/                              # Request payloads with validation
│   └── exception/                        # Global error handling
└── src/main/resources/
    ├── application.properties            # MySQL connection settings
    └── static/                           # frontend
        ├── index.html
        ├── css/style.css
        └── js/script.js
```

## Setup

### 1. Prerequisites
- JDK 17+
- Maven 3.9+
- MySQL 8+ running locally

### 2. Configure the database

Either let Hibernate create the schema automatically (default), or run the
provided script first:

```bash
mysql -u root -p < database.sql
```

Update credentials in `src/main/resources/application.properties` if your
MySQL username/password aren't `root` / `root`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/vit_result_db?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=root
```

### 3. Run the app

```bash
mvn spring-boot:run
```

Then open **http://localhost:8080** — the frontend is served directly by
Spring Boot, so there's nothing separate to start.

## REST API

| Method | Endpoint                     | Description                                   |
|--------|-------------------------------|------------------------------------------------|
| POST   | `/api/results`                 | Generate & save a result (body below)          |
| GET    | `/api/results`                 | List every result on file, newest first        |
| GET    | `/api/results/{id}`            | Fetch one result by its id                     |
| GET    | `/api/results/student/{regNo}` | All results for a given registration number    |
| DELETE | `/api/results/{id}`            | Delete a result record                         |

Sample `POST /api/results` request body:

```json
{
  "regNo": "21BCE1234",
  "name": "Ananya Rao",
  "branch": "Computer Science",
  "semester": "Semester 3",
  "subjects": [
    { "subjectCode": "CSE2001", "subjectName": "Data Structures",      "credit": 4, "mseMarks": 42, "eseMarks": 78 },
    { "subjectCode": "CSE2002", "subjectName": "Database Systems",     "credit": 4, "mseMarks": 38, "eseMarks": 70 },
    { "subjectCode": "MAT2001", "subjectName": "Discrete Mathematics", "credit": 3, "mseMarks": 45, "eseMarks": 82 },
    { "subjectCode": "HUM1001", "subjectName": "Professional Ethics",  "credit": 3, "mseMarks": 40, "eseMarks": 75 }
  ]
}
```

## Frontend features

- **Generate result** — a registration-slip style form for student details
  and exactly four subjects (MSE/50, ESE/100, credit), producing a printed
  mark-sheet-style grade card with per-subject grades, average percentage,
  overall grade, and SGPA.
- **Look up a result** — search by registration number to revisit any
  student's saved results.
- **All records** — a sortable table of every result generated, with the
  option to view or delete each one.
- Fully responsive: the two-column layout collapses to a single column and
  the subject table becomes a stacked, labeled form on narrow (mobile)
  screens.
