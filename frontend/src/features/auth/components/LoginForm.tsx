import * as React from "react";
import { useState } from "react";
import { Mail, Lock, LogIn, CircleAlert, } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface LoginFormProps {
  onSubmit: (email: string, password: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

function LoginForm({ onSubmit, isLoading, error }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await onSubmit(email, password);
  };

  return (
    <Card className="w-full shadow-2xl overflow-hidden gap-0 pt-0">
      <CardHeader className="bg-primary text-center p-6">
        <CardTitle className="text-primary-foreground flex items-center justify-center gap-2 text-xl">
          Système de Réservation de Parking
        </CardTitle>
        <CardDescription className="text-primary-foreground">
           Connectez-vous pour accéder à votre espace
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-8 pb-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">Adresse e-mail</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="votre@email.com"
                className="pl-9"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="pl-9"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm font-medium">
              <CircleAlert className="size-4 shrink-0" />
              {error}
            </div>
          )}

          <Button type="submit" disabled={isLoading} className="w-full" size="lg">
            {isLoading ? (
              <>
                <div className="size-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Connexion...
              </>
            ) : (
              <>
                <LogIn />
                Se connecter
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default LoginForm;
