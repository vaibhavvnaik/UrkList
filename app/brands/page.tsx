import Container from "@/app/components/Container";
import EmptyState from "@/app/components/EmptyState";
import ClientOnly from "@/app/components/ClientOnly";
import getCurrentUser from "@/app/actions/getCurrentUser";
import getAllBrands from "@/app/actions/getAllBrands";
import BrandCard from "@/app/components/brands/BrandCard";

interface BrandsPageProps {
  searchParams: Promise<{
    category?: string;
  }>;
}

const BrandsPage = async ({ searchParams }: BrandsPageProps) => {
  const resolvedSearchParams = await searchParams;
  const currentUser = await getCurrentUser();
  const brands = await getAllBrands({ category: resolvedSearchParams.category });

  if (brands.length === 0) {
    return (
      <ClientOnly>
        <Container>
          <div className="pt-16">
            <EmptyState
              title="No brands found"
              subtitle="Check back later as we add more brands."
            />
          </div>
        </Container>
      </ClientOnly>
    );
  }

  return (
    <ClientOnly>
      <Container>
        <div className="pt-16">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-neutral-800">
              All Brands
            </h1>
            <p className="text-sm text-neutral-500 mt-1">
              {brands.length} brand{brands.length !== 1 ? 's' : ''} tracked
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {brands.map((brand) => (
              <BrandCard
                key={brand.id}
                brand={brand}
                currentUser={currentUser}
              />
            ))}
          </div>
        </div>
      </Container>
    </ClientOnly>
  );
};

export default BrandsPage;
