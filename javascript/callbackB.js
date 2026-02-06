function clzAdmin(clzMember) {
  let message = "Tomorrow is holiday";

  setTimeout(() => {
    clzMember(message);
  }, 2000);
  console.log("Admin is calling the member");
}

function clzMember(message) {
  console.log(message);
}

clzAdmin(clzMember);

// promise best example
function fetchData() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const data = {
        id: 1,
        name: "John Doe",
        email: "john.doe@example.com",
      };
      resolve(data);
    }, 2000);
  });
}

fetchData()
  .then((resolveData) => {
    console.log("Data fetched:", resolveData);
  })
  .catch((error) => {
    console.error("Error fetching data:", error);
  });
