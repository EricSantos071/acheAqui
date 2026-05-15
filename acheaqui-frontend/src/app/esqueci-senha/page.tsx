"use client";

export default function EsqueciSenhaPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-card border border-border rounded-2xl p-8 text-center">
        <div className="text-4xl mb-4">🔑</div>
        <h1 className="text-xl font-semibold text-foreground mb-2">
          Esqueceu sua senha?
        </h1>
        <p className="text-muted-foreground text-sm mb-6">
          Entre em contato com nosso suporte informando seu e-mail 
          cadastrado e redefiniremos sua senha.
        </p>
        
        <a
            href="mailto:suporte@acheaqui.com"
            aria-label="Contatar suporte por e-mail"
            className="w-full h-10 px-6 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity inline-flex items-center justify-center gap-2">
            📧 Contatar suporte
        </a>
      </div>
    </div>
  );
}