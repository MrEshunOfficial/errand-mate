"use client";

import { useAdminActivities } from "@/hooks/admin/useAdminActivities";
import { AdminActivity } from "@/hooks/admin/useAdminContext";

export function AdminActivities() {
  const { activities, loading, error, refetch } = useAdminActivities(100);

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleString();
  };

  const getActivityIcon = (action: string) => {
    switch (action) {
      case "user_promoted":
        return "⬆️";
      case "user_demoted":
        return "⬇️";
      case "invitation_sent":
        return "📧";
      case "invitation_revoked":
        return "❌";
      case "user_registered":
        return "👤";
      case "role_updated":
        return "🔄";
      case "user_created":
        return "✨";
      default:
        return "📝";
    }
  };

  const getActivityColor = (action: string) => {
    switch (action) {
      case "user_promoted":
        return "text-green-600 dark:text-green-400";
      case "user_demoted":
        return "text-red-600 dark:text-red-400";
      case "invitation_sent":
        return "text-blue-600 dark:text-blue-400";
      case "invitation_revoked":
        return "text-orange-600 dark:text-orange-400";
      case "user_registered":
      case "user_created":
        return "text-purple-600 dark:text-purple-400";
      case "role_updated":
        return "text-indigo-600 dark:text-indigo-400";
      default:
        return "text-gray-600 dark:text-gray-300";
    }
  };

  const formatActivityDescription = (activity: AdminActivity): string => {
    const { action, targetEmail, role } = activity;

    switch (action) {
      case "user_promoted":
        return `User ${targetEmail} promoted to ${role}`;
      case "user_demoted":
        return `User ${targetEmail} demoted from ${role}`;
      case "invitation_sent":
        return `Invitation sent to ${targetEmail} for ${role} role`;
      case "invitation_revoked":
        return `Invitation revoked for ${targetEmail}`;
      case "user_registered":
        return `User ${targetEmail} registered`;
      case "role_updated":
        return `User ${targetEmail} role updated to ${role}`;
      case "user_created":
        return `User ${targetEmail} created`;
      default:
        return `${action} performed`;
    }
  };

  const getPerformedBy = (activity: AdminActivity): string => {
    if (activity.adminEmail) return activity.adminEmail;
    if (activity.invitedBy) return activity.invitedBy;
    return "System";
  };

  return (
    <div className="p-6 text-gray-900 dark:text-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Activities</h1>
        <button
          onClick={refetch}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
        >
          Refresh
        </button>
      </div>

      {loading && <div className="p-6">Loading activities...</div>}
      {error && (
        <div className="p-6 text-red-600 dark:text-red-400">Error: {error}</div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {activities.map((activity, index) => (
            <div
              key={activity._id || index}
              className="p-4 flex items-start gap-4"
            >
              <div className="text-2xl">{getActivityIcon(activity.action)}</div>
              <div className="flex-1">
                <div
                  className={`font-medium ${getActivityColor(activity.action)}`}
                >
                  {formatActivityDescription(activity)}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  By: {getPerformedBy(activity)} •{" "}
                  {formatDate(activity.timestamp)}
                  {activity.ipAddress && ` • IP: ${activity.ipAddress}`}
                </div>
                {activity.details && (
                  <div className="text-sm text-gray-600 dark:text-gray-300 mt-1 bg-gray-50 dark:bg-gray-700 p-2 rounded">
                    <strong>Details:</strong> {activity.details}
                  </div>
                )}
              </div>
            </div>
          ))}

          {!loading && activities.length === 0 && (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              No activities found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
