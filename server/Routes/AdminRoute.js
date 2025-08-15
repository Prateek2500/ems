import express from "express";
import pool from "../utils/db.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

// IMAGE UPLOAD CONFIG
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join("Public", "Images");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
  },
});
const upload = multer({ storage });

// ADMIN LOGIN
router.post("/adminlogin", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM admin WHERE email = ?", [req.body.email]);

    if (rows.length > 0) {
      const match = await bcrypt.compare(req.body.password, rows[0].password);
      if (match) {
        const token = jwt.sign(
          { role: "admin", email: rows[0].email, id: rows[0].id, name: rows[0].name },
          "jwt_secret_key",
          { expiresIn: "1d" }
        );
        res.cookie("token", token);
        return res.json({ loginStatus: true, id: rows[0].id, name: rows[0].name });
      }
      return res.json({ loginStatus: false, Error: "Wrong password" });
    } else {
      return res.json({ loginStatus: false, Error: "Email not found" });
    }
  } catch (err) {
    console.error("❌ SQL error:", err);
    return res.json({ loginStatus: false, Error: err.message });
  }
});

// DEPARTMENT ROUTES
router.get("/dept", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM dept");
    return res.json({ Status: true, Result: rows });
  } catch {
    return res.json({ Status: false, Error: "Query Error" });
  }
});

router.post("/add_dept", async (req, res) => {
  try {
    await pool.query("INSERT INTO dept (`name`) VALUES (?)", [req.body.dept]);
    return res.json({ Status: true });
  } catch {
    return res.json({ Status: false, Error: "Query Error" });
  }
});

// ADD EMPLOYEE
router.post("/add_employee", upload.single("image"), async (req, res) => {
  try {
    const hash = await bcrypt.hash(req.body.password, 10);
    const imageName = req.file ? req.file.filename : null;
    const values = [
      req.body.name, req.body.email, hash, req.body.address, req.body.salary,
      imageName, req.body.dept_id, req.body.age, req.body.gender,
      req.body.account_no, req.body.bank_name, req.body.branch,
      req.body.university, req.body.yop, req.body.father_name,
      req.body.mother_name, req.body.designation, req.body.experience,
      req.body.emergency_contact, req.body.alternate_contact,
      req.body.aadhar_number, req.body.pan_number, req.body.degree,
      req.body.edu_branch, req.body.gradepoint
    ];
    await pool.query(
      `INSERT INTO employee 
      (name, email, password, address, salary, image, dept_id, age, gender,
       account_no, bank_name, branch, university, yop, father_name, mother_name, designation, experience,
       emergency_contact, alternate_contact, aadhar_number, pan_number, degree, edu_branch, gradepoint) 
      VALUES (?)`, [values]
    );
    return res.json({ Status: true });
  } catch (err) {
    return res.json({ Status: false, Error: "Query error: " + err.message });
  }
});

// EDIT EMPLOYEE
router.put("/edit_employee/:id", upload.single("image"), async (req, res) => {
  const id = req.params.id;
  const allowedFields = {
    name: "string", email: "string", salary: "number", address: "string",
    dept_id: "number", age: "number", gender: "string", account_no: "string",
    bank_name: "string", branch: "string", university: "string", yop: "number",
    father_name: "string", mother_name: "string", emergency_contact: "string",
    alternate_contact: "string", aadhar_number: "string", pan_number: "string",
    degree: "string", edu_branch: "string", gradepoint: "number"
  };
  try {
    const updateFields = {};
    Object.keys(req.body).forEach(field => {
      if (allowedFields[field]) {
        updateFields[field] = allowedFields[field] === "number" ? Number(req.body[field]) : req.body[field].toString();
      }
    });

    if (req.file) {
      updateFields.image = req.file.filename;
      const [rows] = await pool.query("SELECT image FROM employee WHERE id = ?", [id]);
      if (rows[0]?.image) {
        fs.unlink(path.join("Public", "Images", rows[0].image), () => {});
      }
    }

    if (!Object.keys(updateFields).length) {
      return res.status(400).json({ Status: false, Error: "No valid fields to update" });
    }

    const setClause = Object.keys(updateFields).map(f => `${f} = ?`).join(", ");
    await pool.query(`UPDATE employee SET ${setClause} WHERE id = ?`, [...Object.values(updateFields), id]);

    return res.json({ Status: true, Message: "Employee updated" });
  } catch (err) {
    return res.status(500).json({ Status: false, Error: err.message });
  }
});

// DELETE EMPLOYEE
router.delete("/delete_employee/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const [rows] = await pool.query("SELECT image FROM employee WHERE id = ?", [id]);
    if (!rows.length) return res.status(404).json({ Status: false, Error: "Employee not found" });

    await pool.query("DELETE FROM leaves WHERE employee_id = ?", [id]);
    await pool.query("DELETE FROM attendance WHERE employee_id = ?", [id]);
    await pool.query("DELETE FROM employee WHERE id = ?", [id]);

    if (rows[0].image) {
      fs.unlink(path.join("Public", "Images", rows[0].image), () => {});
    }
    return res.json({ Status: true, Message: "Employee deleted" });
  } catch (err) {
    return res.status(500).json({ Status: false, Error: err.message });
  }
});

// EMPLOYEE LIST
router.get("/employee", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT e.*, d.name AS dept_name FROM employee e 
       LEFT JOIN dept d ON e.dept_id = d.id`
    );
    return res.json({ Status: true, Result: rows });
  } catch {
    return res.json({ Status: false, Error: "Query Error" });
  }
});

// GET EMPLOYEE BY ID
router.get("/employee/:id", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT e.*, d.name AS dept_name 
       FROM employee e 
       LEFT JOIN dept d ON e.dept_id = d.id 
       WHERE e.id = ?`, [req.params.id]
    );
    if (rows.length) return res.json({ Status: true, Result: rows[0] });
    return res.json({ Status: false, Error: "Employee not found" });
  } catch {
    return res.json({ Status: false, Error: "Query Error" });
  }
});

// DASHBOARD STATS
router.get("/admin_count", async (req, res) => {
  const [rows] = await pool.query("SELECT COUNT(id) AS admin FROM admin");
  return res.json({ Status: true, Result: rows });
});
router.get("/employee_count", async (req, res) => {
  const [rows] = await pool.query("SELECT COUNT(id) AS employee FROM employee");
  return res.json({ Status: true, Result: rows });
});
router.get("/salary_count", async (req, res) => {
  const [rows] = await pool.query("SELECT SUM(salary) AS salaryOFEmp FROM employee");
  return res.json({ Status: true, Result: rows });
});

// LOGOUT
router.get("/logout", (req, res) => {
  res.clearCookie("token");
  return res.json({ Status: true });
});

export { router as adminRouter };
