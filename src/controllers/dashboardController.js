import { getDashboardData } from "../services/dashboardService.js";

export const getDashboard = async (req, res, next) => {
  try {
    console.log("✅ DASHBOARD API HIT");

    const userId = req.userId; // Get user ID from authenticated request
    const data = await getDashboardData(userId);

    // 🔥 handle undefined / null / empty object
    if (!data || (typeof data === "object" && Object.keys(data).length === 0)) {
      return res.status(404).json({
        success: false,
        message: "Dashboard data not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Dashboard data fetched successfully",
      data,
    });

  } catch (err) {
    console.error("❌ Dashboard Error:", err);

    // 🔥 jangan return dua kali (hindari unreachable code)
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err?.message || "Unknown error",
    });

    // optional: kalau pakai global error handler
    // next(err);
  }
};