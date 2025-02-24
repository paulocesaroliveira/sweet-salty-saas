
import { Link } from "react-router-dom";
import { 
  Package, 
  Calculator, 
  LineChart, 
  Store, 
  Calendar,
  ChevronRight,
  CheckCircle,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const Index = () => {
  const benefits = [
    {
      icon: Package,
      title: "Controle de Estoque",
      description: "Nunca mais fique sem ingredientes. Gerencie seu estoque de forma inteligente."
    },
    {
      icon: Calculator,
      title: "Precificação Inteligente",
      description: "Saiba exatamente quanto custa cada produto e defina preços lucrativos."
    },
    {
      icon: LineChart,
      title: "Relatórios Detalhados",
      description: "Acompanhe vendas, lucros e tendências em tempo real."
    },
    {
      icon: Store,
      title: "Loja Online Personalizada",
      description: "Tenha sua própria loja virtual sem taxas de marketplace."
    },
    {
      icon: Calendar,
      title: "Agenda de Entregas",
      description: "Organize seus pedidos e entregas sem estresse."
    }
  ];

  const steps = [
    {
      number: "01",
      title: "Crie sua conta gratuita",
      description: "Comece com 7 dias grátis, sem compromisso"
    },
    {
      number: "02",
      title: "Cadastre seus produtos",
      description: "Adicione suas receitas e precifique automaticamente"
    },
    {
      number: "03",
      title: "Configure sua loja",
      description: "Personalize sua loja online em minutos"
    },
    {
      number: "04",
      title: "Comece a vender",
      description: "Receba pedidos e acompanhe seus lucros"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <nav className="border-b bg-white/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="font-display text-xl">SweetSaas</h1>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm hover:text-primary transition-colors">
              Login
            </Link>
            <Link to="/login">
              <Button>Começar Grátis</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden bg-gradient-to-br from-pastel-white to-pastel-pink/5">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold leading-tight">
                  A gestão que seu negócio de doces e salgados precisa!
                </h1>
                <p className="text-lg text-neutral-600">
                  Gerencie suas receitas, controle seu estoque e venda mais com uma loja online profissional.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/login">
                  <Button size="lg" className="w-full sm:w-auto">
                    Teste Grátis por 7 Dias
                    <ChevronRight size={16} />
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Ver Demonstração
                </Button>
              </div>

              <div className="flex items-center gap-6 text-sm text-neutral-600">
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-primary" />
                  <span>Sem cartão de crédito</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-primary" />
                  <span>Configure em minutos</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-[4/3] bg-white rounded-xl shadow-2xl shadow-black/5 overflow-hidden">
                <img 
                  src="/placeholder.svg" 
                  alt="Dashboard do SweetSaas" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-display font-bold mb-4">
              Tudo que você precisa para crescer seu negócio
            </h2>
            <p className="text-neutral-600">
              Funcionalidades pensadas especialmente para quem trabalha com doces e salgados
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 rounded-lg bg-primary-light flex items-center justify-center mb-4">
                  <benefit.icon size={24} className="text-primary" />
                </div>
                <h3 className="text-lg font-medium mb-2">{benefit.title}</h3>
                <p className="text-neutral-600">{benefit.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 bg-gradient-to-br from-pastel-white to-pastel-blue/5">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-display font-bold mb-4">
              Comece a usar em 4 passos simples
            </h2>
            <p className="text-neutral-600">
              Do cadastro às primeiras vendas em poucos minutos
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                {index < steps.length - 1 && (
                  <ArrowRight 
                    size={24} 
                    className="absolute -right-4 top-8 text-neutral-300 hidden lg:block" 
                  />
                )}
                <div className="text-5xl font-display font-bold text-primary/10 mb-4">
                  {step.number}
                </div>
                <h3 className="text-lg font-medium mb-2">{step.title}</h3>
                <p className="text-neutral-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-white">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="bg-gradient-to-br from-primary/80 to-primary rounded-2xl p-12 text-white text-center">
            <h2 className="text-3xl font-display font-bold mb-4">
              Pronto para começar?
            </h2>
            <p className="text-white/80 mb-8 max-w-xl mx-auto">
              Junte-se a centenas de empreendedores que já estão crescendo seus negócios com o SweetSaas
            </p>
            <Link to="/login">
              <Button size="lg" variant="secondary" className="animate-fade-in">
                Começar Gratuitamente
                <ChevronRight size={16} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-900 text-white py-12">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-display text-lg mb-4">SweetSaas</h3>
              <p className="text-neutral-400 text-sm">
                A melhor solução para gestão do seu negócio de doces e salgados
              </p>
            </div>
            
            <div>
              <h4 className="font-medium mb-4">Produto</h4>
              <ul className="space-y-2 text-sm text-neutral-400">
                <li>
                  <Link to="/login" className="hover:text-white transition-colors">
                    Funcionalidades
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="hover:text-white transition-colors">
                    Preços
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="hover:text-white transition-colors">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-4">Suporte</h4>
              <ul className="space-y-2 text-sm text-neutral-400">
                <li>
                  <Link to="/login" className="hover:text-white transition-colors">
                    Central de Ajuda
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="hover:text-white transition-colors">
                    Contato
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="hover:text-white transition-colors">
                    WhatsApp
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-neutral-400">
                <li>
                  <Link to="/login" className="hover:text-white transition-colors">
                    Termos de Uso
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="hover:text-white transition-colors">
                    Privacidade
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-neutral-800 mt-12 pt-8 text-sm text-neutral-400">
            <p>© 2024 SweetSaas. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
