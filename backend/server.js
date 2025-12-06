const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const moment = require("moment");
require("dotenv").config();


const app = express();
const PORT = process.env.PORT || 4000;


// ✅ Database Connection
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
}).promise();

app.use(cors());
app.use(bodyParser.json());

// ✅ Login Route
app.post("/login", async (req, res) => {
    try {
      const { email, password, role } = req.body;
  
      // Validate input
      if (!email || !password || !role) {
        return res.status(400).json({ success: false, message: "All fields are required" });
      }
  
      // Fetch user from the database
      const sql = `SELECT * FROM users WHERE email = ? AND role = ? AND password_hash = ?`;
      const [data] = await db.query(sql, [email, role, password]);
  
      if (data.length === 0) {
        return res.status(401).json({ success: false, message: "Invalid credentials" });
      }
  
      const user = data[0];

  
      // If password is valid, return success response
      res.json({ success: true, user: { id: user.user_id, username: user.username, role: user.role } });
    } catch (err) {
      console.error("Error:", err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  });

// ✅ Add Item
app.post("/addItem", async (req, res) => {
    try {
        const { name, category_name, brand, supplier_id, quantity, units, unit_price, description, domain } = req.body;
        const values = [name, category_name, brand, supplier_id, quantity, units, unit_price, description, domain];

        const sql = `INSERT INTO items (name, category_name, brand, supplier_id, quantity, units, unit_price, description, domain) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        const [data] = await db.query(sql, values);
        res.json({ success: true, message: "Item added successfully", data });
    } catch (err) {
        console.error("Error adding item:", err);
        res.status(500).json({ success: false, message: "Database error", error: err });
    }
});

// ✅ Add Domain
app.post("/addDomain", async (req, res) => {
    try {
        const { domain } = req.body;
        if (!domain) return res.status(400).json({ message: "Domain name is required!" });

        const sql = "INSERT INTO items (domain) VALUES (?)";
        await db.query(sql, [domain]);

        res.json({ message: "Domain added successfully!" });
    } catch (err) {
        console.error("Error adding domain:", err);
        res.status(500).json({ message: "Database error", error: err });
    }
});

// ✅ Get All Domains
app.get("/domains", async (req, res) => {
    try {
        const [results] = await db.query("SELECT DISTINCT domain FROM items");
        const domains = results.map(row => row.domain);
        res.json(domains);
    } catch (err) {
        console.error("Error fetching domains:", err);
        res.status(500).json({ message: "Database error", error: err });
    }
});

// ✅ Get Categories of a Specific Domain
app.get("/categories", async (req, res) => {
    try {
        const [results] = await db.query("SELECT DISTINCT category_name FROM categories");
        const categories = results.map(row => row.category_name);
        res.json(categories);
    } catch (err) {
        console.error("Error fetching categories:", err);
        res.status(500).json({ message: "Database error", error: err });
    }
});

// ✅ Get All Items
app.get("/items", async (req, res) => {
  try {
    const [data] = await db.query("SELECT * FROM items");
    res.json(data);
  } catch (err) {
    console.error("Error fetching items:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Get Items by Category (Dynamically Fetch Data)
app.get("/items/:category", async (req, res) => {
  try {
    const { category } = req.params;
    const [data] = await db.query("SELECT * FROM items WHERE category_name = ?", [category]);
    res.json(data);
  } catch (err) {
    console.error("Error fetching items by category:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Update Item
app.put("/items/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { name, category_name, brand, supplier_id, quantity, units, unit_price, description, domain } = req.body;
  
      console.log("Updating item with ID:", id); // Debugging
      console.log("Updated data:", req.body); // Debugging
  
      const sql = `
        UPDATE items
        SET 
          name = ?, 
          category_name = ?, 
          brand = ?, 
          supplier_id = ?, 
          quantity = ?, 
          units = ?, 
          unit_price = ?, 
          description = ?, 
          domain = ?
        WHERE id = ?
      `;
      const values = [name, category_name, brand, supplier_id, quantity, units, unit_price, description, domain, id];
  
      console.log("SQL Query:", sql); // Debugging
      console.log("SQL Values:", values); // Debugging
  
      const [result] = await db.query(sql, values);
  
      console.log("SQL result:", result); // Debugging
  
      if (result.affectedRows === 0) {
        console.log("Item not found:", id); // Debugging
        return res.status(404).json({ success: false, message: "Item not found" });
      }
  
      console.log("Item updated successfully:", id); // Debugging
      res.json({ success: true, message: "Item updated successfully" });
    } catch (error) {
      console.error("Error updating item:", error);
      res.status(500).json({ error: "Failed to update item." });
    }
  });
  // POST route to add a new user

  // POST route to add a new user
  app.post("/users", async (req, res) => {
    const { username, email, phone, password, role } = req.body;
  
    // Validate input
    if (!username || !email || !phone || !password || !role) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }
  
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: "Invalid email format." });
    }
  
    // Validate phone number
    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({ success: false, message: "Invalid phone number. Must be 10 digits." });
    }
  
    try {
      // Hash the password
      const passwordHash = await bcrypt.hash(password, 10);
  
      // Insert user into the database
      const sql = `
        INSERT INTO users (username, email, phone, password_hash, role)
        VALUES (?, ?, ?, ?, ?)
      `;
      const values = [username, email, phone, passwordHash, role];
      const [result] = await db.query(sql, values);
  
      res.json({ success: true, message: "User added successfully", userId: result.insertId });
    } catch (error) {
      console.error("Error adding user:", error);
  
      // Handle duplicate email or phone errors
      if (error.code === "ER_DUP_ENTRY") {
        return res.status(400).json({ success: false, message: "Email or phone number already exists." });
      }
  
      res.status(500).json({ success: false, message: "Failed to add user." });
    }
  });

  
  ///issue button
  
  app.post("/issue", async (req, res) => {
    const {
      item_id,
      item,
      quantity,
      issued_by,
      issue_date,
      issued_to,
      brand,
      units,
      unit_price,
      domain,
      category_name,
    } = req.body;
  
    console.log("Request Body:", req.body);
  
    // Validate input
    if (
      !item_id ||
      !item ||
      !quantity ||
      !issued_by ||
      !issue_date ||
      !issued_to ||
      !brand ||
      !units ||
      !unit_price ||
      !domain ||
      !category_name
    ) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }
  
    try {
      // Fetch the current quantity for debugging
      const [currentItem] = await db.query("SELECT quantity FROM items WHERE id = ?", [item_id]);
      if (currentItem.length === 0) {
        return res.status(404).json({ success: false, message: "Item not found in the database." });
      }
      console.log("Current Quantity in Database:", currentItem[0].quantity);
  
      if (currentItem[0].quantity < quantity) {
        return res.status(400).json({ success: false, message: "Insufficient quantity in inventory." });
      }
  
      // Insert into issued_items table
      const insertIssuedItemQuery = `
        INSERT INTO issued_items (
          item_id, item, quantity, issued_by, issue_date, issued_to, brand, units, unit_price, domain, category_name
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      await db.query(insertIssuedItemQuery, [
        item_id,
        item,
        quantity,
        issued_by,
        issue_date,
        issued_to,
        brand,
        units,
        unit_price,
        domain,
        category_name,
      ]);
  
      // Update the items table to reduce the quantity
      const updateInventoryQuery = `
        UPDATE items
        SET quantity = quantity - ?
        WHERE id = ? AND quantity >= ?
      `;
      console.log("Update Query:", updateInventoryQuery);
      console.log("Query Parameters:", [quantity, item_id, quantity]);
  
      const [updateResult] = await db.query(updateInventoryQuery, [quantity, item_id, quantity]);
      if (updateResult.affectedRows === 0) {
        return res.status(404).json({ success: false, message: "Item not found or insufficient quantity in inventory." });
      }
  
      res.json({ success: true, message: "Item issued successfully." });
    } catch (err) {
      console.error("Error issuing item:", err);
      res.status(500).json({ success: false, message: "Database error." });
    }
  });
  
  
  
  // issue table
  app.get("/issued_items", async (req, res) => {
    try {
        const [data] = await db.query("SELECT * FROM issued_items;");
        res.json(data);
    } catch (err) {
        console.error("Error fetching items:", err);
        res.status(500).json({ error: "Server error" });
    }
});

app.post("/purchases", async (req, res) => {
  const { supplier_id, purchase_date, items } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ success: false, message: "Cart is empty" });
  }

  try {
    // Generate a unique bill number
    const [billResult] = await db.query("SELECT MAX(bill_no) AS lastBill FROM bill");
    const bill_no = billResult[0].lastBill ? billResult[0].lastBill + 1 : 1000;

    // Insert a new record into the bill table
    // Ensure purchase_date is in 'YYYY-MM-DD' format
    await db.query(
      "INSERT INTO bill (bill_no, invoice, purchase_date, supplier_id, created_at) VALUES (?, NULL, ?, ?, NOW())",
      [bill_no, moment(purchase_date, 'DD-MM-YYYY').format('YYYY-MM-DD'), supplier_id]
    );

    console.log("Bill inserted successfully with bill_no:", bill_no);

    // Process each item in the cart
    for (const item of items) {
      const {
        item_name,
        quantity,
        unit_price,
        expiry_date,
        brand,
        units,
        domain,
        category_name,
        description,
        SED,
        SPN,
        invoice,
      } = item;

      const total_cost = quantity * unit_price;

      console.log("Processing item:", item);

      // Insert the item into the purchases table
      await db.query(
        "INSERT INTO purchases (item_name, supplier_id, purchase_date, quantity, unit_price, total_cost, expiry_date, bill_no, brand, units, domain, category_name, description, SED, SPN) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
          item_name,
          supplier_id,
          purchase_date,
          quantity,
          unit_price,
          total_cost,
          expiry_date,
          bill_no,
          brand,
          units,
          domain,
          category_name,
          description,
          SED,
          SPN,
          invoice,
        ]
      );

      console.log("Inserted item into purchases table:", item_name);

      // Always insert a new record into the items table
      try {
        console.log("Inserting item into items table:", {
          item_name,
          category_name,
          brand,
          supplier_id,
          quantity,
          units,
          unit_price,
          description,
          domain,
          expiry_date,
          SED,
          SPN,
        });
        await db.query(
          "INSERT INTO items (name, category_name, brand, supplier_id, quantity, units, unit_price, description, domain, expiry_date, SED, SPN) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
          [
            item_name,
            category_name,
            brand,
            supplier_id,
            quantity,
            units,
            unit_price,
            description,
            domain,
            expiry_date,
            SED,
            SPN,
          ]
        );
        console.log("Inserted item into items table:", item_name);
      } catch (error) {
        console.error("Error inserting into items table:", error);
        console.error("Error details:", error.message);
        console.error("Error stack:", error.stack);
      }
    }

    res.json({ success: true, bill_no });
  } catch (error) {
    console.error("Error adding purchase:", error);
    res.status(500).json({ success: false, message: "Database error." });
  }
});


