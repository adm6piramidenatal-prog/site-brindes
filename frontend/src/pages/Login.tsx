import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { toast, Toaster } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/api";
import { loginUser } from "@/lib/auth";
import { beginSession } from "@/lib/session";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const loginMutation = useMutation({
    mutationFn: loginUser,
    onSuccess: () => {
      beginSession();
      toast.success("Acesso liberado.");
      navigate("/");
    },
    onError: (error) => {
      const message = error instanceof ApiError && error.status === 401
        ? "E-mail ou senha inválidos."
        : "Não foi possível entrar agora.";
      toast.error(message);
    },
  });

  return (
    <main className="login-page" data-testid="login-page">
      <Toaster richColors />
      <section className="login-story" data-testid="login-brand-panel">
        <div className="login-brand" data-testid="login-brand"><img src="/brand/five-logo.webp" alt="Símbolo da FIVE" data-testid="login-brand-logo" /><span><strong>FIVE</strong><small>Intermediadora de Vendas</small></span></div>
        <div className="login-story-copy" data-testid="login-story-copy">
          <p className="section-kicker" data-testid="login-kicker">Central de experiências</p>
          <h1 data-testid="login-title">Presentes bem emitidos.<br /><em>Memórias bem guardadas.</em></h1>
          <p data-testid="login-description">Personalize, confira e imprima os brindes oficiais da FIVE Intermediadora de Vendas em poucos minutos.</p>
        </div>
        <div className="login-trust" data-testid="login-trust"><ShieldCheck size={18} /><span>Sessão protegida<br /><small>Acesso exclusivo para emissores</small></span></div>
      </section>

      <section className="login-form-side" data-testid="login-form-panel">
        <form
          className="login-card"
          onSubmit={(event) => {
            event.preventDefault();
            loginMutation.mutate({ email, password });
          }}
          data-testid="login-form"
        >
          <p className="section-kicker" data-testid="login-form-kicker">Área do emissor</p>
          <h2 data-testid="login-form-title">Bem-vindo de volta</h2>
          <p className="login-help" data-testid="login-form-description">Insira os seus dados de acesso para entrar no sistema.</p>

          <div className="field-group">
            <Label htmlFor="login-email" data-testid="login-email-label">E-mail</Label>
            <Input id="login-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" data-testid="login-email-input" />
          </div>
          <div className="field-group">
            <Label htmlFor="login-password" data-testid="login-password-label">Senha</Label>
            <div className="password-field">
              <Input id="login-password" type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" data-testid="login-password-input" />
              <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"} data-testid="login-password-visibility-button">
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>
          <Button type="submit" className="primary-action" disabled={loginMutation.isPending} data-testid="login-submit-button">
            {loginMutation.isPending ? "Entrando..." : "Entrar no sistema"}<ArrowRight size={17} />
          </Button>
        </form>
      </section>
    </main>
  );
}
