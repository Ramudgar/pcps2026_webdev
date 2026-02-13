// src/pages/HomeContent.jsx
import { RiDashboardLine, RiTeamLine, RiSettings3Line } from "react-icons/ri";

const features = [
  {
    icon: <RiDashboardLine className="text-indigo-600 w-10 h-10" />,
    title: "Dashboard Overview",
    description: "Quickly view site analytics, recent activity, and CMS stats at a glance.",
  },
  {
    icon: <RiTeamLine className="text-indigo-600 w-10 h-10" />,
    title: "User Management",
    description: "Manage users, roles, and permissions easily with intuitive controls.",
  },
  {
    icon: <RiSettings3Line className="text-indigo-600 w-10 h-10" />,
    title: "Custom Settings",
    description: "Configure your CMS preferences, workflow, and notifications.",
  },
];

const HomeContent = () => {
  return (
    <main className="bg-indigo-50 min-h-screen flex flex-col justify-center items-center px-4 py-16">
      {/* Hero Section */}
      <section className="flex flex-col md:flex-row items-center max-w-6xl w-full mb-16">
        <div className="md:w-1/2 text-center md:text-left mb-8 md:mb-0">
          <h1 className="text-4xl md:text-5xl font-bold text-indigo-700 mb-4">
            Manage Your Content Effortlessly
          </h1>
          <p className="text-gray-700 mb-6">
            ecuCMS helps you streamline workflow, monitor content, and manage users seamlessly.
          </p>
          <div className="flex justify-center md:justify-start gap-4">
            <button className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition">
              Get Started
            </button>
            <button className="bg-white border border-indigo-600 text-indigo-600 px-6 py-3 rounded-lg hover:bg-indigo-100 transition">
              Learn More
            </button>
          </div>
        </div>
        <div className="md:w-1/2 flex justify-center">
          <img
            src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
            alt="CMS Illustration"
            className="w-80 md:w-96"
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-6xl w-full text-center">
        <h2 className="text-3xl font-bold text-indigo-700 mb-12">Features</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition"
            >
              <div className="mb-4 flex justify-center">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
};

export default HomeContent;
