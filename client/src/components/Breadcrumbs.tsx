import { ChevronRight, Home } from "lucide-react";
import { Link } from "wouter";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  const handleHomeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    window.location.href = '/';
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
  };

  return (
    <div className="bg-white border-b border-[var(--fgv-secondary-4)]">
      <div className="container mx-auto px-4 py-3">
        <nav className="flex items-center gap-2 text-sm" aria-label="Breadcrumb">
          <a href="/" onClick={handleHomeClick} className="text-[var(--fgv-primary-2)] hover:underline flex items-center gap-1">
            <Home className="h-4 w-4" />
            <span>Início</span>
          </a>
          {items.map((item, index) => (
            <span key={index} className="flex items-center gap-2">
              <ChevronRight className="h-4 w-4 text-[var(--fgv-secondary-3)]" />
              {item.href ? (
                <Link href={item.href} className="text-[var(--fgv-primary-2)] hover:underline">
                  {item.label}
                </Link>
              ) : (
                <span className="text-[var(--fgv-secondary-1)] font-medium">
                  {item.label}
                </span>
              )}
            </span>
          ))}
        </nav>
      </div>
    </div>
  );
}
