const userService = require("../services/user.service");
const store = require("../data/store");

const getAllUsers = (req, res) => {
  const users = userService.getAllUsers();
  res.status(200).json(users);
};

const getUserById = (req, res) => {
  const users = store.users;
  const user = users.find((user) => user.id === req.params.id);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  res.status(200).json(user);
};

const createUser = (req, res) => {
  // const { name, email } = req.body;
  const name=req.body.name;
  const email=req.body.email;

  // Basic validation
  if (!name || !email) {
    return res.status(400).json({ error: "Name and email are required" });
  }

  const newUser = userService.createUser({ name, email });
  res.status(201).json(newUser);
};

const updateUser = (req, res) => {
  const { name, email } = req.body;

  const updatedUser = userService.updateUser(req.params.id, { name, email });

  if (!updatedUser) {
    return res.status(404).json({ error: "User not found" });
  }

  res.status(200).json(updatedUser);
};

const deleteUser = (req, res) => {
  const success = userService.deleteUser(req.params.id);

  if (!success) {
    return res.status(404).json({ error: "User not found" });
  }

  // 200 OK with a message or 204 No Content
  res.status(200).json({ message: "User deleted successfully" });
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
