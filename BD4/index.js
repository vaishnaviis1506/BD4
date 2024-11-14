const express = require('express');
const sqlite3 = require('sqlite3').verbose();

// Initialize the Express app
const app = express();
const PORT = 3000;

// Connect to the database
const db = new sqlite3.Database('./BD4/database.sqlite', (err) => {
  if (err) {
    console.error('Database connection error:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

// Function to get all restaurants
//1
const getAllRestaurants = (req, res) => {
  const sql = `SELECT * FROM restaurants`;

  db.all(sql, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ restaurants: rows });
  });
};

// Define the route
app.get('/restaurants', getAllRestaurants);
// http://localhost:3000/restaurants

//2
const getRestaurantById = (req, res) => {
  const id = req.params.id;
  const sql = `SELECT * FROM restaurants WHERE id = ?`;

  db.get(sql, [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (row) {
      res.json({ restaurant: row });
    } else {
      res.status(404).json({ error: 'Restaurant not found' });
    }
  });
};

// Define the route
app.get('/restaurants/details/:id', getRestaurantById);
// GET http://localhost:3000/restaurants/details/1

//3
app.get('/restaurants/cuisine/:cuisine', async (req, res) => {
  const { cuisine } = req.params;

  try {
    const result = await db.query(
      `SELECT 
              id, 
              name, 
              cuisine, 
              isVeg, 
              rating, 
              priceForTwo, 
              location, 
              hasOutdoorSeating, 
              isLuxury 
           FROM 
              restaurants 
           WHERE 
              cuisine = $1`,
      [cuisine]
    );

    res.json({ restaurants: result.rows });
  } catch (error) {
    console.error('Error fetching restaurants by cuisine:', error);
    res.status(500).send('Server error');
  }
});

//4
// Function to get restaurants by filter
const getRestaurantsByFilter = (req, res) => {
  const { isVeg, hasOutdoorSeating, isLuxury } = req.query;
  let sql = `SELECT * FROM restaurants WHERE 1=1`;
  const params = [];

  // Add filters dynamically
  if (isVeg !== undefined) {
    sql += ` AND isVeg = ?`;
    params.push(isVeg);
  }
  if (hasOutdoorSeating !== undefined) {
    sql += ` AND hasOutdoorSeating = ?`;
    params.push(hasOutdoorSeating);
  }
  if (isLuxury !== undefined) {
    sql += ` AND isLuxury = ?`;
    params.push(isLuxury);
  }

  db.all(sql, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ restaurants: rows });
  });
};

// Define the route
app.get('/restaurants/filter', getRestaurantsByFilter);

//5
app.get('/restaurants/sort-by-rating', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT 
              id, 
              name, 
              cuisine, 
              isVeg, 
              rating, 
              priceForTwo, 
              location, 
              hasOutdoorSeating, 
              isLuxury 
           FROM 
              restaurants 
           ORDER BY 
              rating DESC`
    );

    res.json({ restaurants: result.rows });
  } catch (error) {
    console.error('Error fetching restaurants sorted by rating:', error);
    res.status(500).send('Server error');
  }
});

//6
// Function to get all dishes
const getAllDishes = (req, res) => {
  const sql = `SELECT * FROM dishes`;

  db.all(sql, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ dishes: rows });
  });
};

// Define the route
app.get('/dishes', getAllDishes);

//7
app.get('/dishes/details/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      `SELECT 
              id, 
              name, 
              price, 
              rating, 
              isVeg 
           FROM 
              dishes 
           WHERE 
              id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Dish not found' });
    }

    res.json({ dish: result.rows[0] });
  } catch (error) {
    console.error('Error fetching dish by ID:', error);
    res.status(500).send('Server error');
  }
});

//8
// Function to get dishes by filter
const getDishesByFilter = (req, res) => {
  const { isVeg } = req.query;
  let sql = `SELECT * FROM dishes WHERE 1=1`;
  const params = [];

  // If isVeg filter is provided, add it to the SQL query
  if (isVeg !== undefined) {
    sql += ` AND isVeg = ?`;
    params.push(isVeg);
  }

  db.all(sql, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ dishes: rows });
  });
};

// Define the route
app.get('/dishes/filter', getDishesByFilter);

//9
app.get('/dishes/sort-by-price', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT 
              id, 
              name, 
              price, 
              rating, 
              isVeg 
           FROM 
              dishes 
           ORDER BY 
              price ASC`
    );

    res.json({ dishes: result.rows });
  } catch (error) {
    console.error('Error fetching dishes sorted by price:', error);
    res.status(500).send('Server error');
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
