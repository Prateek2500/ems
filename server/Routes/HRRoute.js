import express from 'express';
import pool from '../utils/db.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const router = express.Router();

/**
 * ============================
 * HR LOGIN (from employee table)
 * ============================
 */
router.post('/HR_login', async (req, res) => {
  const sql = `
    SELECT e.id AS employee_id, e.name AS employee_name, e.email, e.password, e.salary,
           e.address, e.image, e.dept_id, e.designation, e.experience, e.degree, e.edu_branch,
           e.gradepoint, e.alternate_contact, e.age, e.gender, e.account_no, e.bank_name,
           e.branch, e.university, e.yop, e.father_name, e.mother_name, e.emergency_contact,
           e.aadhar_number, e.pan_number, e.dob, d.id AS dept_id, d.name AS dept_name
    FROM employee e
    INNER JOIN dept d ON e.dept_id = d.id
    WHERE e.email = ? AND d.name = 'HR'
  `;
  try {
    const [rows] = await pool.query(sql, [req.body.email]);

    if (rows.length === 0) {
      return res.json({ loginStatus: false, Error: 'Not an HR or invalid email' });
    }

    const passwordMatch = await bcrypt.compare(req.body.password, rows[0].password);
    if (!passwordMatch) {
      return res.json({ loginStatus: false, Error: 'Wrong password' });
    }

    const token = jwt.sign(
      {
        role: 'HR',
        id: rows[0].employee_id,
        email: rows[0].email,
        name: rows[0].employee_name
      },
      'jwt_secret_key',
      { expiresIn: '1d' }
    );

    res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
    return res.json({
      loginStatus: true,
      id: rows[0].employee_id,
      name: rows[0].employee_name
    });
  } catch (err) {
    console.error('❌ SQL error:', err);
    return res.json({ loginStatus: false, Error: 'Query error' });
  }
});

/**
 * ============================
 * GET HR DETAIL by ID
 * ============================
 */
router.get('/detail/:id', async (req, res) => {
  const sql = `
    SELECT e.*, d.name AS dept_name
    FROM employee e
    LEFT JOIN dept d ON e.dept_id = d.id
    WHERE e.id = ? AND e.designation = 'HR'
  `;
  try {
    const [rows] = await pool.query(sql, [req.params.id]);

    if (rows.length > 0) {
      return res.json({
        Status: true,
        Result: {
          ...rows[0],
          dept_id: rows[0].dept_id?.toString()
        }
      });
    } else {
      return res.json({ Status: false, Error: 'HR not found' });
    }
  } catch (err) {
    console.error('❌ SQL error:', err);
    return res.json({ Status: false, Error: 'Query error' });
  }
});

/**
 * ============================
 * GET HR ATTENDANCE - Present days for a month
 * ============================
 */
router.get('/attendance/present/:employee_id/:month', async (req, res) => {
  const { employee_id, month } = req.params;
  const formattedMonth = month.padStart(2, '0');

  const sql = `
    SELECT employee_id, attendance_date, status
    FROM attendance
    WHERE employee_id = ?
      AND status = 'Present'
      AND MONTH(attendance_date) = ?
    ORDER BY attendance_date DESC
  `;

  try {
    const [rows] = await pool.query(sql, [employee_id, formattedMonth]);
    return res.json({
      Status: true,
      Result: rows
    });
  } catch (err) {
    console.error('❌ SQL error:', err);
    return res.status(500).json({
      Status: false,
      Error: 'Database error',
      Details: err.message
    });
  }
});

/**
 * ============================
 * UPDATE SALARY
 * ============================
 */
router.post('/update_salary/:id', async (req, res) => {
  const employeeId = req.params.id;
  const { salary } = req.body;

  if (!salary || isNaN(salary)) {
    return res.json({ Status: false, Error: 'Invalid salary input' });
  }

  const sql = 'UPDATE employee SET salary = ? WHERE id = ?';

  try {
    const [result] = await pool.query(sql, [salary, employeeId]);
    return res.json({ Status: true, Result: result });
  } catch (err) {
    console.error('❌ Error updating salary:', err);
    return res.json({ Status: false, Error: 'Database error' });
  }
});

/**
 * ============================
 * LOGOUT
 * ============================
 */
router.get('/logout', (req, res) => {
  res.clearCookie('token');
  return res.json({ Status: true });
});

export { router as HRRouter };
