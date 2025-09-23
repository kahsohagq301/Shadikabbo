import { useQuery } from "@tanstack/react-query";
import type { Setting } from "@shared/schema";

type SettingsData = Record<string, Setting[]>;

export function useSettings() {
  const { data: settings, isLoading, error } = useQuery({
    queryKey: ["/api/settings"],
  });

  // Helper function to get options for a specific category
  const getOptionsByCategory = (category: string): Setting[] => {
    if (!settings || !(settings as SettingsData)[category]) {
      return [];
    }
    return (settings as SettingsData)[category].sort(
      (a: Setting, b: Setting) => (a.displayOrder || 0) - (b.displayOrder || 0)
    );
  };

  // Helper function to get just the values for a category (useful for forms)
  const getValuesByCategory = (category: string): string[] => {
    return getOptionsByCategory(category).map((setting: Setting) => setting.value);
  };

  return {
    settings,
    isLoading,
    error,
    getOptionsByCategory,
    getValuesByCategory,
  };
}