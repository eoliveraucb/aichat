import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";

export function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage();
  
  return (
    <Button 
      variant="outline" 
      size="sm" 
      className="text-sm px-3 py-1 rounded border border-gray-300 hover:bg-gray-50"
      onClick={toggleLanguage}
    >
      <i className="fas fa-language mr-1"></i> {language === 'es' ? 'ES | EN' : 'EN | ES'}
    </Button>
  );
}
