function fetchData(callbacks) {
  setTimeout(() => {
    callbacks();
  }, 1000);
}
const data = { id: 1, name: "John Doe" };
fetchData(returnData(data));

function returnData(data) {
  console.log("Data received:", data);
}

const person = {
  name: "Alice",
  age: 30,
  greet: function (message) {
    console.log(message + ", " + this.name);
  },
};

console.log(person.name);
console.log(person.age);
person.greet("Hello");

function college(callback) {
  setTimeout(() => {
    const message = "Tomorrow is holiday";
    console.log(message);
    callback(message);
  }, 1000);
}

function collegeMember(message) {
  console.log("College member notified:", message);
}

college(collegeMember);
