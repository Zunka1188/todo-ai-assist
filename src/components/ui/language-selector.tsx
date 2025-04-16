
import React from "react";
import { Check, Globe } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface LanguageSelectorProps {
  variant?: "default" | "compact";
  className?: string;
  icon?: React.ReactNode;
}

export function LanguageSelector({ 
  variant = "default", 
  className,
  icon 
}: LanguageSelectorProps) {
  const { language, setLanguage, languageList } = useLanguage();
  const { t } = useTranslation();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size={variant === "compact" ? "icon" : "default"}
          className={cn(
            "gap-1 px-2",
            variant === "compact" ? "h-9 w-9" : "",
            className
          )}
          aria-label={t("settings.language")}
        >
          {variant === "compact" ? (
            icon || <Globe className="h-4 w-4" />
          ) : (
            <>
              {icon || <Globe className="h-4 w-4" />}
              <span className="hidden sm:inline-block capitalize">
                {languageList[language].label}
              </span>
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{t("settings.language")}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {Object.entries(languageList).map(([code, { label }]) => (
          <DropdownMenuItem
            key={code}
            className="flex items-center justify-between cursor-pointer"
            onClick={() => setLanguage(code as keyof typeof languageList)}
          >
            <span>{label}</span>
            {language === code && <Check className="h-4 w-4 ml-2" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
