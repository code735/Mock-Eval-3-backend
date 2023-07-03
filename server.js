const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const mongoURI = process.env.MONGO_URI;

mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to Atlas'))
  .catch((error) => console.log(error));

const userSchema = new mongoose.Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
});


const employeeSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  department: { type: String, required: true },
  salary: { type: Number, required: true },
});

const Employee = mongoose.model('Employee', employeeSchema);
const User = mongoose.model('User', userSchema);

app.get('/',(req,res)=>{
  res.send("Hello this is test route")
})


// sign in --------------------------------
app.post('/signup', async (req, res) => {
  try {
    const { email, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Password and Confirm Password do not match' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'User registered ' });
  } catch (error) {
    res.status(500).json({ message: 'An error' });
  }
});


app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY);

    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    res.status(500).json({ message: 'error' });
  }
});

// sign in --------------------------------

// employees -----------------------------------

app.get('/employees', async (req, res) => {
  try {
    const employees = await Employee.find();
    res.status(200).json(employees);
  } catch (error) {
    res.status(500).json({ message: 'error' });
  }
});

app.post('/employees', async (req, res) => {
  try {
    const { firstName, lastName, email, department, salary } = req.body;

    const newEmployee = new Employee({
      firstName,
      lastName,
      email,
      department,
      salary,
    });

    await newEmployee.save();

    res.status(201).json({ message: 'Employee added' });
  } catch (error) {
    res.status(500).json({ message: 'error' });
  }
});

app.put('/employees/:id', async (req, res) => {
  try {
    const { firstName, lastName, email, department, salary } = req.body;
    const employeeId = req.params.id;

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    employee.firstName = firstName;
    employee.lastName = lastName;
    employee.email = email;
    employee.department = department;
    employee.salary = salary;

    await employee.save();

    res.status(200).json({ message: 'Employee updated' });
  } catch (error) {
    res.status(500).json({ message: 'error' });
  }
});

app.delete('/employees/:id', async (req, res) => {
  try {
    const employeeId = req.params.id;

    const employee = await Employee.findByIdAndDelete(employeeId);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.status(200).json({ message: 'Employee deleted' });
  } catch (error) {
    res.status(500).json({ message: 'error' });
  }
});

// employees -----------------------------------


// const crypto = require('crypto');

// const generateSecretKey = () => {
//   const secret = crypto.randomBytes(64).toString('hex');
//   console.log('Secret:', secret);
// };

// generateSecretKey();


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
