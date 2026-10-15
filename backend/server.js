
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Sample ride data
const rides = [
  {
    id: 1,
    pickup: "Hyderabad",
    destination: "Gachibowli",
    status: "Completed",
  },
  {
    id: 2,
    pickup: "Miyapur",
    destination: "Hitech City",
    status: "In Progress",
  },
  {
    id: 3,
    pickup: "Kukatpally",
    destination: "Madhapur",
    status: "Pending",
  },
];

// API endpoint
app.get("/api/rides", (req, res) => {
  res.status(200).json(rides);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
