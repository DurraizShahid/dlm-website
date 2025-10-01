"use client";

import { useLanguage } from "@/i18n/LanguageContext";

export const MadeWithDyad = () => {
  const { translate } = useLanguage();

  return (
    <div className="p-4 text-center">
      <a
        href="https://www.dyad.sh/"
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      >
        {translate("Made by MM Studios")}
      </a>
    </div>
  );
};