// ✅ Get Purchases
app.get("/purchaselist", async (req, res) => {
  const { date_from, date_to, supplier_id, domain, category_name, item_name, bill_no } = req.query;

  let query = `
    SELECT 
      p.purchase_id,
      p.item_name,
      p.quantity,
      p.unit_price,
      p.total_cost,
      b.bill_no, -- Ensure bill_no is selected from the bill table
      p.brand,
      p.units,
      p.description,
      p.domain,
      p.category_name,
      b.invoice,
      b.purchase_date,
      b.supplier_id,
      p.SED,
      p.SPN
    FROM purchases p
    JOIN bill b ON p.bill_no = b.bill_no
    WHERE 1=1
  `;
  console.log("Query:", query); // Debugging log

  const params = [];

  if (date_from) {
    query += ` AND DATE(b.purchase_date) >= ?`;
    params.push(date_from);
  }
  if (date_to) {
    query += ` AND DATE(b.purchase_date) <= ?`;
    params.push(date_to);
  }
  if (supplier_id) {
    query += ` AND b.supplier_id = ?`;
    params.push(supplier_id);
  }
  if (domain) {
    query += ` AND p.domain = ?`;
    params.push(domain);
  }
  if (category_name) {
    query += ` AND p.category_name LIKE ?`;
    params.push(`%${category_name}%`);
  }
  if (item_name) {
    query += ` AND p.item_name LIKE ?`;
    params.push(`%${item_name}%`);
  }
  if (bill_no) {
    query += ` AND b.bill_no = ?`;
    params.push(bill_no);
  }

  try {
    const [purchases] = await db.query(query, params);
    console.log("Query Results:", purchases); // Debugging log 
    console.log("Invoice Data:", purchases.map(row => row.invoice));
    purchases.forEach((row) => {
      if (row.invoice) {
        row.invoice = row.invoice.toString("base64");
      }
    });
    res.json(purchases);
  } catch (err) {
    console.error("Error fetching purchases:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/suppliers", async (req, res) => {
  try {
    // Fetch all suppliers from the database
    const [suppliers] = await db.query("SELECT gstin, supplier_name, contact_person, phone_number, address FROM suppliers;");
    res.json(suppliers); // Return the list of suppliers
  } catch (err) {
    console.error("Error fetching suppliers:", err);
    res.status(500).json({ message: "Failed to fetch suppliers." });
  }
});

app.post("/addSupplier", async (req, res) => {
  const { supplier_id, supplier_name, contact_person, phone, address } = req.body;


  console.log("Request Body:", req.body); // Log the incoming request body

  // Validate input
  if (!supplier_id || !supplier_name || !contact_person || !phone || !address) {
    console.error("Validation failed. Missing required fields.");
    return res.status(400).json({ success: false, message: "All fields are required." });
  }

  try {
    const insertSupplierQuery = `
      INSERT INTO suppliers (gstin, supplier_name,contact_person, phone_number, address)
      VALUES (?, ?, ?, ?, ?)
    `;
    console.log("Executing query:", insertSupplierQuery);
    console.log("With values:", [supplier_id, supplier_name, contact_person, phone, address]);

    await db.query(insertSupplierQuery, [supplier_id, supplier_name, contact_person, phone, address]);
    res.json({ success: true, message: "Supplier added successfully." });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      console.error("Duplicate entry error:", err);
      return res.status(409).json({ success: false, message: "Supplier ID already exists." });
    }
    console.error("Error adding supplier:", err); // Log the error
    res.status(500).json({ success: false, message: "Database error.", error: err.message });
  }
});

app.get("/users", async (req, res) => {
  try {
    console.log("Fetching users from the database..."); // Debugging log
    const [users] = await db.query("SELECT user_id, username, email, role FROM users");
    console.log("Fetched users:", users); // Debugging log
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error); // Log the error
    res.status(500).json({ error: "Failed to fetch users." });
  }
});
// ✅ Get User Details by ID
app.get("/user/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Fetch user details excluding the password_hash
    const [user] = await db.query(
      "SELECT user_id, username, email, phone, role, created_at,password_hash FROM users WHERE user_id = ?",
      [id]
    );

    if (user.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, user: user[0] });
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.delete("/supplier/:gstin", (req, res) => {
  const { gstin } = req.params;

  const query = "DELETE FROM suppliers WHERE gstin = ?";

  db.query(query, [gstin], (err, result) => {
    if (err) return res.status(500).json({ message: "Database error" });

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Supplier not found" });

    res.json({ message: "Supplier deleted successfully" });
  });
});


app.post("/deleteMultipleSuppliers", (req, res) => {
  const { ids } = req.body; // array of GSTIN values

  if (!ids || ids.length === 0)
    return res.status(400).json({ message: "No supplier IDs provided" });

  const query = "DELETE FROM suppliers WHERE gstin IN (?)";

  db.query(query, [ids], (err, result) => {
    if (err) return res.status(500).json({ message: "Database error" });

    res.json({
      message: `${result.affectedRows} supplier(s) deleted successfully`,
    });
  });
});


// ✅ Start Server
app.listen(PORT, () => {
    console.log(`✅ Server is running on :${PORT}`);
});