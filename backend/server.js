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

// API endpoint to get all rides
app.get("/api/rides", (req, res) => {
  res.status(200).json(rides);
});

// API endpoint to add a new ride
app.post("/api/rides", (req, res) => {
  const newRide = {
    id: rides.length + 1,
    pickup: req.body.pickup,
    destination: req.body.destination,
    status: req.body.status || "Pending",
  };
  rides.push(newRide);
  res.status(201).json(newRide);
});

// API endpoint to update a ride's status
app.put("/api/rides/:id", (req, res) => {
  const rideId = parseInt(req.params.id);
  const ride = rides.find((r) => r.id === rideId);

  if (!ride) {
    return res.status(404).json({ message: "Ride not found" });
  }

  ride.status = req.body.status || ride.status;
  res.status(200).json(ride);
});

// API endpoint to delete a ride
app.delete("/api/rides/:id", (req, res) => {
  const rideId = parseInt(req.params.id);
  const rideIndex = rides.findIndex((r) => r.id === rideId);

  if (rideIndex === -1) {
    return res.status(404).json({ message: "Ride not found" });
  }

  rides.splice(rideIndex, 1);
  res.status(200).json({ message: "Ride deleted successfully" });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});