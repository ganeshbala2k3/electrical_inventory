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
    const sql = "SELECT category_id, category_name FROM categories ORDER BY category_name ASC";
    const [rows] = await db.query(sql);
    
    res.json(rows);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ message: "Database error while fetching categories" });
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
  
  
  
app.get("/issued-items", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT ii.issue_date, ii.id, ii.inventory_item_id, ii.quantity, ii.issued_to, ii.issued_by,
             ii.allotment_id, inv.attributes
      FROM issued_items ii
      LEFT JOIN inventory_items inv ON ii.inventory_item_id = inv.item_id
      ORDER BY ii.issue_date DESC
    `);
    console.log("helloooo");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch issued items" });
  }
});


app.post("/purchase", async (req, res) => {
  const conn = await db.getConnection();
  await conn.beginTransaction();

  try {
    const { supplier_id, purchase_date, bill_number, items ,stock_page_no,stock_entry_date } = req.body;

    // Insert purchase record
    const [purchaseResult] = await conn.query(
      `INSERT INTO purchases (supplier_id, purchase_date, bill_number,stock_entry_date,stock_page_no) 
       VALUES (?, ?, ?,?,?)`,
      [supplier_id, purchase_date, bill_number,stock_entry_date,stock_page_no]
    );

    const purchase_id = purchaseResult.insertId;

    // Process each item in purchase
    for (const item of items) {

      // Create readable item name using attributes
      const attributeString = Object.entries(item.attributes)
        .map(([k, v]) => `${k}: ${v}`)
        .join(" | ");

      const item_name = `${attributeString}`;

      // Insert purchased_items entry
      const [itemRes] = await conn.query(
        `INSERT INTO purchased_items 
          (purchase_id, category_id, item_name, quantity, unit_price,quantity_type)
         VALUES (?, ?, ?, ?, ?,?)`,
        [
          purchase_id,
          item.category_id,
          item_name,
          item.quantity,
          item.unit_price,
          item.quantity_type
        ]
      );

      const purchased_item_id = itemRes.insertId;

      // Store attributes in purchased_item_attributes
      for (const [attrName, valueName] of Object.entries(item.attributes)) {
        const [[attrRow]] = await conn.query(
          `SELECT attribute_id FROM attributes WHERE attribute_name = ? LIMIT 1`,
          [attrName]
        );

        const [[valueRow]] = await conn.query(
          `SELECT value_id FROM attribute_values WHERE value = ? AND attribute_id = ? LIMIT 1`,
          [valueName, attrRow.attribute_id]
        );

        await conn.query(
          `INSERT INTO purchased_item_attributes (item_id, attribute_id, value_id)
           VALUES (?, ?, ?)`,
          [purchased_item_id, attrRow.attribute_id, valueRow.value_id]
        );
      }

      // -----------------------
      // 🔥 Update Inventory Table
      // -----------------------

      // Check if item already exists
      const [existing] = await conn.query(
        `SELECT item_id FROM inventory_items 
         WHERE category_id = ? AND attributes = ? LIMIT 1`,
        [item.category_id, attributeString]
      );

      if (existing.length > 0) {
        // If already exists → increase stock
        await conn.query(
          `UPDATE inventory_items 
           SET purchased_qty = purchased_qty + ?
           WHERE item_id = ?`,
          [item.quantity, existing[0].item_id]
        );
      } else {
        // If new item → insert
        await conn.query(
          `INSERT INTO inventory_items (category_id, category_name, attributes, purchased_qty)
           VALUES (?, ?, ?, ?)`,
          [item.category_id, item.category_name || "", attributeString, item.quantity]
        );
      }
    }

    await conn.commit();
    res.json({ success: true, message: "Purchase Saved & Inventory Updated" });

  } catch (err) {
    await conn.rollback();
    console.error("❌ Purchase Error:", err);
    res.status(500).json({ success: false, message: "Purchase Failed" });
  } finally {
    conn.release();
  }
});







// GET /purchaselist
app.get("/purchaselist", async (req, res) => {
  try {
    const { date_from, date_to, supplier_id, bill_no } = req.query;

    let conditions = [];
    let params = [];

    if (date_from) {
      conditions.push("p.purchase_date >= ?");
      params.push(date_from);
    }

    if (date_to) {
      conditions.push("p.purchase_date <= ?");
      params.push(date_to);
    }

    if (supplier_id) {
      conditions.push("p.supplier_id = ?");
      params.push(supplier_id);
    }

    if (bill_no) {
      conditions.push("p.bill_number = ?");
      params.push(bill_no);
    }

    const whereSQL = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const query = `
      SELECT 
          p.purchase_id,
          p.supplier_id,
          p.bill_number,
          p.purchase_date,
          pi.item_id,
          pi.item_name,
          pi.quantity,
          pi.unit_price,
          pi.total_price,
          c.category_name,
          GROUP_CONCAT(CONCAT(a.attribute_name, ': ', av.value) SEPARATOR ', ') AS attributes
      FROM purchases p
      JOIN purchased_items pi ON p.purchase_id = pi.purchase_id
      JOIN categories c ON pi.category_id = c.category_id
      LEFT JOIN purchased_item_attributes pia ON pi.item_id = pia.item_id
      LEFT JOIN attributes a ON pia.attribute_id = a.attribute_id
      LEFT JOIN attribute_values av ON pia.value_id = av.value_id
      ${whereSQL}
      GROUP BY pi.item_id
      ORDER BY p.purchase_date DESC, p.purchase_id DESC;
    `;

    const [rows] = await db.query(query, params);

    res.json(rows);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error fetching purchases list" });
  }
});



app.get("/suppliers", async (req, res) => {
  try {
    // Fetch all suppliers from the database
    const [suppliers] = await db.query("SELECT gstin, supplier_name , phone_number, contact_person, address FROM suppliers;");
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


  console.log(id);
  try {
    // Fetch user details excluding the password_hash
    const [rows] = await db.query(
      "SELECT user_id, username, email, phone_number, role, created_at,password_hash FROM users WHERE user_id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, user: rows[0] });

  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.delete("/deletesupplier/:gstin", async (req, res) => {
  try {
    const { gstin } = req.params;
    
    const query = "DELETE FROM suppliers WHERE gstin = ?";
    
    const [result] = await db.query(query, [gstin]);
    console.log(result);

    if (result.affectedRows === 0)
      return res.status(404).json({ success: false, message: "Supplier not found" });

    res.json({ success: true, message: "Supplier deleted successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});



app.post("/deleteMultipleSuppliers", async (req, res) => {
  try {
    const { ids } = req.body; // Array of GSTIN values

    if (!ids || ids.length === 0) {
      return res.status(400).json({ success: false, message: "No supplier IDs provided" });
    }

    const query = "DELETE FROM suppliers WHERE gstin IN (?)";

    const [result] = await db.query(query, [ids]); // <-- FIXED

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "No suppliers found to delete" });
    }

    res.json({ success: true, message: `${result.affectedRows} supplier(s) deleted successfully` });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


app.put("/change-password/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const { currentPassword, newPassword } = req.body;

    console.log("User ID:", userId);
    console.log("Received Data:", req.body);

    // Check if current password is correct
    const [rows] = await db.execute(
      "SELECT password_hash FROM users WHERE user_id = ?",
      [userId]
    );

    if (rows.length === 0) {
      return res.json({ success: false, message: "User not found" });
    }

    if (rows[0].password_hash !== currentPassword) {
      return res.json({ success: false, message: "Current password is incorrect" });
    }

    // Update with new password
    const [updateResult] = await db.execute(
      "UPDATE users SET password_hash = ? WHERE user_id = ?",
      [newPassword, userId]
    );

    if (updateResult.affectedRows === 0) {
      return res.json({
        success: false,
        message: "Password not updated. Something went wrong."
      });
    }

    return res.json({
      success: true,
      message: "Password updated successfully!"
    });

  } catch (error) {
    console.error(error);
    return res.json({
      success: false,
      message: "Server error while updating password"
    });
  }
});

app.get("/categories/:categoryId/attributes", async (req, res) => {
  try {
    const { categoryId } = req.params;

    const query = `
      SELECT 
        a.attribute_id,
        a.attribute_name,
        av.value_id,
        av.value
      FROM attributes a
      LEFT JOIN attribute_values av ON av.attribute_id = a.attribute_id
      WHERE a.category_id = ?
      ORDER BY a.attribute_name, av.value;
      
    `;

    const [rows] = await db.query(query, [categoryId]);

    if (!rows.length) {
      return res.json({});
    }

    // Convert flat rows → grouped object
    const formatted = {};

    rows.forEach(row => {
      if (!formatted[row.attribute_name]) {
        formatted[row.attribute_name] = {
          attribute_id: row.attribute_id,
          values: []
        };
      }

      if (row.value) {
        formatted[row.attribute_name].values.push({
          value_id: row.value_id,
          value: row.value
        });
      }
    });

    res.json(formatted);

  } catch (error) {
    console.error("Error fetching attributes:", error);
    res.status(500).json({
      message: "Backend error while fetching attributes",
      error
    });
  }
});

// app.post("/change-password/:id", async (req, res) => {
//   const userId = req.params;
//   const { currentPassword, newPassword } = req.body;
//   console.log(newPassword);

//   if (!currentPassword || !newPassword) {
//     return res.json({
//       success: false,
//       message: "Both current and new password are required.",
//     });
//   }

//   try {
//     // 1️⃣ Fetch user password from DB
//     const [rows] = await db.execute("SELECT password_hash FROM users WHERE user_id = ?", [userId]);

//     if (rows.length === 0) {
//       return res.json({ success: false, message: "User not found" });
//     }

//     const storedPassword = rows[0].password;

//     // 2️⃣ Compare current password
//     if (storedPassword !== currentPassword) {
//       return res.json({ success: false, message: "Current password is incorrect" });
//     }

//     // 3️⃣ Update new password
//     

//     
// });


// ✅ Start Server
app.listen(PORT, () => {
    console.log(`✅ Server is running on :${PORT}`);
});

app.post("/adduser", async (req, res) => {
  const { username, email, phone, password, role } = req.body;


  console.log("Request Body:", req.body); // Log the incoming request body

  // Validate input
  if (!username || !email || !phone || !password || !role) {
    console.error("Validation failed. Missing required fields.");
    return res.status(400).json({ success: false, message: "All fields are required." });
  }

  try {
    const userQuery = `
      INSERT INTO users (username, email,phone_number, password_hash, role)
      VALUES (?, ?, ?, ?, ?)
    `;

    await db.query(userQuery, [username, email, phone, password, role]);
    res.json({ success: true, message: "User added successfully." });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      console.error("Duplicate entry error:", err);
      return res.status(409).json({ success: false, message: "User ID already exists." });
    }
    console.error("Error adding supplier:", err); // Log the error
    res.status(500).json({ success: false, message: "Database error.", error: err.message });
  }
});

app.post("/add-categories", async (req, res) => {
  try {
    const { category_name } = req.body;
    await db.query("INSERT INTO categories (category_name) VALUES (?)", [category_name]);
    res.json({ message: "Category added" });
  } catch {
    res.status(500).json({ message: "Error adding category" });
  }
});

app.post("/add-attributes", async (req, res) => {
  try {
    const { category_id, attribute_name } = req.body;
    await db.query("INSERT INTO attributes (category_id, attribute_name) VALUES (?, ?)", [
      category_id,
      attribute_name
    ]);
    res.json({ message: "Attribute added" });
  } catch {
    res.status(500).json({ message: "Error adding attribute" });
  }
});

app.post("/add-attribute-values", async (req, res) => {
  try {
    const { attribute_id, value } = req.body;
    await db.query("INSERT INTO attribute_values (attribute_id, value) VALUES (?, ?)", [
      attribute_id,
      value
    ]);
    res.json({ message: "Value added" });
  } catch {
    res.status(500).json({ message: "Error adding value" });
  }
});

app.get("/purchase-details/:purchaseId", async (req, res) => {
  try {
    const { purchaseId } = req.params;

    const query = `
      SELECT 
        pi.item_id,
        pi.item_name,
        pi.quantity,
        pi.unit_price,
        pi.total_price,
        c.category_name,
        GROUP_CONCAT(CONCAT(a.attribute_name, ': ', av.value) SEPARATOR ', ') AS attributes
      FROM purchased_items pi
      JOIN categories c ON pi.category_id = c.category_id
      LEFT JOIN purchased_item_attributes pia ON pi.item_id = pia.item_id
      LEFT JOIN attributes a ON pia.attribute_id = a.attribute_id
      LEFT JOIN attribute_values av ON pia.value_id = av.value_id
      WHERE pi.purchase_id = ?
      GROUP BY pi.item_id;
    `;

    const [items] = await db.query(query, [purchaseId]);

    const invoiceTotal = items.reduce((sum, i) => sum + Number(i.total_price), 0);

    res.json({ items, invoiceTotal });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching invoice details" });
  }
});


app.get("/purchase-invoices", async (req, res) => {
  try {
    const query = `
      SELECT 
        p.purchase_id,
        p.bill_number,
        p.supplier_id,
        s.supplier_name,
        DATE_FORMAT(p.purchase_date, '%Y-%m-%d') as purchase_date,
        SUM(pi.total_price) as invoice_total
      FROM purchases p
      JOIN purchased_items pi ON p.purchase_id = pi.purchase_id
      JOIN suppliers s ON p.supplier_id = s.gstin
      GROUP BY p.purchase_id
      ORDER BY p.purchase_date DESC;
    `;

    const [rows] = await db.query(query);
    res.json(rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching invoice list" });
  }
});

app.get("/category-stock/:categoryId", async (req, res) => {
  try {
    const query = `
      SELECT 
        ii.item_id,
        ii.category_name,
        ii.attributes,
        ii.available_qty
      FROM inventory_items ii
      WHERE ii.category_id = ? AND ii.available_qty > 0
    `;

    const [rows] = await db.query(query, [req.params.categoryId]);
    res.json(rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch inventory." });
  }
});

app.post("/issue-items", async (req, res) => {
  const conn = await db.getConnection();
  await conn.beginTransaction();

  try {
    const { items } = req.body;

    for (const item of items) {

      // Insert issue record
      await conn.query(
        `INSERT INTO issued_items (inventory_item_id, quantity, issued_to, issued_by, issue_date, allotment_id)
         VALUES (?, ?, ?, ?, ?,?)`,
        [
          item.item_id, 
          item.quantity,
          item.issued_to,
          item.issued_by,
          item.issue_date.split("T")[0],
          item.allotment_id

        ]
      );

      // 🔥 Reduce inventory
      await conn.query(
        `UPDATE inventory_items 
         SET issued_qty = issued_qty + ?
         WHERE item_id = ?`,
        [item.quantity, item.item_id]
      );
    }

    await conn.commit();
    res.json({ success: true, message: "Items issued successfully!" });

  } catch (err) {
    await conn.rollback();
    console.log(err);
    res.status(500).json({ success: false, message: "Issuing failed" });
  } finally {
    conn.release();
  }
});

app.post("/recipients", async (req, res) => {
  try {
    const { recipient_name, department, phone, email } = req.body;
    console.log(req.body);
    await db.query(
      `INSERT INTO recipients (recipient_name, department, phone, email)
       VALUES (?, ?, ?, ?)`,
      [recipient_name, department, phone, email]
    );

    res.json({ success: true, message: "Recipient added successfully" });
  } catch (err) {
    console.error("Error adding recipient:", err);
    res.status(500).json({ error: "Failed to add recipient" });
  }
});

app.get("/recipients", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM recipients ORDER BY recipient_id DESC");
    res.json(rows);
  } catch (err) {
    console.error("Error fetching recipients:", err);
    res.status(500).json({ error: "Failed to fetch recipients" });
  }
});

app.delete("/recipients/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await db.query("DELETE FROM recipients WHERE recipient_id = ?", [id]);

    res.json({ success: true, message: "Recipient deleted successfully" });
  } catch (err) {
    console.error("Error deleting recipient:", err);
    res.status(500).json({ error: "Failed to delete recipient" });
  }
});
