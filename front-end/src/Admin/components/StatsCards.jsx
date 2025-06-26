import { motion } from "framer-motion";
export default function StatsCards({
  title,
  value,
  description,
  change,
  icon,
  isNegative = false,
}) {
  return (
    <motion.div
      whileHover={{
        y: -3,
        transition: { duration: 0.3 },
        boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.3)",
      }}
    >
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-700">{title}</h2>
          <div className="p-2 rounded-full bg-gray-50">{icon}</div>
        </div>

        <div className="space-y-2">
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm text-gray-600">{description}</p>
          <p
            className={`text-sm ${
              change === 'New'
                ? "text-blue-600"
                : isNegative
                  ? "text-red-600"
                  : "text-green-600"
            } font-medium`}
          >
            {change === 'New'
              ? "New activity"
              : `${change} from earlier period`}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
