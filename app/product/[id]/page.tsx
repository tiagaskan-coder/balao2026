import { Metadata } from 'next';
import { getProducts } from '@/lib/db';
import Header from '@/components/Header';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import ShareButton from '@/components/ShareButton';
import ProductActions from '@/components/ProductActions';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const products = await getProducts(); // Added await
  const product = products.find((p) => p.id === params.id);

  if (!product) {
    return {
      title: 'Produto não encontrado',
    };
  }

  return {
    title: `${product.name} | Balão da Informática`,
    description: `Compre ${product.name} por ${product.price}`,
    openGraph: {
      title: product.name,
      description: `Por apenas ${product.price}`,
      images: [product.image],
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: `Por apenas ${product.price}`,
      images: [product.image],
    },
  };
}

export default async function ProductPage(props: Props) {
  const params = await props.params;
  const products = await getProducts(); // Added await
  const product = products.find((p) => p.id === params.id);

  if (!product) return notFound();

  return (
     <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Header />
      <div className="container mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
                {/* Image Section */}
                <div className="relative aspect-square bg-white border border-gray-100 rounded-lg flex items-center justify-center p-4">
                    <Image 
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-contain"
                        priority
                    />
                </div>

                {/* Info Section */}
                <div className="flex flex-col">
                    <div className="mb-4">
                        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full uppercase tracking-wider font-semibold">
                            {product.category || "Hardware"}
                        </span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 leading-tight">
                        {product.name}
                    </h1>
                    
                    <div className="flex items-center gap-4 mb-6">
                        {/* Rating stars placeholder */}
                        <div className="flex text-yellow-400">
                            {'★'.repeat(5)}
                        </div>
                        <span className="text-gray-400 text-sm">(0 avaliações)</span>
                    </div>

                    <div className="mt-auto bg-gray-50 p-6 rounded-xl border border-gray-100">
                         <div className="text-[#E60012] font-black text-4xl mb-2">
                            {product.price}
                         </div>
                         <div className="text-gray-600 text-sm mb-6">
                            à vista no PIX com <strong>15% de desconto</strong>
                         </div>

                         <ProductActions product={product} />
                    </div>

                    <div className="mt-6 flex justify-end">
                         <ShareButton title={product.name} text={`Confira ${product.name} no Balão da Informática!`} />
                    </div>
                </div>
            </div>
            
            {/* Details Tab Placeholder */}
            <div className="border-t border-gray-200 p-8">
                <h2 className="text-xl font-bold mb-4">Detalhes do Produto</h2>
                <div className="prose max-w-none text-gray-600">
                    <p>
                        Aproveite a melhor tecnologia com o <strong>{product.name}</strong>. 
                        Ideal para quem busca desempenho e qualidade.
                    </p>
                    <p className="mt-4">
                        Imagens meramente ilustrativas. Todas as informações divulgadas são de responsabilidade do Fabricante/Fornecedor.
                        Verifique com os fabricantes do produto e de seus componentes eventuais limitações à utilização de todos os recursos e funcionalidades.
                    </p>
                </div>
            </div>
        </div>
      </div>
     </div>
  );
}
