import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import Database from "better-sqlite3";

const db = new Database("hr.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'Employee',
    employee_id INTEGER,
    FOREIGN KEY (employee_id) REFERENCES employees(id)
  );

  CREATE TABLE IF NOT EXISTS employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL,
    department TEXT NOT NULL,
    status TEXT DEFAULT 'Active',
    joined_date TEXT DEFAULT CURRENT_TIMESTAMP,
    salary INTEGER DEFAULT 50000
  );

  CREATE TABLE IF NOT EXISTS attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER,
    date TEXT DEFAULT (DATE('now')),
    clock_in TEXT,
    clock_out TEXT,
    status TEXT, -- 'On Time', 'Late', 'Absent', 'On Leave'
    FOREIGN KEY (employee_id) REFERENCES employees(id)
  );

  CREATE TABLE IF NOT EXISTS leave_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER,
    type TEXT, -- 'Annual', 'Sick', 'Unpaid'
    start_date TEXT,
    end_date TEXT,
    reason TEXT,
    status TEXT DEFAULT 'Pending', -- 'Pending', 'Approved', 'Rejected'
    FOREIGN KEY (employee_id) REFERENCES employees(id)
  );

  CREATE TABLE IF NOT EXISTS payroll (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER,
    month TEXT,
    year INTEGER,
    net_pay INTEGER,
    status TEXT DEFAULT 'Pending',
    FOREIGN KEY (employee_id) REFERENCES employees(id)
  );

  CREATE TABLE IF NOT EXISTS shifts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    start_time TEXT,
    end_time TEXT
  );

  CREATE TABLE IF NOT EXISTS performance_reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER,
    rating INTEGER,
    feedback TEXT,
    date TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id)
  );

  CREATE TABLE IF NOT EXISTS documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    type TEXT,
    url TEXT,
    date TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    department TEXT NOT NULL,
    location TEXT NOT NULL,
    type TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT DEFAULT 'Open'
  );

  CREATE TABLE IF NOT EXISTS applicants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_id INTEGER,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    resume_text TEXT,
    ai_score INTEGER,
    ai_feedback TEXT,
    status TEXT DEFAULT 'New',
    FOREIGN KEY (job_id) REFERENCES jobs(id)
  );
