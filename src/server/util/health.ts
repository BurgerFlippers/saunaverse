export function calculateCalorieUsage(heartRate: number, durationMs: number) {
  const durationMinutes = durationMs / (1000 * 60);

  // Derived Keytel Formula for Average Human (75kg, 35yo)
  const calories = durationMinutes * (0.129 * heartRate - 7.2);

  // Return 0 if calculation goes negative (e.g. extremely low HR or bad data)
  return Math.max(0, calories);
}
