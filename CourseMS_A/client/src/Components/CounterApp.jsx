import { useState } from "react";
export default function CounterApp() {
  const [count, setCount] = useState(0);

  function increment() {
    setCount(count + 1);
  }

  function decrement() {
    setCount(count - 1);
  }

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 to-indigo-600">
        <div className="bg-white shadow-2xl rounded-2xl p-8 w-80 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Counter App</h2>

          <p className="text-4xl font-semibold text-blue-600 mb-6">{count}</p>

          <div className="flex justify-center gap-4">
            <button onClick={increment} className="px-5 py-2 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600 transition duration-300">
              Increment
            </button>

            <button onClick={decrement} className="px-5 py-2 bg-red-500 text-white rounded-lg shadow-md hover:bg-red-600 transition duration-300">
              Decrement
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