`);

// Migration: Ensure salary column exists in employees
try {
  db.exec("ALTER TABLE employees ADD COLUMN salary INTEGER DEFAULT 50000");
} catch (e) {}

// Migration: Ensure employee_id exists in users
try {
  db.exec("ALTER TABLE users ADD COLUMN employee_id INTEGER");
} catch (e) {}

// Seed data
const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number };
if (userCount.count === 0) {
  db.prepare("INSERT INTO users (email, password, role) VALUES (?, ?, ?)").run("admin@nexus.ai", "admin123", "Admin");
}

const employeeCount = db.prepare("SELECT COUNT(*) as count FROM employees").get() as { count: number };
if (employeeCount.count === 0) {
  const insertEmployee = db.prepare("INSERT INTO employees (name, email, role, department, salary) VALUES (?, ?, ?, ?, ?)");
  insertEmployee.run("Sarah Chen", "sarah.chen@nexus.ai", "Senior Engineer", "Engineering", 120000);
  insertEmployee.run("Marcus Miller", "m.miller@nexus.ai", "HR Manager", "Human Resources", 85000);
  insertEmployee.run("Elena Rodriguez", "elena.r@nexus.ai", "Product Designer", "Design", 90000);
  
  // Create employee users
  db.prepare("INSERT INTO users (email, password, role, employee_id) VALUES (?, ?, ?, ?)").run("sarah@nexus.ai", "password123", "Employee", 1);
}

const shiftCount = db.prepare("SELECT COUNT(*) as count FROM shifts").get() as { count: number };
if (shiftCount.count === 0) {
  const insertShift = db.prepare("INSERT INTO shifts (name, start_time, end_time) VALUES (?, ?, ?)");
  insertShift.run("Morning", "09:00", "17:00");
  insertShift.run("Evening", "17:00", "01:00");
}

async function startServer() {
  const app = express();
  app.use(express.json());
  const PORT = 3000;

  // Auth
  app.post("/api/login", (req, res) => {
    const { email, password } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE email = ? AND password = ?").get(email, password);
    if (user) res.json(user);
    else res.status(401).json({ error: "Invalid credentials" });
  });

  // Employees
  app.get("/api/employees", (req, res) => {
    const employees = db.prepare("SELECT * FROM employees ORDER BY joined_date DESC").all();
    res.json(employees);
  });

  app.get("/api/employees/:id", (req, res) => {
    const employee = db.prepare("SELECT * FROM employees WHERE id = ?").get(req.params.id);
    if (employee) res.json(employee);
    else res.status(404).json({ error: "Employee not found" });
  });

  app.put("/api/employees/:id", (req, res) => {
    const { name, email, role, department, salary, status } = req.body;
    db.prepare(`
      UPDATE employees 
      SET name = ?, email = ?, role = ?, department = ?, salary = ?, status = ?
      WHERE id = ?
    `).run(name, email, role, department, salary, status, req.params.id);
    res.json({ success: true });
  });

  app.post("/api/employees", (req, res) => {
    const { name, email, role, department, salary } = req.body;
    try {
      const result = db.prepare("INSERT INTO employees (name, email, role, department, salary) VALUES (?, ?, ?, ?, ?)").run(name, email, role, department, salary || 50000);
      res.json({ id: result.lastInsertRowid });
    } catch (e) {
      res.status(400).json({ error: "Email already exists" });
    }
  });

  // Attendance
  app.get("/api/attendance", (req, res) => {
    const stats = db.prepare(`
      SELECT 
        department,
        COUNT(*) as total,
        SUM(CASE WHEN status = 'On Time' THEN 1 ELSE 0 END) as on_time,
        SUM(CASE WHEN status = 'Late' THEN 1 ELSE 0 END) as late,
        SUM(CASE WHEN status = 'Absent' THEN 1 ELSE 0 END) as absent,
        SUM(CASE WHEN status = 'On Leave' THEN 1 ELSE 0 END) as on_leave
      FROM employees e
      LEFT JOIN attendance a ON e.id = a.employee_id AND a.date = DATE('now')
      GROUP BY department
    `).all();
    res.json(stats);
  });

  app.post("/api/attendance", (req, res) => {
    const { employee_id, status, clock_in, clock_out } = req.body;
    const result = db.prepare("INSERT INTO attendance (employee_id, status, clock_in, clock_out) VALUES (?, ?, ?, ?)").run(employee_id, status, clock_in, clock_out);
    res.json({ id: result.lastInsertRowid });
  });

  app.put("/api/attendance/:id", (req, res) => {
    const { status, clock_in, clock_out } = req.body;
    db.prepare("UPDATE attendance SET status = ?, clock_in = ?, clock_out = ? WHERE id = ?").run(status, clock_in, clock_out, req.params.id);
    res.json({ success: true });
  });

  app.get("/api/attendance/sheet", (req, res) => {
    const date = req.query.date || 'now';
    const dateStr = date === 'now' ? db.prepare("SELECT DATE('now') as now").get().now : date;
    const sheet = db.prepare(`
      SELECT 
        e.id as employee_id,
        e.name,
        e.department,
        a.id as attendance_id,
        a.status,
        a.clock_in,
        a.clock_out,
        a.date
      FROM employees e
      LEFT JOIN attendance a ON e.id = a.employee_id AND a.date = ?
      ORDER BY e.name ASC
    `).all(dateStr);
    res.json(sheet);
  });

  app.post("/api/attendance/upsert", (req, res) => {
    const { employee_id, date, status, clock_in, clock_out } = req.body;
    const dateStr = date || db.prepare("SELECT DATE('now') as now").get().now;
    const existing = db.prepare("SELECT id FROM attendance WHERE employee_id = ? AND date = ?").get(employee_id, dateStr);
    
    if (existing) {
      db.prepare("UPDATE attendance SET status = ?, clock_in = ?, clock_out = ? WHERE id = ?")
        .run(status, clock_in, clock_out, existing.id);
      res.json({ id: existing.id, action: 'updated' });
    } else {
      const result = db.prepare("INSERT INTO attendance (employee_id, date, status, clock_in, clock_out) VALUES (?, ?, ?, ?, ?)")
        .run(employee_id, dateStr, status, clock_in, clock_out);
      res.json({ id: result.lastInsertRowid, action: 'inserted' });
    }
  });

  app.get("/api/attendance/raw", (req, res) => {
    const raw = db.prepare(`
      SELECT a.*, e.name, e.department 
      FROM attendance a 
      JOIN employees e ON a.employee_id = e.id 
      ORDER BY a.date DESC
    `).all();
    res.json(raw);
  });

  // Leaves
  app.get("/api/leaves", (req, res) => {
    const leaves = db.prepare(`
      SELECT l.*, e.name, e.department 
      FROM leave_requests l 
      JOIN employees e ON l.employee_id = e.id
    `).all();
    res.json(leaves);
  });

  app.post("/api/leaves", (req, res) => {
    const { employee_id, type, start_date, end_date, reason } = req.body;
    const result = db.prepare("INSERT INTO leave_requests (employee_id, type, start_date, end_date, reason) VALUES (?, ?, ?, ?, ?)").run(employee_id, type, start_date, end_date, reason);
    res.json({ id: result.lastInsertRowid });
  });

  app.post("/api/leaves/approve", (req, res) => {
    const { id, status } = req.body;
    db.prepare("UPDATE leave_requests SET status = ? WHERE id = ?").run(status, id);
    res.json({ success: true });
  });

  app.put("/api/leaves/:id", (req, res) => {
    const { type, start_date, end_date, reason, status } = req.body;
    db.prepare("UPDATE leave_requests SET type = ?, start_date = ?, end_date = ?, reason = ?, status = ? WHERE id = ?").run(type, start_date, end_date, reason, status, req.params.id);
    res.json({ success: true });
  });

  // Payroll
  app.get("/api/payroll", (req, res) => {
    const payroll = db.prepare(`
      SELECT p.*, e.name, e.salary 
      FROM payroll p 
      JOIN employees e ON p.employee_id = e.id
    `).all();
    res.json(payroll);
  });

  app.post("/api/payroll", (req, res) => {
    const { employee_id, month, year, net_pay } = req.body;
    const result = db.prepare("INSERT INTO payroll (employee_id, month, year, net_pay) VALUES (?, ?, ?, ?)").run(employee_id, month, year, net_pay);
    res.json({ id: result.lastInsertRowid });
  });

  app.put("/api/payroll/:id", (req, res) => {
    const { month, year, net_pay, status } = req.body;
    db.prepare("UPDATE payroll SET month = ?, year = ?, net_pay = ?, status = ? WHERE id = ?").run(month, year, net_pay, status, req.params.id);
    res.json({ success: true });
  });

  // Performance
  app.get("/api/performance", (req, res) => {
    const reviews = db.prepare(`
      SELECT r.*, e.name 
      FROM performance_reviews r 
      JOIN employees e ON r.employee_id = e.id
    `).all();
    res.json(reviews);
  });

  app.post("/api/performance", (req, res) => {
    const { employee_id, rating, feedback } = req.body;
    const result = db.prepare("INSERT INTO performance_reviews (employee_id, rating, feedback) VALUES (?, ?, ?)").run(employee_id, rating, feedback);
    res.json({ id: result.lastInsertRowid });
  });

  app.put("/api/performance/:id", (req, res) => {
    const { rating, feedback } = req.body;
    db.prepare("UPDATE performance_reviews SET rating = ?, feedback = ? WHERE id = ?").run(rating, feedback, req.params.id);
    res.json({ success: true });
  });

  // Shifts
  app.get("/api/shifts", (req, res) => {
    res.json(db.prepare("SELECT * FROM shifts").all());
  });

  app.post("/api/shifts", (req, res) => {
    const { name, start_time, end_time } = req.body;
    const result = db.prepare("INSERT INTO shifts (name, start_time, end_time) VALUES (?, ?, ?)").run(name, start_time, end_time);
    res.json({ id: result.lastInsertRowid });
  });

  app.put("/api/shifts/:id", (req, res) => {
    const { name, start_time, end_time } = req.body;
    db.prepare("UPDATE shifts SET name = ?, start_time = ?, end_time = ? WHERE id = ?").run(name, start_time, end_time, req.params.id);
    res.json({ success: true });
  });

  // Documents
  app.get("/api/documents", (req, res) => {
    res.json(db.prepare("SELECT * FROM documents").all());
  });

  app.post("/api/documents", (req, res) => {
    const { name, type, url } = req.body;
    const result = db.prepare("INSERT INTO documents (name, type, url) VALUES (?, ?, ?)").run(name, type, url);
    res.json({ id: result.lastInsertRowid });
  });

  app.put("/api/documents/:id", (req, res) => {
    const { name, type, url } = req.body;
    db.prepare("UPDATE documents SET name = ?, type = ?, url = ? WHERE id = ?").run(name, type, url, req.params.id);
    res.json({ success: true });
  });

  // Jobs & Applicants
  app.get("/api/jobs", (req, res) => {
    res.json(db.prepare("SELECT * FROM jobs").all());
  });

  app.post("/api/jobs", (req, res) => {
    const { title, department, location, type, description } = req.body;
    const result = db.prepare("INSERT INTO jobs (title, department, location, type, description) VALUES (?, ?, ?, ?, ?)").run(title, department, location, type, description);
    res.json({ id: result.lastInsertRowid });
  });

  app.get("/api/applicants/:jobId", (req, res) => {
    res.json(db.prepare("SELECT * FROM applicants WHERE job_id = ?").all(req.params.jobId));
  });

  app.post("/api/applicants", (req, res) => {
    const { job_id, name, email, resume_text, ai_score, ai_feedback } = req.body;
    const result = db.prepare("INSERT INTO applicants (job_id, name, email, resume_text, ai_score, ai_feedback) VALUES (?, ?, ?, ?, ?, ?)").run(job_id, name, email, resume_text, ai_score, ai_feedback);
    res.json({ id: result.lastInsertRowid });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
