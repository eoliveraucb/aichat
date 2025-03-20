import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RegistrationModal({ isOpen, onClose }: RegistrationModalProps) {
  const { login } = useAuth();
  const { translations } = useLanguage();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formSchema = z.object({
    username: z.string().min(2, translations.usernameTooShort),
    email: z.string().email(translations.invalidEmail).optional().or(z.literal('')),
    password: z.string().min(4, translations.passwordTooShort),
    acceptTerms: z.boolean().refine(val => val === true, {
      message: translations.mustAcceptTerms,
    }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      acceptTerms: false,
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      const response = await apiRequest('POST', '/api/auth/register', {
        username: data.username,
        password: data.password,
      });
      
      const userData = await response.json();
      login(userData);
      toast({
        title: translations.registrationSuccess,
        description: translations.welcomeMessage,
      });
      onClose();
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: translations.registrationError,
        description: translations.tryAgain,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const continueAsGuest = () => {
    login({ id: 0, username: translations.guest });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">{translations.simpleRegistration}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="username">{translations.name}</Label>
            <Input
              id="username"
              {...form.register("username")}
              className="w-full mt-1"
            />
            {form.formState.errors.username && (
              <p className="text-xs text-red-500 mt-1">{form.formState.errors.username.message}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="email">{translations.optionalEmail}</Label>
            <Input
              id="email"
              type="email"
              {...form.register("email")}
              className="w-full mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">{translations.emailHint}</p>
            {form.formState.errors.email && (
              <p className="text-xs text-red-500 mt-1">{form.formState.errors.email.message}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="password">{translations.simplePassword}</Label>
            <Input
              id="password"
              type="password"
              {...form.register("password")}
              className="w-full mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">{translations.passwordHint}</p>
            {form.formState.errors.password && (
              <p className="text-xs text-red-500 mt-1">{form.formState.errors.password.message}</p>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="terms" 
              {...form.register("acceptTerms")} 
            />
            <Label htmlFor="terms" className="text-sm text-gray-700">
              {translations.acceptTerms}
            </Label>
          </div>
          {form.formState.errors.acceptTerms && (
            <p className="text-xs text-red-500">{form.formState.errors.acceptTerms.message}</p>
          )}
          
          <DialogFooter className="mt-6">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? translations.submitting : translations.registerAndStart}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              className="w-full mt-2" 
              onClick={continueAsGuest}
            >
              {translations.continueAsGuest}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
