export default function CourseCard({ props }) {
  const courses = props;
  return (
    <>
      {courses.map((course,id) => (
        <div
          key={id}
          className="max-w-sm rounded-2xl overflow-hidden shadow-lg border bg-white hover:shadow-2xl transition duration-300 hover:-translate-y-1"
        >
          {/* Image */}
          <div className="relative">
            <img
              className="w-full h-48 object-cover"
              src={course.image}
              alt={course.title}
            />
            <span className="absolute top-3 left-3 bg-indigo-600 text-white text-xs px-3 py-1 rounded-full">
              {course.badge}
            </span>
          </div>

          {/* Content */}
          <div className="p-5 space-y-3">
            <h3 className="text-xl font-semibold hover:text-indigo-600 transition">
              {course.title}
            </h3>

            <p className="text-gray-500 text-sm">{course.description}</p>

            {/* Rating & Students */}
            <div className="flex justify-between text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <i className="ri-star-fill text-yellow-500"></i>
                <span>
                  {course.rating} ({course.reviews})
                </span>
              </div>
              <div className="flex items-center gap-1">
                <i className="ri-group-line"></i>
                <span>{course.students} Students</span>
              </div>
            </div>

            {/* Duration */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <i className="ri-time-line"></i>
              <span>{course.duration}</span>
            </div>

            {/* Price */}
            <div className="flex justify-between items-center pt-3">
              <div>
                <span className="text-2xl font-bold text-indigo-600">
                  ${course.price}
                </span>
                <span className="text-sm text-gray-400 line-through ml-2">
                  ${course.originalPrice}
                </span>
              </div>
              <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">
                <i className="ri-shopping-cart-line mr-1"></i>
                Enroll
              </button>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
