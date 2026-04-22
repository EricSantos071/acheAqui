"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { register, registerEntrepreneur, login, getMe } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

interface Step1Data {
  first_name: string;
  last_name: string;
  doc_cpf: string;
  email: string;
  client_phone: string;
  birthdate: string;
  password: string;
  confirm_password: string;
}

interface Step2Data {
  doc_cnpj: string;
  phone: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const { loginSuccess } = useAuth();

  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<Step1Data>({
    first_name: "", last_name: "", doc_cpf: "",
    email: "", client_phone: "", birthdate: "",
    password: "", confirm_password: "",
  });

  const [entrepreneurForm, setEntrepreneurForm] = useState<Step2Data>({
    doc_cnpj: "", phone: "",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleStep1(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (form.password !== form.confirm_password) {
      setError("As senhas não coincidem.");
      return;
    }
    if (form.password.length < 8) {
      setError("A senha deve ter pelo menos 8 caracteres.");
      return;
    }

    setLoading(true);
    try {
      // 1. Register
      await register({
        first_name: form.first_name,
        last_name: form.last_name,
        doc_cpf: form.doc_cpf,
        email: form.email,
        client_phone: form.client_phone,
        birthdate: form.birthdate,
        password: form.password,
      });

      // 2. Auto-login
      const loginData = await login(form.email, form.password);
      const me = await getMe(loginData.access_token);

      // 3. Update global auth state — Navbar updates immediately
      loginSuccess(loginData.access_token, {
        clients_id: me.clients_id,
        first_name: me.first_name,
        last_name: me.last_name,
        email: me.email,
        is_entrepreneur: false,
        entrepreneur_id: null,
      });

      // 4. Move to step 2
      setStep(2);

    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao cadastrar.");
    } finally {
      setLoading(false);
    }
  }

  async function handleStep2(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await registerEntrepreneur({
        doc_cnpj: entrepreneurForm.doc_cnpj,
        phone: entrepreneurForm.phone,
      });

      const me = await getMe();
      loginSuccess("", {
        clients_id: me.clients_id,
        first_name: me.first_name,
        last_name: me.last_name,
        email: me.email,
        is_entrepreneur: true,
        entrepreneur_id: me.entrepreneur_id,
      });

      router.push("/dashboard");

    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao cadastrar negócio.");
    } finally {
      setLoading(false);
    }
  }

  function skipEntrepreneur() {
    router.push("/products");
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${step >= 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
              1
            </div>
            <span className="text-sm text-muted-foreground hidden sm:block">Dados pessoais</span>
          </div>
          <div className="w-8 h-px bg-border" />
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${step === 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
              2
            </div>
            <span className="text-sm text-muted-foreground hidden sm:block">Seu negócio</span>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">

          {/* ── STEP 1 ── */}
          {step === 1 && (
            <>
              <div className="text-center mb-6">
                <h1 className="text-2xl font-semibold text-foreground mb-1">Criar conta</h1>
                <p className="text-muted-foreground text-sm">É rápido e gratuito</p>
              </div>

              <form onSubmit={handleStep1} className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="first_name" className="text-sm font-medium text-foreground">Nome</label>
                    <input id="first_name" name="first_name" type="text" value={form.first_name} onChange={handleChange} placeholder="Maria" required className="h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="last_name" className="text-sm font-medium text-foreground">Sobrenome</label>
                    <input id="last_name" name="last_name" type="text" value={form.last_name} onChange={handleChange} placeholder="Silva" required className="h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="doc_cpf" className="text-sm font-medium text-foreground">CPF</label>
                  <input id="doc_cpf" name="doc_cpf" type="text" value={form.doc_cpf} onChange={handleChange} placeholder="000.000.000-00" required maxLength={14} className="h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="email" className="text-sm font-medium text-foreground">E-mail</label>
                  <input id="email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="voce@email.com" required autoComplete="email" className="h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="client_phone" className="text-sm font-medium text-foreground">Telefone</label>
                  <input id="client_phone" name="client_phone" type="tel" value={form.client_phone} onChange={handleChange} placeholder="(48) 99999-9999" required className="h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="birthdate" className="text-sm font-medium text-foreground">Data de nascimento</label>
                  <input id="birthdate" name="birthdate" type="date" value={form.birthdate} onChange={handleChange} required className="h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="password" className="text-sm font-medium text-foreground">Senha</label>
                  <input id="password" name="password" type="password" value={form.password} onChange={handleChange} placeholder="Mínimo 8 caracteres" required autoComplete="new-password" className="h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="confirm_password" className="text-sm font-medium text-foreground">Confirmar senha</label>
                  <input id="confirm_password" name="confirm_password" type="password" value={form.confirm_password} onChange={handleChange} placeholder="Repita a senha" required autoComplete="new-password" className="h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>

                {error && (
                  <div className="bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-3">
                    <p className="text-destructive text-sm">{error}</p>
                  </div>
                )}

                <button type="submit" disabled={loading} className="h-10 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed mt-2">
                  {loading ? "Cadastrando..." : "Criar conta →"}
                </button>
              </form>

              <p className="text-center text-sm text-muted-foreground mt-6">
                Já tem conta?{" "}
                <Link href="/login" className="text-primary font-medium hover:underline">Entrar</Link>
              </p>
            </>
          )}

          {/* ── STEP 2 ── */}
          {step === 2 && (
            <>
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold text-foreground mb-1">Conta criada!</h2>
                <p className="text-muted-foreground text-sm">Quer vender seus produtos no AcheAqui?</p>
              </div>

              <form onSubmit={handleStep2} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="doc_cnpj" className="text-sm font-medium text-foreground">CNPJ</label>
                  <input id="doc_cnpj" type="text" value={entrepreneurForm.doc_cnpj} onChange={(e) => setEntrepreneurForm((prev) => ({ ...prev, doc_cnpj: e.target.value }))} placeholder="00.000.000/0001-00" required maxLength={18} className="h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="biz_phone" className="text-sm font-medium text-foreground">Telefone do negócio</label>
                  <input id="biz_phone" type="tel" value={entrepreneurForm.phone} onChange={(e) => setEntrepreneurForm((prev) => ({ ...prev, phone: e.target.value }))} placeholder="(48) 99999-9999" required className="h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>

                {error && (
                  <div className="bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-3">
                    <p className="text-destructive text-sm">{error}</p>
                  </div>
                )}

                <button type="submit" disabled={loading} className="h-10 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed mt-2">
                  {loading ? "Cadastrando negócio..." : "Cadastrar meu negócio →"}
                </button>
              </form>

              <button onClick={skipEntrepreneur} className="w-full mt-3 h-10 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                Agora não — quero só comprar
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}