import Container from "@/app/components/Container";
import EmptyState from "@/app/components/EmptyState";
import ClientOnly from "./components/ClientOnly";
import getListings from "@/app/actions/getListings";
import getCurrentUser from "@/app/actions/getCurrentUser";
import InfiniteListings from "@/app/components/listings/InfiniteListings";

export const dynamic = 'force-dynamic';

export interface IListingsParams {
  category?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  query?: string;
  brandSlug?: string;
}

interface HomeProps {
  searchParams: Promise<IListingsParams>
};

const Home = async ({ searchParams }: HomeProps) => {
  const resolvedSearchParams = await searchParams;
  const listings = await getListings(resolvedSearchParams);
  const currentUser = await getCurrentUser();

  if (listings.length === 0) {
    return (
      <ClientOnly>
        <EmptyState showReset />
      </ClientOnly>
    );
  }

  return (
    <ClientOnly>
      <Container>
        <InfiniteListings
          initialListings={listings}
          searchParams={resolvedSearchParams}
          currentUser={currentUser}
        />
      </Container>
    </ClientOnly>
  )
}

export default Home;
