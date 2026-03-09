import Container from "@/app/components/Container";
import EmptyState from "@/app/components/EmptyState";
import ClientOnly from "@/app/components/ClientOnly";
import searchListings from "@/app/actions/searchListings";
import getCurrentUser from "@/app/actions/getCurrentUser";
import InfiniteListings from "@/app/components/listings/InfiniteListings";

interface SearchPageProps {
  searchParams: Promise<{
    query?: string;
    category?: string;
    page?: number;
  }>;
}

const SearchPage = async ({ searchParams }: SearchPageProps) => {
  const resolvedSearchParams = await searchParams;
  const { query, category } = resolvedSearchParams;
  const currentUser = await getCurrentUser();

  if (!query || query.trim().length === 0) {
    return (
      <ClientOnly>
        <Container>
          <div className="pt-16">
            <EmptyState
              title="Search for deals"
              subtitle="Type a brand name, product, or keyword to find deals."
            />
          </div>
        </Container>
      </ClientOnly>
    );
  }

  const listings = await searchListings({ query, category });

  if (listings.length === 0) {
    return (
      <ClientOnly>
        <Container>
          <div className="pt-16">
            <EmptyState
              title={`No results for "${query}"`}
              subtitle="Try a different search term or browse by category."
              showReset
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
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-neutral-800">
              Results for &ldquo;{query}&rdquo;
            </h2>
            <p className="text-sm text-neutral-500 mt-1">
              {listings.length} deal{listings.length !== 1 ? 's' : ''} found
            </p>
          </div>
          <InfiniteListings
            initialListings={listings}
            searchParams={{ ...resolvedSearchParams, query }}
            currentUser={currentUser}
          />
        </div>
      </Container>
    </ClientOnly>
  );
};

export default SearchPage;
