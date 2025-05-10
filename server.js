import express, { json } from "express";
import axios from "axios";
import validator from "validator";
const app = express();
app.use(json());

const PORT = process.env.PORT || 4200;

app.listen(PORT, (req, res) => {
  console.log(`Server is live at ${PORT}`);
});

//getMethod enter localhost:4100/input?email=youremail address

app.get("/input", (req, res) => {
  const email = req.query.email;
  if (!validator.isEmail(email))
    res.status(400).json({ Error_msg: "Email is not correct", email });
  console.log(`Helllo = ${email}`);

  //   res.send(`<h1>Your email is ${email}</h1>`);

  const Data = generateRandomNumbers(
    Math.floor(Math.random() * (10 - 5 + 1) + 5),
    1,
    100
  );
  const Secret = generateSecretMessage(8);
  res.status(200).json({ email, Data, Secret });
});

app.get("/output", (req, res) => {
  const email = req.query.email;
  if (!validator.isEmail(email)) {
    res.status(400).json({ Error_msg: "Email is not correct", email });
  }
  async function f1() {
    const resp = await axios.get(`http://localhost:4100/input?email=${email}`);
    const data = await resp.data;
    const arr = data.Data;
    if (!Array.isArray(arr)) {
      res.status(400).json({ Error_msg: "Not a array", arr });
    }
    if (arr.length == 0)
      res.status(400).json({ Error_msg: "Empty array", arr });
    arr.forEach((element) => {
      if (isNaN(element))
        res
          .status(400)
          .json({ Error_msg: "Array elemens are not numbers", arr });
    });
    const Secret = data.Secret;
    if (Secret.length == 0)
      res.status(400).json({ Error_msg: "Secret is empty" });

    const { mean, median, mode, min, max } = getStats(arr);

    res.status(200).json({
      email,
      Secret,
      Array: arr,
      Size: arr.length,
      mean,
      median,
      mode,
      min,
      max,
    });
  }
  f1();
});

function generateRandomNumbers(length = 10, min = 1, max = 100) {
  return Array.from(
    { length },
    () => Math.floor(Math.random() * (max - min + 1)) + min
  );
}

function generateSecretMessage(length = 5) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function getStats(arr) {
  if (!Array.isArray(arr) || arr.length === 0) {
    throw new Error("Input must be a non-empty array");
  }

  // Validate all elements are numbers
  if (!arr.every((element) => typeof element === "number" && !isNaN(element))) {
    throw new Error("All array elements must be numbers");
  }

  const sorted = [...arr].sort((a, b) => a - b);

  // Calculate mean
  const sum = arr.reduce((acc, num) => acc + num, 0);
  const mean = sum / arr.length;

  // Calculate median (always rounded to 2 decimal places)
  const mid = Math.floor(sorted.length / 2);
  let median;
  if (sorted.length % 2 !== 0) {
    median = parseFloat(sorted[mid].toFixed(2));
  } else {
    median = parseFloat(((sorted[mid - 1] + sorted[mid]) / 2).toFixed(2));
  }

  // Calculate mode
  const frequency = {};
  let maxFreq = 0;

  sorted.forEach((num) => {
    frequency[num] = (frequency[num] || 0) + 1;
    if (frequency[num] > maxFreq) {
      maxFreq = frequency[num];
    }
  });

  const modes = Object.keys(frequency)
    .filter((num) => frequency[num] === maxFreq)
    .map(Number)
    .sort((a, b) => a - b);

  // Get min and max
  const min = sorted[0];
  const max = sorted[sorted.length - 1];

  return {
    mean: parseFloat(mean.toFixed(2)),
    median,
    mode: modes.length === arr.length ? [] : modes, // Return empty array if all values are unique
    min,
    max,
  };
}
