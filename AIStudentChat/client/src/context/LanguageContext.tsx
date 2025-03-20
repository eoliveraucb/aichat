import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";

type Language = "es" | "en";

interface Translations {
  [key: string]: string;
}

const spanishTranslations: Translations = {
  home: "Inicio",
  modules: "Módulos",
  chat: "AI Chat",
  resources: "Recursos",
  student: "Estudiante",
  basicAccount: "Cuenta Básica",
  platformTitle: "Plataforma de Aprendizaje AI",
  welcome: "Bienvenido a la Plataforma de Aprendizaje AI",
  welcomeDescription: "Aprende a utilizar la inteligencia artificial para mejorar tu aprendizaje y productividad.",
  progress: "Progreso general",
  learningModules: "Módulos de Aprendizaje",
  module1Title: "Módulo 1: Diseño Básico de Prompts",
  module1Subtitle: "Instrucciones en español, práctica en inglés",
  module2Title: "Módulo 2: Aplicaciones Prácticas",
  module2Subtitle: "Ejemplos del mundo real",
  notStarted: "No iniciado",
  inProgress: "En progreso",
  completed: "Completado",
  chatPractice: "Práctica con AI Chat",
  chatSubtitle: "Practica lo que has aprendido con nuestro asistente de AI",
  limitedUsage: "Uso limitado: Máximo 9 interacciones por comunidad",
  thinking: "Pensando",
  writeMessage: "Escribe tu mensaje aquí...",
  useAI: "Usar AI (OpenAI API)",
  remainingInteractions: "Interacciones restantes",
  resetInteractions: "Reiniciar interacciones",
  generateImage: "Generar imagen",
  viewFullImage: "Ver imagen en tamaño completo",
  imageGenerated: "He generado esta imagen para ti",
  imageError: "No pude generar la imagen",
  downloadableResources: "Recursos Descargables",
  resourcesSubtitle: "Materiales complementarios para tu aprendizaje",
  simpleRegistration: "Registro Simple",
  name: "Nombre",
  optionalEmail: "Correo Electrónico (opcional)",
  emailHint: "Solo necesario si deseas guardar tu progreso",
  simplePassword: "Contraseña Simple",
  passwordHint: "Usa una contraseña sencilla que puedas recordar",
  acceptTerms: "Acepto los términos y condiciones",
  registerAndStart: "Registrarse e Iniciar",
  continueAsGuest: "Continuar como Invitado",
  usernameTooShort: "El nombre debe tener al menos 2 caracteres",
  invalidEmail: "El correo electrónico no es válido",
  passwordTooShort: "La contraseña debe tener al menos 4 caracteres",
  mustAcceptTerms: "Debes aceptar los términos y condiciones",
  registrationSuccess: "Registro exitoso",
  welcomeMessage: "¡Bienvenido a la plataforma de aprendizaje AI!",
  registrationError: "Error en el registro",
  tryAgain: "Por favor, intenta de nuevo",
  guest: "Invitado",
  submitting: "Enviando...",
  chatWelcomeMessage: "¡Hola! Soy tu asistente de aprendizaje. ¿En qué puedo ayudarte hoy?",
  chatError: "Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta de nuevo.",
  continueLabel: "Continuar aprendiendo"
};

const englishTranslations: Translations = {
  home: "Home",
  modules: "Modules",
  chat: "AI Chat",
  resources: "Resources",
  student: "Student",
  basicAccount: "Basic Account",
  platformTitle: "AI Learning Platform",
  welcome: "Welcome to the AI Learning Platform",
  welcomeDescription: "Learn to use artificial intelligence to improve your learning and productivity.",
  progress: "Overall progress",
  learningModules: "Learning Modules",
  module1Title: "Module 1: Basic Prompt Design",
  module1Subtitle: "Spanish instructions, English practice",
  module2Title: "Module 2: Practical Applications",
  module2Subtitle: "Real-world examples",
  notStarted: "Not started",
  inProgress: "In progress",
  completed: "Completed",
  chatPractice: "AI Chat Practice",
  chatSubtitle: "Practice what you've learned with our AI assistant",
  limitedUsage: "Limited use: Maximum 9 interactions per community",
  thinking: "Thinking",
  writeMessage: "Write your message here...",
  useAI: "Use AI (OpenAI API)",
  remainingInteractions: "Remaining interactions",
  resetInteractions: "Reset interactions",
  generateImage: "Generate image",
  viewFullImage: "View full-size image",
  imageGenerated: "I've generated this image for you",
  imageError: "Couldn't generate the image",
  downloadableResources: "Downloadable Resources",
  resourcesSubtitle: "Supplementary materials for your learning",
  simpleRegistration: "Simple Registration",
  name: "Name",
  optionalEmail: "Email (optional)",
  emailHint: "Only needed if you want to save your progress",
  simplePassword: "Simple Password",
  passwordHint: "Use a simple password you can remember",
  acceptTerms: "I accept the terms and conditions",
  registerAndStart: "Register & Start",
  continueAsGuest: "Continue as Guest",
  usernameTooShort: "Name must be at least 2 characters",
  invalidEmail: "Email is not valid",
  passwordTooShort: "Password must be at least 4 characters",
  mustAcceptTerms: "You must accept the terms and conditions",
  registrationSuccess: "Registration successful",
  welcomeMessage: "Welcome to the AI learning platform!",
  registrationError: "Registration error",
  tryAgain: "Please try again",
  guest: "Guest",
  submitting: "Submitting...",
  chatWelcomeMessage: "Hello! I'm your learning assistant. How can I help you today?",
  chatError: "Sorry, there was an error processing your message. Please try again.",
  continueLabel: "Continue learning"
};

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  translations: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useLocalStorage<Language>("language", "es");
  const [translations, setTranslations] = useState<Translations>(
    language === "es" ? spanishTranslations : englishTranslations
  );

  useEffect(() => {
    setTranslations(language === "es" ? spanishTranslations : englishTranslations);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(language === "es" ? "en" : "es");
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, translations }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
