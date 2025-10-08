'use client'

import { InstantSearch } from "react-instantsearch-hooks-web";
import algoliasearch from "algoliasearch"; // <-- default import
import { createInstantSearchRouterNext } from 'react-instantsearch-router-nextjs';

const searchClient = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID,
  process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY
);

const router = createInstantSearchRouterNext();

export function Providers({ children }) {
  return (
    <InstantSearch
      searchClient={searchClient}
      indexName="development_api::expert.expert"
      routing={router} 
    >
      {children}
    </InstantSearch>
  );
}
