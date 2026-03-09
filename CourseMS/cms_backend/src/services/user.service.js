const store = require("../data/store");
const { v4: uuidv4 } = require("uuid");

const getAllUsers = () => {
  return store.users;
};

const getUserById = (id) => {
  return store.users.find((user) => {
    return user.id === id;
  });
};

const createUser = (data) => {
  const newUser = {
    id: uuidv4(),
    name: data.name,
    email: data.email,
    createdAt: new Date().toISOString(),
  };
  store.users.push(newUser);
  return newUser;
};

const updateUser = (id, data) => {
  const index = store.users.findIndex((user) => user.id === id);
  if (index === -1) {
    return null;
  }

  const updatedUser = {
    ...store.users[index],
    name: data.name || store.users[index].name,
    email: data.email || store.users[index].email,
  };

  store.users[index] = updatedUser;
  return updatedUser;
};

const deleteUser = (id) => {
  const index = store.users.findIndex((user) => user.id === id);
  if (index === -1) {
    return false;
  }

  store.users.splice(index, 1);
  return true;
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
