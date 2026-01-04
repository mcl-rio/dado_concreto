import { Mail } from "lucide-react";

/**
 * Componente de contato global para feedback
 * Exibe um link discreto para enviar email à coordenação
 * Deve ser incluído em todas as páginas principais
 */
export function FeedbackContact() {
  const email = "marlos.lima@fgv.br";
  const subject = encodeURIComponent("Conselho IA – feedback do usuário");
  const body = encodeURIComponent(
    "Descreva aqui o problema ou sugestão:\n\n\n\n---\nEnviado através do Conselho IA de Geopolítica da FGV"
  );
  
  const mailtoLink = `mailto:${email}?subject=${subject}&body=${body}`;

  return (
    <div className="w-full py-3 px-4 bg-[var(--fgv-primary-1)]/5 border-t border-[var(--fgv-primary-1)]/10">
      <div className="container max-w-7xl mx-auto flex items-center justify-center gap-2 text-sm text-[var(--fgv-secondary-2)]">
        <Mail className="w-4 h-4 flex-shrink-0" />
        <span>
          Encontrou algum problema ou tem sugestão?{" "}
          <a
            href={mailtoLink}
            className="text-[var(--fgv-primary-3)] hover:text-[var(--fgv-primary-4)] underline underline-offset-2 transition-colors"
          >
            Envie um e-mail para a coordenação
          </a>
          .
        </span>
      </div>
    </div>
  );
}

export default FeedbackContact;
