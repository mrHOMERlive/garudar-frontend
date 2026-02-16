import React from 'react';
import { Button } from "@/components/ui/button";
import { Globe } from 'lucide-react';
import { getLanguage, setLanguage } from '@/components/utils/language';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function LanguageSwitcher({ variant = "default" }) {
  const currentLang = getLanguage();
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={variant} 
          size="sm"
          className={variant === "ghost" ? "text-white hover:bg-white/10" : ""}
        >
          <Globe className="w-4 h-4 mr-2" />
          {currentLang === 'en' ? 'EN' : 'ID'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setLanguage('en')} className={currentLang === 'en' ? 'bg-slate-100' : ''}>
          English
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLanguage('id')} className={currentLang === 'id' ? 'bg-slate-100' : ''}>
          Bahasa Indonesia
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}