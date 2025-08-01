// import { Card } from '@/app/ui/dashboard/cards';
import CardWrapper from '@/app/ui/dashboard/cards';
import RevenueChart from '@/app/ui/dashboard/revenue-chart';
import LatestInvoices from '@/app/ui/dashboard/latest-invoices';
import { lusitana } from '@/app/ui/fonts';
// import { fetchCardData } from '@/app/lib/data';
import { Suspense } from 'react';
import { RevenueChartSkeleton } from '@/app/ui/skeletons';
import { LatestInvoicesSkeleton } from '@/app/ui/skeletons';
import { CardsSkeleton } from '@/app/ui/skeletons';


export default async function Page() {
  // const revenue = await fetchRevenue();
  //const latestInvoices = await fetchLatestInvoices();
  // const cardData = await fetchCardData();
  // const {
  //   totalPaidInvoices,
  //   totalPendingInvoices,
  //   numberOfInvoices,
  //   numberOfCustomers,
  // } = cardData;
  //   const {
  //   numberOfInvoices,
  //   numberOfCustomers,
  //   totalPaidInvoices,
  //   totalPendingInvoices,
  // } = await fetchCardData();


  return (
    <main>
      <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        Dashboard
      </h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* {<Card title="Collected" value={totalPaidInvoices} type="collected" />}
        {<Card title="Pending" value={totalPendingInvoices} type="pending" />}
        {<Card title="Total Invoices" value={numberOfInvoices} type="invoices" />}
        {<Card
          title="Total Customers"
          value={numberOfCustomers}
          type="customers"
        />} */}
        <Suspense fallback={<CardsSkeleton />}>
          <CardWrapper />
        </Suspense>
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
        {/* <RevenueChart revenue={revenue} /> */}
         <Suspense fallback={<RevenueChartSkeleton />}>
          <RevenueChart />
        </Suspense>
         <Suspense fallback={<LatestInvoicesSkeleton />}>
          <LatestInvoices />
        </Suspense>
        {/* {<LatestInvoices latestInvoices={latestInvoices} />} */}
      </div>
    </main>
  );
}