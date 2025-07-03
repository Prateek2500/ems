import express from 'express'
import con from "../utils/db.js";
import jwt from "jsonwebtoken";
import bcrypt from 'bcrypt'

const router = express.Router()

// Employee Login
router.post("/employee_login", (req, res) => {
    const sql = "SELECT * FROM employee WHERE email = ?";
    con.query(sql, [req.body.email], (err, result) => {
        if (err) return res.json({ loginStatus: false, Error: "Query error" });
        if (result.length > 0) {
            bcrypt.compare(req.body.password, result[0].password, (err, response) => {
                if (err) return res.json({ loginStatus: false, Error: "Wrong Password" });
                if(response) {
                    const token = jwt.sign(
                        { 
                            role: "employee", 
                            email: result[0].email, 
                            id: result[0].id,
                            name: result[0].name 
                        },
                        "jwt_secret_key",
                        { expiresIn: "1d" }
                    );
                    res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'None' }); // optional for security

return res.json({ 
  loginStatus: true, 
  token, // ✅ include the token in JSON response
  id: result[0].id,
  name: result[0].name
});

                } else {
                    return res.json({ loginStatus: false, Error: "Wrong Password" });
                }
            });
        } else {
            return res.json({ loginStatus: false, Error: "Wrong email or password" });
        }
    });
});

// Get Employee by ID
router.get('/:id', (req, res) => {
    const id = req.params.id;
    const sql = `
        SELECT e.*, d.name AS dept_name 
        FROM employee e 
        LEFT JOIN dept d ON e.dept_id = d.id 
        WHERE e.id = ?
    `;
    con.query(sql, [id], (err, result) => {
        if(err) return res.json({ Status: false, Error: "Query error" });
        if(result.length > 0) {
            return res.json({ 
                Status: true, 
                Result: {
                    ...result[0],
                    dept_id: result[0].dept_id?.toString()  // Ensure string type for consistency
                }
            });
        } else {
            return res.json({ Status: false, Error: "Employee not found" });
        }
    });
});

// Add Employee
router.post("/add_employee", (req, res) => {
    bcrypt.hash(req.body.password, 10, (err, hash) => {
        if (err) return res.json({ Status: false, Error: "Password hashing error" });

        const sql = `
            INSERT INTO employee (
                name, email, password, salary, address, dept_id, image, age, 
                gender, account_no, bank_name, branch, university, degree, 
                edu_branch, gradepoint, yop, father_name, mother_name, 
                emergency_contact,alternate_contact,aadhar_number, pan_number
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?, ?, ?, ?, ?, ?)
        `;
        const values = [
            req.body.name,
            req.body.email,
            hash,
            req.body.salary,
            req.body.address,
            req.body.dept_id,
            req.body.image || "",
            req.body.age,
            req.body.gender,
            req.body.account_no,
            req.body.bank_name,
            req.body.branch,
            req.body.university,
            req.body.degree,
            req.body.edu_branch,
            req.body.gradepoint,
            req.body.yop,
            req.body.father_name,
            req.body.mother_name,
            req.body.emergency_contact,
            req.body.alternate_contact,
            req.body.aadhar_number,
            req.body.pan_number
        ];

        con.query(sql, values, (err, result) => {
            if (err) return res.json({ Status: false, Error: err.message });
            return res.json({ Status: true, Result: result });
        });
    });
});



// --------------------------
// Attendance Routes
// --------------------------

// Mark Attendance (Present/Absent)
router.post('/attendance', (req, res) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ Status: false, Error: "Not authenticated" });

    jwt.verify(token, "jwt_secret_key", (err, decoded) => {
        if (err) return res.status(403).json({ Status: false, Error: "Invalid token" });

        const status = req.body.status?.toLowerCase();
        if (!['present', 'absent'].includes(status)) {
            return res.status(400).json({ 
                Status: false, 
                Error: "Invalid status. Use 'present' or 'absent'" 
            });
        }

        // Set MySQL session timezone to IST (+05:30)
        con.query("SET time_zone = '+05:30';", (timezoneErr) => {
            if (timezoneErr) {
                return res.status(500).json({ 
                    Status: false, 
                    Error: "Failed to set timezone",
                    Details: timezoneErr.message 
                });
            }

            // Use IST dates in the query (CURDATE() now returns IST date)
            const sql = `
                INSERT INTO attendance 
                    (employee_id, attendance_date, attendance_time, status)
                VALUES 
                    (?, CURDATE(), CURTIME(), ?)
                ON DUPLICATE KEY UPDATE 
                    status = ?,
                    attendance_time = CURTIME()`;

            con.query(sql, [decoded.id, status, status], (err, result) => {
                if (err) return res.status(500).json({ 
                    Status: false, 
                    Error: "Database operation failed",
                    Details: err.message 
                });

                // Get today's date in IST for the response
                const todayIST = new Date()
                    .toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

                return res.json({ 
                    Status: true, 
                    Message: "Attendance recorded",
                    Record: {
                        employee_id: decoded.id,
                        date: todayIST, // e.g., "2025-06-18" (IST)
                        status: status
                    }
                });
            });
        });
    });
});



