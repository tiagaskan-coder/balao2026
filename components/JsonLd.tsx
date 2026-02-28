import { Product } from '@/lib/utils';

type JsonLdProps = {
  data: Record<string, any> | Record<string, any>[];
};

export default function JsonLd({ data }: JsonLdProps) {
  const finalData = Array.isArray(data) 
    ? { "@context": "https://schema.org", "@graph": data }
    : data;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(finalData) }}
    />
  );
}

export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ComputerStore',
    name: 'Balão da Informática Campinas',
    image: 'https://www.balao.info/logo.png', // Ajustar se tiver URL melhor
    '@id': 'https://www.balao.info',
    url: 'https://www.balao.info',
    telephone: '+5519993916723',
    priceRange: '$$',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Av. Brasil, 1234', // Preciso confirmar o endereço real se possível
      addressLocality: 'Campinas',
      addressRegion: 'SP',
      postalCode: '13000-000', // Confirmar
      addressCountry: 'BR'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: -22.9099, // Exemplo Campinas
      longitude: -47.0626
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday'
      ],
      opens: '09:00',
      closes: '18:00'
    },
    sameAs: [
      'https://www.instagram.com/balao_informatica_campinas',
      'https://www.facebook.com/balaodainformaticacampinas'
    ]
  };
}

export function generateProductSchema(product: Product) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.image,
    description: `Comprar ${product.name} em Campinas. ${product.category}`,
    brand: {
      '@type': 'Brand',
      name: 'Genérico' // Ajustar se tiver marca no produto
    },
    offers: {
      '@type': 'Offer',
      url: `https://www.balao.info/product/${product.slug || product.id}`,
      priceCurrency: 'BRL',
      price: product.price,
      availability: 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition'
    }
  };
}

export function generateItemListSchema(products: Product[], url: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: products.map((product, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `https://www.balao.info/product/${product.slug || product.id}`,
      name: product.name
    })),
    url: url,
    numberOfItems: products.length
  };
}

export function generateBreadcrumbSchema(items: { name: string; item: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.item
    }))
  };
}
