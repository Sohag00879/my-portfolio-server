const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config();
const jwt = require("jsonwebtoken");

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection URL
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    // Connect to MongoDB
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db("portfolio");
    const projects = db.collection("projects");
    const resumes = db.collection("resumes");
    const blogs = db.collection("blogs");

    // User Registration
    app.post("/api/v1/register", async (req, res) => {
      const { name, email, password } = req.body;

      // Check if email already exists
      const existingUser = await collection.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "User already exists",
        });
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert user into the database
      await collection.insertOne({ name, email, password: hashedPassword });

      res.status(201).json({
        success: true,
        message: "User registered successfully",
      });
    });

    // User Login
    app.post("/api/v1/login", async (req, res) => {
      const { email, password } = req.body;

      // Find user by email
      const user = await collection.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Compare hashed password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Generate JWT token
      const token = jwt.sign(
        { email: user.email, name: user.name },
        process.env.JWT_SECRET,
        {
          expiresIn: process.env.EXPIRES_IN,
        }
      );

      res.json({
        success: true,
        message: "Login successful",
        token,
      });
    });

    //create project

    app.post("/api/v1/create-project", async (req, res) => {
      try {
        await projects.insertOne(req.body);
        res.status(201).json({
          success: true,
          message: "Project Created Successfully",
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: "Internal server error",
        });
      }
    });

    app.get("/api/v1/projects", async (req, res) => {
      try {
        const data = await projects.find({}).toArray();
        res.status(200).json({
          success: true,
          message: "Successfully fetched",
          data,
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: "Internal server error",
        });
      }
    });

    //upload resume

    app.post("/api/v1/upload-resume", async (req, res) => {
      try {
        await resumes.insertOne(req.body);
        res.status(201).json({
          success: true,
          message: "Resume Uploaded Successfully",
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: "Internal server error",
        });
      }
    });

    app.get("/api/v1/get-resume", async (req, res) => {
      try {
        const data = await resumes.find({}).toArray();
        res.status(201).json({
          success: true,
          message: "Resume fetched Successfully",
          data,
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: "Internal server error",
        });
      }
    });

    //create blog

    app.post("/api/v1/create-blog", async (req, res) => {
      try {
        await blogs.insertOne(req.body);
        res.status(201).json({
          success: true,
          message: "Blog Created Successfully",
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: "Internal server error",
        });
      }
    });

    app.get("/api/v1/blogs", async (req, res) => {
      try {
        const data = await blogs.find({}).toArray();
        res.status(200).json({
          success: true,
          message: "Successfully fetched",
          data,
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: "Internal server error",
        });
      }
    });

    app.get("/api/v1/blogs/:blogId", async (req, res) => {
      const { blogId } = req.params;
      console.log(blogId);
      try {
        const blog = await blogs.findOne({ _id: new ObjectId(blogId) });
        console.log(blog);
        if (blog) {
          res.status(200).json({
            success: true,
            message: "Blog fetched successfully",
            data: blog,
          });
        } else {
          res.status(404).json({
            success: false,
            message: "Blog not found",
          });
        }
      } catch (error) {
        console.error(error);
        res.status(500).json({
          success: false,
          message: "Internal server error",
        });
      }
    });

    // Start the server
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  } finally {
  }
}

run().catch(console.dir);

// Test route
app.get("/", (req, res) => {
  const serverStatus = {
    message: "Server is running smoothly",
    timestamp: new Date(),
  };
  res.json(serverStatus);
});