// Get Attendance History (last 30 days)
router.get('/attendance/history', (req, res) => {
    // Set MySQL session timezone to IST
    con.query("SET time_zone = '+05:30';", (timezoneErr) => {
        if (timezoneErr) {
            return res.status(500).json({ 
                Status: false, 
                Error: "Failed to set timezone",
                Details: timezoneErr.message 
            });
        }

        const token = req.cookies.token;
        if (!token) return res.status(401).json({ Status: false, Error: "Not authenticated" });

        jwt.verify(token, "jwt_secret_key", (err, decoded) => {
            if (err) return res.status(403).json({ Status: false, Error: "Invalid token" });

            const sql = `
                SELECT attendance_date, attendance_time, status 
                FROM attendance 
                WHERE employee_id = ?
                ORDER BY attendance_date DESC
                LIMIT 30`;

            con.query(sql, [decoded.id], (err, result) => {
                if (err) return res.status(500).json({ 
                    Status: false, 
                    Error: "Failed to fetch records",
                    Details: err.message
                });

                // Convert attendance_date to IST string for each record
                return res.json({ 
                    Status: true, 
                    Result: result.map(record => ({
                        date: new Date(record.attendance_date)
                            .toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }),
                        status: record.status.charAt(0).toUpperCase() + record.status.slice(1)
                    }))
                });
            });
        });
    });
});

// Reset ONLY today's attendance
router.delete('/attendance/reset', (req, res) => {
    // Set MySQL session timezone to IST
    con.query("SET time_zone = '+05:30';", (timezoneErr) => {
        if (timezoneErr) {
            return res.status(500).json({ 
                Status: false, 
                Error: "Failed to set timezone",
                Details: timezoneErr.message 
            });
        }

        const token = req.cookies.token;
        if (!token) return res.status(401).json({ Status: false, Error: "Not authenticated" });

        jwt.verify(token, "jwt_secret_key", (err, decoded) => {
            if (err) return res.status(403).json({ Status: false, Error: "Invalid token" });

            const sql = `
                DELETE FROM attendance 
                WHERE employee_id = ? AND attendance_date = CURDATE()`;

            con.query(sql, [decoded.id], (err, result) => {
                if (err) return res.status(500).json({ 
                    Status: false, 
                    Error: "Database error", 
                    Details: err.message 
                });

                return res.json({ Status: true, Message: "Today's attendance has been reset" });
            });
        });
    });
});

router.post('/apply_leave', (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ Status: false, Error: "Not authenticated" });

  jwt.verify(token, "jwt_secret_key", (err, decoded) => {
    if (err) return res.status(403).json({ Status: false, Error: "Invalid token" });

    const employee_id = decoded.id; // Correctly get employee id
    const { start_date, end_date, leave_type, purpose } = req.body;
    const sql = `
      INSERT INTO leaves (employee_id, start_date, end_date, leave_type, purpose, status)
      VALUES (?, ?, ?, ?, ?, 'pending')
    `;
    con.query(sql, [employee_id, start_date, end_date, leave_type, purpose], (err, result) => {
      if (err) return res.json({ Status: false, Error: err.message });
      return res.json({ Status: true, Result: result });
    });
  });
});

router.get('/leave/history', (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ Status: false, Error: "Not authenticated" });

  jwt.verify(token, "jwt_secret_key", (err, decoded) => {
    if (err) return res.status(403).json({ Status: false, Error: "Invalid token" });

    const sql = `
      SELECT leave_id, leave_type, start_date, end_date, purpose, status
      FROM leaves
      WHERE employee_id = ?
      ORDER BY start_date DESC
    `;
    
    con.query(sql, [decoded.id], (err, result) => {
      if (err) {
        return res.status(500).json({ 
          Status: false, 
          Error: "Database error", 
          Details: err.message 
        });
      }

      return res.json({
        Status: true,
        Result: result
      });
    });
  });
});


// Logout
router.get('/logout', (req, res) => {
    res.clearCookie('token');
    return res.json({ Status: true });
});

export {router as EmployeeRouter};
